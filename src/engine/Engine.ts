import { StateManager } from "./StateManager";
import { State } from "./State";
import { Loader, LoaderResource, TextStyle, Texture as PIXITexture, Ticker as PIXITicker } from "pixi.js";
import { InputManager } from "./InputManager";
import { UIManager } from "./UIManager";
import { PIXILoader } from "./Loaders/PIXILoader";
import { WASMLoader } from "./Loaders/WASMLoader";
import { PIXIConfig } from "../config/PIXIConfig";
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
import Resource = PIXI.resources.Resource;

declare const window: Window & {
    ENGINE: Engine;
};

const ENABLE_INPUT_MANAGER: boolean = false;

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
    private readonly inputManager: InputManager;
    private readonly uiManager: UIManager;
    private readonly stage: Scene;
    private readonly defaultTexture: ThreeTexture;
    private readonly defaultCameraType: string;

    // DEBUG
    private fpsDisplay: Stats;

    // RUNTIME PROPS
    private dt: number = 1;
    private renderPasses: Pass[] = [];
    private mainCamera: Camera;
    private _scaleFactor: number = 1;

    // todo: abstract PIXIConfig
    constructor(_config: typeof PIXIConfig) {
        if (window.ENGINE) throw new Error(ENGINE_ERROR.MULTIPLE_INSTANCE);
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
        if (ENABLE_INPUT_MANAGER) {
            this.inputManager = new InputManager(this);
        }
        this.stateManager = new StateManager(this);
        this.uiManager = new UIManager(this, _config);
        Loader.registerPlugin(WebfontLoaderPlugin);
        this.loader = new PIXILoader();
        this.objLoader = new OBJLoader();
        this.fbxLoader = new FBXLoader();
        this.wasmloader = new WASMLoader();
        this.stage = new Scene();
        this.defaultTexture = ImageUtils.loadTexture(DEFAULT_TEXTURE_B64); // fixme
        this.defaultTexture.wrapS = RepeatWrapping;
        this.defaultTexture.wrapT = RepeatWrapping;
        this.defaultTexture.repeat.set(15, 15);
        this.defaultTexture.anisotropy = 0;
        this.defaultTexture.magFilter = NearestFilter;
        this.defaultTexture.minFilter = LinearMipMapLinearFilter;

        if (!_config.autoStart) {
            this.getTicker().stop();
        } else {
            this.getTicker().start();
        }

        this.getTicker().add((dt: number) => {
            return (this.deltaTime = dt)
        });
        this.getTicker().add(this.mainLoop);

        window.ENGINE = this;
    }

    public get scaleFactor(): number {
        return this._scaleFactor;
    }

    public static configureRenderer3d(_config: typeof PIXIConfig, _renderer: WebGLRenderer): void {
        _renderer.setPixelRatio(_config.devicePixelRatio);
        switch (_config.autoResize) {
            case "width":
                _renderer.setSize(
                    window.innerWidth,
                    Math.floor(window.innerWidth * (_config.height / _config.width))
                );
                break;
            case "height":
                _renderer.setSize(
                    Math.floor(window.innerHeight * (_config.width / _config.height)),
                    window.innerHeight
                );
                break;
            case "none":
                _renderer.setSize(_config.width, _config.height);
                break;
        }
        _renderer.setClearColor(_config.backgroundColor);
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

    public loadWASM(key: string, filepath: string | string[]): Promise<void> {
        if (filepath && Array.isArray(filepath)) {
            // todo handle multiple string input
        } else {
            this.wasmloader.add(key as string, filepath as string);
        }

        // todo: return an actual value
        return this.wasmloader.load();
    }

    // tslint:disable-next-line:no-any
    public getWASM(key: string): any | null {
        return this.wasmloader.get(key) || null;
    }

    public getInputManager(): InputManager {
        return this.inputManager;
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

    public getPIXITexture(key: string): PIXITexture {
        const tex: LoaderResource = this.loader.get(key);
        if (!tex) {
            console.warn("Failed to find texture: " + key);
        }
        return (tex ? tex.texture : null);
    }

    public getUIManager(): UIManager {
        return this.uiManager;
    }

    public getOBJ(_key: string): Group {
        const res = (this.objLoader.get(_key) as Group);
        return res.clone ? res.clone(true) : res;
    }

    public getFBX(_key: string): Group {
        return (this.fbxLoader.get(_key) as Group).clone(true);
    }

    public setMainCamera(camera: Camera): void {
        this.mainCamera = camera;
        this.renderPasses.find((e) => {
            if (e instanceof RenderPass) {
                e.camera = camera;
            }
        })
    }

    public static resize(elements: HTMLElement[], _config: typeof PIXIConfig): void {
        let w = window.innerWidth;
        let h = window.innerHeight;
        elements.forEach((e) => {
            if (!e) {
                return;
            }
            switch (PIXIConfig.autoResize) {
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

    public init(_initialState: State, _bootAssets: typeof BootAssets): Promise<void> {
        this.renderer3d.domElement.id = "main-canvas";
        Engine.configureRenderer3d(PIXIConfig, this.renderer3d);
        this._scaleFactor = PIXIConfig.width / this.renderer3d.getContext().canvas.width;
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
                // fixme: don't use PIXIConfig directly
                PIXIConfig.width > PIXIConfig.height ? PIXIConfig.height / PIXIConfig.width : PIXIConfig.width / PIXIConfig.height,
                0.3,
                1000
            );
        } else {
            throw new Error("Engine.ts @ init() - Unknown camera type " + this.defaultCameraType);
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
this.inputManager: %O
this.stateManager: %O
this.uiManager: %O
this.loader: %O
this.wasmloader: %O
`,
                this.renderer3d,
                this.mainCamera,
                this.ticker,
                this.inputManager,
                this.stateManager,
                this.uiManager,
                this.loader,
                this.wasmloader
            );
        }

        this.addRenderPass(new RenderPass(this.stage, this.mainCamera));
        this.uiManager.init(this);
        if (PIXIConfig.autoResize !== "none")
            this.hookResize();
        Engine.hideFontPreload();

        return this.loadAssets(_bootAssets)
            .then(() => {
                if (ENGINE_DEBUG_MODE) {
                    console.log("Successfully loaded bootassets");
                }
                this.stateManager.setState(_initialState);
            });
    }

    public getFont(key: string): TextStyle {
        return (this.loader.get(key) as Resource)
            // @ts-ignore
            ?.styles[0] as TextStyle;
    }

    private hookResize(): void {
        const onResize = () => {
            // Engine.resize(elements, PIXIConfig);
            Engine.configureRenderer3d(PIXIConfig, this.renderer3d);
            UIManager.configureRenderer2d(PIXIConfig, this, this.uiManager.getRenderer());
        };
        window.addEventListener('resize', onResize);
        onResize();
    }

    private loadAssets(_bootAssets: typeof BootAssets): Promise<void> {
        return new Promise<void>((_resolve: Function, _reject: Function): void => {
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

            this.objLoader.load().then(() => {
                objDone = true;
                if (ENGINE_DEBUG_MODE)
                    console.log("OBJ Loader done");
            });

            this.fbxLoader.load().then(() => {
                fbxDone = true;
                if (ENGINE_DEBUG_MODE)
                    console.log("FBX Loader done");
            });

            this.loader.load()
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

    private static hideFontPreload(): void {
        const collection: HTMLCollection =
            document.getElementsByClassName("fontPreload");

        // tslint:disable-next-line:prefer-for-of
        for (let i: number = collection.length - 1; i >= 0; i--) {
            collection[i].parentNode.removeChild(collection[i]);
        }
    }
}
