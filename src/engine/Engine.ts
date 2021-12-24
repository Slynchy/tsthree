import { StateManager } from "./StateManager";
import { State } from "./State";
import { Loader, LoaderResource, TextStyle, Texture as PIXITexture, Ticker as PIXITicker } from "pixi.js";
import { UIManager } from "./UIManager";
import { PIXILoader } from "./Loaders/PIXILoader";
import { WASMLoader } from "./Loaders/WASMLoader";
import { tsthreeConfig } from "../config/tsthreeConfig";
import { DEFAULT_CAMERA_FOV, DEFAULT_TEXTURE_B64, ENGINE_DEBUG_MODE } from "./Constants/Constants";
import { WEBGL } from "three/examples/jsm/WebGL";
import { ENGINE_ERROR } from "./ErrorCodes/EngineErrorCodes";
import {
    Camera,
    Group,
    ImageUtils,
    LinearMipMapLinearFilter,
    NearestFilter,
    OrthographicCamera,
    PerspectiveCamera,
    RepeatWrapping,
    Scene,
    Texture as ThreeTexture,
    WebGLRenderer
} from "three";
import { EffectComposer, Pass } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { BootAssets } from "../config/BootAssets";
import { OBJLoader } from "./Loaders/OBJLoader";
import { FBXLoader } from "./Loaders/FBXLoader";
import { WebfontLoaderPlugin } from "pixi-webfont-loader";
import * as TWEEN from '@tweenjs/tween.js'
import { PlatformSDK } from "./PlatformSDKs/PlatformSDK";
import { DummySDK } from "./PlatformSDKs/DummySDK";
import { FBInstantSDK } from "./PlatformSDKs/FBInstantSDK";
import { SaveHandler } from "./Savers/SaveHandler";
import { LocalStorageSaver } from "./Savers/LocalStorageSaver";
import { FBAdManager } from "./FBAdManager";
import { FBInstantSaver } from "./Savers/FBInstantSaver";
import { Saver } from "./Savers/Saver";
import { AnalyticsHandler } from "./Analytics/AnalyticsHandler";
import { FBAnalytics } from "./Analytics/FBAnalytics";
import { BaseAnalytics } from "./Analytics/BaseAnalytics";
import { IVector2 } from "./Types/IVector2";

export const DEFAULT_TEXTURE = ImageUtils.loadTexture(DEFAULT_TEXTURE_B64);

export class Engine {

    // CONST PROPS
    private readonly renderer3d: WebGLRenderer;
    private readonly effectComposer: EffectComposer;
    private readonly ticker: PIXI.Ticker;
    private readonly stateManager: StateManager;
    private readonly loader: PIXILoader;
    private readonly objLoader: OBJLoader;
    private readonly fbxLoader: FBXLoader;
    private readonly wasmloader: WASMLoader;
    private readonly uiManager: UIManager;
    private readonly stage: Scene;
    private readonly defaultTexture: ThreeTexture;
    private readonly defaultCameraType: string;
    private readonly platformSdk: PlatformSDK;
    private readonly saveHandler: SaveHandler;
    private readonly fbAdManager: FBAdManager;
    private readonly analyticsHandler: AnalyticsHandler;

    // DEBUG
    private fpsDisplay: Stats;

    // RUNTIME PROPS
    private dt: number = 1;
    private renderPasses: Pass[] = [];
    private mainCamera: Camera;
    private _scaleFactor: number = 1;

    // todo: abstract tsthreeConfig
    constructor(_config: typeof tsthreeConfig) {
        if ((window as unknown as { ENGINE: Engine }).ENGINE)
            throw new Error(ENGINE_ERROR.MULTIPLE_INSTANCE);
        if (!WEBGL.isWebGLAvailable()) throw new Error(ENGINE_ERROR.WEBGL_UNSUPPORTED);
        if (ENGINE_DEBUG_MODE && WEBGL.isWebGL2Available())
            console.log("Browser supports WebGL2");

        this.renderer3d = new WebGLRenderer({
            alpha: true,
            antialias: _config.antialias
        });
        this.effectComposer = new EffectComposer(this.renderer3d);
        this.defaultCameraType = _config.defaultCameraType;

        this.ticker = new PIXITicker();
        this.stateManager = new StateManager(this);
        this.uiManager = new UIManager(this, _config);
        Loader.registerPlugin(WebfontLoaderPlugin);
        this.loader = new PIXILoader();
        this.objLoader = new OBJLoader();
        this.fbxLoader = new FBXLoader();
        this.wasmloader = new WASMLoader();
        this.stage = new Scene();

        const analyticsModules: BaseAnalytics[] = [];
        const savers: Saver[] = [
            new LocalStorageSaver(),
        ];

        switch (_config.gamePlatform) {
            case "facebook":
                // this.platformSdk =
                this.platformSdk = new FBInstantSDK();
                this.fbAdManager = new FBAdManager({
                    fbInstantSDKRef: this.platformSdk as FBInstantSDK,
                    interstitialRetries: 0,
                    rewardedRetries: 3,
                    bannerRetries: 3
                });
                savers.push(new FBInstantSaver());
                analyticsModules.push(new FBAnalytics());
                break;
            case "none":
            default:
                this.platformSdk = new DummySDK();
                break;
        }

        this.analyticsHandler = new AnalyticsHandler(analyticsModules);

        this.saveHandler = new SaveHandler(
            savers,
            _config.getLatestData
        );

        DEFAULT_TEXTURE.wrapS = RepeatWrapping;
        DEFAULT_TEXTURE.wrapT = RepeatWrapping;
        DEFAULT_TEXTURE.repeat.set(15, 15);
        DEFAULT_TEXTURE.anisotropy = 0;
        DEFAULT_TEXTURE.magFilter = NearestFilter;
        DEFAULT_TEXTURE.minFilter = LinearMipMapLinearFilter;

        if (!_config.autoStart) {
            this.getTicker().stop();
        } else {
            this.getTicker().start();
        }

        this.getTicker().add((dt: number) => {
            return (this.deltaTime = dt)
        });
        this.getTicker().add(this.mainLoop);

        // @ts-ignore
        window.ENGINE = this;
    }

    public static configureRenderer3d(_config: typeof tsthreeConfig, _renderer: WebGLRenderer): void {
        _renderer.setPixelRatio(_config.devicePixelRatio);
        const size: IVector2 = {x: 0, y: 0};

        switch (_config.autoResize) {
            case "width":
                size.x = window.innerWidth;
                size.y = Math.floor(window.innerWidth * (_config.height / _config.width));
                break;
            case "height":
                size.x = Math.floor(window.innerHeight * (_config.width / _config.height));
                size.y = window.innerHeight;
                break;
            case "none":
                _renderer.setSize(_config.width, _config.height);
                size.x = _config.width;
                size.y = _config.height;
                break;
        }
        _renderer.setSize(
            (_config.maintainResolution ? _config.width : size.x),
            (_config.maintainResolution ? _config.height : size.y)
        );
        _renderer.context.canvas.style.width = `${size.x}px`;
        _renderer.context.canvas.style.height = `${size.y}px`;
        _renderer.setClearColor(_config.backgroundColor);
    }

    public get scaleFactor(): number {
        return this._scaleFactor;
    }

    public get platformSDK(): PlatformSDK {
        return this.platformSdk;
    }

    public getSaveHandler(): SaveHandler {
        return this.saveHandler;
    }

    public static resize(elements: HTMLElement[], _config: typeof tsthreeConfig): void {
        let w = window.innerWidth;
        let h = window.innerHeight;
        elements.forEach((e) => {
            if (!e) {
                return;
            }
            switch (tsthreeConfig.autoResize) {
                case "height":
                    e.style.height = `${Math.floor(h)}px`;
                    w = _config.width * (parseInt(e.style.height) / _config.height);
                    e.style.width = `${Math.floor(w)}px`;
                    break;
                case "width":
                    e.style.width = `${Math.floor(w)}px`;
                    h = _config.height * (parseInt(e.style.width) / _config.width);
                    e.style.height = `${Math.floor(h)}px`;
                    break;
                case "none":
                    e.style.width = `${_config.width}px`;
                    e.style.height = `${_config.height}px`;
                    break;
            }
        });
    }

    get deltaTime(): number {
        return this.dt;
    }

    set deltaTime(dt: number) {
        this.dt = dt;
    }

    public addRenderPass(_obj: Pass): void {
        this.effectComposer.addPass(_obj);
        this.renderPasses.push(_obj);
    }

    /**
     * Returns the specified texture if available, otherwise returns defaultTexture
     * @param key
     */
    public getThreeTexture(key?: string): ThreeTexture {
        // load from cache
        // otherwise:
        return this.defaultTexture;
    }

    public removeRenderPass(_obj: Pass): void {
        this.effectComposer.removePass(_obj);
        const ind = this.renderPasses.findIndex((e) => e === _obj);
        if (ind === -1) {
            console.warn("Failed to remove %o because it wasn't added", _obj);
        } else {
            this.renderPasses.splice(ind, 1);
        }
    }

    public getMainCamera(): Camera {
        return this.mainCamera;
    }

    private static hideFontPreload(): void {
        const collection: HTMLCollection =
            document.getElementsByClassName("fontPreload");

        // tslint:disable-next-line:prefer-for-of
        for (let i: number = collection.length - 1; i >= 0; i--) {
            collection[i].parentNode.removeChild(collection[i]);
        }
    }

    // tslint:disable-next-line:no-any
    public getWASM(key: string): any | null {
        return this.wasmloader.get(key) || null;
    }

    public changeState(_newState: State, _params?: unknown): void {
        this.stateManager.setState(_newState, _params);
    }

    public getRenderer(): WebGLRenderer {
        return this.renderer3d;
    }

    /**
     * Forces a frame update
     * @deprecated
     */
    public forceRender(): void {
        // this.renderer2d.render(this.stateManager.currentState.getScene().stage);
    }

    public setMaxFPS(fps: number): void {
        // Not in v5 typedef?
        // @ts-ignore
        this.ticker.maxFPS = fps;
    }

    public setBackgroundColor(_col: number, _alpha?: number): void {
        this.renderer3d.setClearColor(_col, _alpha ?? 1);
    }

    public getTicker(): PIXI.Ticker {
        return this.ticker;
    }

    public getStage(): Scene {
        return this.stage;
    }

    public getPIXIResource(key: string): LoaderResource | PIXITexture {
        const tex: LoaderResource = this.loader.get(key);
        if (!tex) {
            console.warn("Failed to find texture: " + key);
        }
        return (tex && tex.texture ? tex.texture : tex);
    }

    public getUIManager(): UIManager {
        return this.uiManager;
    }

    public loadWASM(key: string, filepath: string | string[]): Promise<void> {
        if (filepath && Array.isArray(filepath)) {
            // todo handle multiple string input
        } else {
            this.wasmloader.add(key as string, filepath as string);
        }

        // todo: return an actual value
        return this.wasmloader.load().then(() => null);
    }

    public getFBX(_key: string): Group {
        const res = (this.fbxLoader.get(_key) as Group);
        if (!res) return res;
        return res.clone ? res.clone(true) : res;
    }

    public setMainCamera(camera: Camera): void {
        this.mainCamera = camera;
        this.renderPasses.find((e) => {
            if (e instanceof RenderPass) {
                e.camera = camera;
            }
        })
    }

    public logEvent(eventName: string, valueToSum?: number, parameters?: { [key: string]: string; }): void {
        return this.analyticsHandler.logEvent(eventName, valueToSum, parameters);
    }

    public isAssetLoaded(_key: string): boolean {
        return this.objLoader.isAssetLoaded(_key) ||
            this.fbxLoader.isAssetLoaded(_key) ||
            this.loader.isAssetLoaded(_key) ||
            false;
    }

    public getOBJ(_key: string): Group {
        const res = (this.objLoader.get(_key) as Group);
        if (!res) return res;
        return res.clone ? res.clone(true) : res;
    }

    public getFont(key: string): TextStyle {
        return (this.loader.get(key) as LoaderResource)
            // @ts-ignore
            ?.styles[0] as TextStyle;
    }

    public getAdManager(): FBAdManager {
        return this.fbAdManager;
    }

    public async init(_initialState: State, _bootAssets: typeof BootAssets): Promise<void> {
        await this.platformSdk.initialize()
            .then(() => {
                // :+1:
                console.log("Platform SDK initialized");
                if (!this.platformSdk.isReady()) throw new Error();
            })
            .catch((err) => {
                console.error(err);
            });

        this.renderer3d.domElement.id = "main-canvas";
        Engine.configureRenderer3d(tsthreeConfig, this.renderer3d);
        this._scaleFactor = tsthreeConfig.width / this.renderer3d.getContext().canvas.width;
        document.body.appendChild(this.renderer3d.domElement);

        if (this.defaultCameraType === "orthographic") {
            this.mainCamera = new OrthographicCamera(
                -85,
                85,
                48,
                -48,
                1,
                1000
            );
        } else if (this.defaultCameraType === "perspective") {
            this.mainCamera = new PerspectiveCamera(
                DEFAULT_CAMERA_FOV,
                // fixme: don't use tsthreeConfig directly
                tsthreeConfig.width > tsthreeConfig.height ? tsthreeConfig.height / tsthreeConfig.width : tsthreeConfig.width / tsthreeConfig.height,
                0.3,
                1000
            );
        } else {
            throw new Error("Engine @ init() - Unknown camera type " + this.defaultCameraType);
        }

        if (ENGINE_DEBUG_MODE) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Stats = require('stats.js');
            this.fpsDisplay = new Stats();
            this.fpsDisplay.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(this.fpsDisplay.dom);

            console.log(`
this.renderer3d: %O
this.mainCamera: %O
this.ticker: %O
this.stateManager: %O
this.uiManager: %O
this.loader: %O
this.wasmloader: %O
`,
                this.renderer3d,
                this.mainCamera,
                this.ticker,
                this.stateManager,
                this.uiManager,
                this.loader,
                this.wasmloader
            );
        }

        this.addRenderPass(new RenderPass(this.stage, this.mainCamera));
        this.uiManager.init(this);
        if (tsthreeConfig.autoResize !== "none")
            this.hookResize();
        Engine.hideFontPreload();

        return this.loadAssets(_bootAssets, (p) => this.platformSdk.setLoadingProgress(p))
            .then(() => {
                if (ENGINE_DEBUG_MODE) {
                    console.log("Successfully loaded bootassets");
                }
                this.platformSdk.setLoadingProgress(100);
                return this.platformSdk.startGame();
            })
            .then(() => this.stateManager.setState(_initialState))
            .catch((err) => {
                // Fatal!
                console.error(err);
            });
    }

    private hookResize(): void {
        const onResize = () => {
            // Engine.resize(elements, tsthreeConfig);
            Engine.configureRenderer3d(tsthreeConfig, this.renderer3d);
            UIManager.configureRenderer2d(tsthreeConfig, this, this.uiManager.getRenderer());
        };
        window.addEventListener('resize', onResize);
        onResize();
    }

    public loadAssets(_bootAssets: typeof BootAssets, _onProgress?: (_prog: number) => void): Promise<void> {
        return new Promise<void>((_resolve: Function, _reject: Function): void => {
            let progress = [0, 0, 0];
            const onProgress = (e: number) => {
                return _onProgress ? _onProgress((progress[0] + progress[1] + progress[2]) / 3) : null;
            }
            let objDone: boolean = !Boolean(_bootAssets.find((e) => e.type === "obj" || e.type === "obj/mtl"));
            let fbxDone: boolean = !Boolean(_bootAssets.find((e) => e.type === "fbx"));
            const resolve: () => void = () => {
                if (!objDone || !fbxDone) {
                    // not done yet
                    setTimeout(() => resolve(), 16 * 10);
                    return;
                }
                _resolve();
            }

            for (const k in _bootAssets) {
                if (!_bootAssets.hasOwnProperty(k)) continue;
                if (_bootAssets[k]) {
                    switch (_bootAssets[k].type) {
                        case "obj/mtl":
                            this.objLoader.add(_bootAssets[k].key, `./assets/${_bootAssets[k].path}`);
                            break;
                        case "obj":
                            this.objLoader.add(
                                _bootAssets[k].key,
                                `./assets/${_bootAssets[k].path}`,
                                true
                            );
                            break;
                        case "pixi":
                            this.loader.add(_bootAssets[k].key, `./assets/${_bootAssets[k].path}`);
                            break;
                        case "fbx":
                            this.fbxLoader.add(_bootAssets[k].key, `./assets/${_bootAssets[k].path}`);
                            break;
                    }
                }
            }

            this.objLoader.load((e) => onProgress(progress[0] = e))
                .then(() => {
                    objDone = true;
                    if (ENGINE_DEBUG_MODE)
                        console.log("OBJ Loader done");
                });

            this.fbxLoader.load((e) => onProgress(progress[1] = e))
                .then(() => {
                    fbxDone = true;
                    if (ENGINE_DEBUG_MODE)
                        console.log("FBX Loader done");
                });

            this.loader.load((e) => onProgress(progress[2] = e))
                .then(resolve)
                .catch(async () => {
                    // todo: add proper retry
                    try {
                        await this.loader.load();
                        resolve();
                    } catch (err) {
                        _reject(err);
                    }
                });
        });
    }

    private readonly mainLoop: () => void = () => {
        if (ENGINE_DEBUG_MODE)
            this.fpsDisplay.begin();
        this.stateManager.onStep();
        TWEEN.update(Date.now());
        this.effectComposer.render(this.deltaTime);
        if (ENGINE_DEBUG_MODE)
            this.fpsDisplay.end();
    }
}
