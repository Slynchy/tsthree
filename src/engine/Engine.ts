import { StateManager } from "./StateManager";
import { State } from "./State";
import { LoaderResource, Texture, Ticker as PIXITicker } from "pixi.js";
import { InputManager } from "./InputManager";
import { UIManager } from "./UIManager";
import { PIXILoader } from "./Loaders/PIXILoader";
import { WASMLoader } from "./Loaders/WASMLoader";
import { PIXIConfig } from "../config/PIXIConfig";
import { ENGINE_DEBUG_MODE } from "./Constants/Constants";

import { WEBGL } from "three/examples/jsm/WebGL";
import { ENGINE_ERROR } from "./ErrorCodes/EngineErrorCodes";
import { Camera, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { EffectComposer, Pass } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

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
    private readonly wasmloader: WASMLoader;
    private readonly inputManager: InputManager;
    private readonly uiManager: UIManager;
    private readonly stage: Scene;
    private readonly mainCamera: Camera;

    // DEBUG
    private readonly fpsDisplay: Stats;

    // RUNTIME PROPS
    private dt: number = 1;
    private renderPasses: Pass[] = [];

    // todo: abstract PIXIConfig
    constructor(_config: typeof PIXIConfig) {
        if (window.ENGINE) throw new Error(ENGINE_ERROR.MULTIPLE_INSTANCE);
        if (!WEBGL.isWebGLAvailable()) throw new Error(ENGINE_ERROR.WEBGL_UNSUPPORTED);
        // this.application = new PIXIApplication(_config) as unknown as Application;
        // this.renderer2d = new PIXIRenderer(PIXIConfig);
        this.renderer3d = new WebGLRenderer();
        this.renderer3d.setSize(PIXIConfig.width, PIXIConfig.height);
        this.renderer3d.setClearColor(_config.backgroundColor);
        this.effectComposer = new EffectComposer(this.renderer3d);
        this.mainCamera = new OrthographicCamera(
            -85,
            85,
            48,
            -48,
            1,
            1000
        );

        this.ticker = new PIXITicker();
        if(ENABLE_INPUT_MANAGER) {
            this.inputManager = new InputManager(this);
        }
        this.stateManager = new StateManager(this);
        this.uiManager = new UIManager(this);
        this.loader = new PIXILoader();
        this.wasmloader = new WASMLoader();
        this.stage = new Scene();

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

    public addRenderPass(_obj: Pass): void {
        this.effectComposer.addPass(_obj);
        this.renderPasses.push(_obj);
    }

    public removeRenderPass(_obj: Pass): void {
        this.effectComposer.removePass(_obj);
        const ind = this.renderPasses.findIndex((e) => e === _obj);
        if(ind === -1) {
            console.warn("Failed to remove %o because it wasn't added", _obj);
        } else {
            this.renderPasses.splice(ind, 1);
        }
    }

    get deltaTime(): number {
        return this.dt;
    }

    set deltaTime(dt: number) {
        this.dt = dt;
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

    public getTexture(key: string): Texture {
        const tex: LoaderResource = this.loader.get(key);
        if (!tex) {
            console.warn("Failed to find texture: " + key);
        }
        return (tex ? tex.texture : null);
    }

    public getUIManager(): UIManager {
        return this.uiManager;
    }

    private resize(): void {
        const elements: HTMLElement[] = [
            this.renderer3d.domElement,
            document.getElementById("click-handler"),
            document.getElementById("ui-canvas")
        ]

        let w = window.innerWidth;
        let h = window.innerHeight;
        elements.forEach((e) => {
            if(!e) {
                // add warning here?
                return;
            }
            // e.style.width = `${w}px`;
            // h = PIXIConfig.height * ( parseInt(e.style.width) / PIXIConfig.width);
            e.style.height = `${h}px`;
            w = PIXIConfig.width * ( parseInt(e.style.height) / PIXIConfig.height);
            e.style.width = `${Math.round(w)}px`;
        });
    }

    private hookResize(): void {
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    public init(_initialState: State, _bootAssets: Array<{ key: string, path: string }>): Promise<void> {
        this.renderer3d.domElement.id = "main-canvas";
        this.renderer3d.domElement.style.width = PIXIConfig.width.toString() + "px";
        this.renderer3d.domElement.style.height = PIXIConfig.height.toString() + "px";
        document.body.appendChild(this.renderer3d.domElement);
        this.addRenderPass(new RenderPass(this.stage, this.mainCamera));
        this.uiManager.init();
        this.hookResize();
        this.hideFontPreload();
        return new Promise<void>((_resolve: Function, _reject: Function): void => {
            const resolve: () => void = () => {
                this.stateManager.setState(_initialState);
                _resolve();
            }

            for (const k in _bootAssets) {
                if (!_bootAssets.hasOwnProperty(k)) continue;
                if (_bootAssets[k]) {
                    this.loader.add(_bootAssets[k].key, `./assets/${_bootAssets[k].path}`);
                }
            }
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
        this.effectComposer.render(this.deltaTime);
        // this.renderer3d.render(this.stage, this.mainCamera);
        if (ENGINE_DEBUG_MODE)
            this.fpsDisplay.end();
    }

    private hideFontPreload(): void {
        const collection: HTMLCollection =
            document.getElementsByClassName("fontPreload");

        // tslint:disable-next-line:prefer-for-of
        for (let i: number = collection.length - 1; i >= 0; i--) {
            collection[i].parentNode.removeChild(collection[i]);
        }
    }
}
