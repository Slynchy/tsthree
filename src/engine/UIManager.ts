import { Engine } from "./Engine";
import { HelperFunctions } from "./HelperFunctions";
import {
    autoDetectRenderer,
    Container as PIXIContainer,
    DisplayObject,
    Graphics,
    InteractionManager,
    Renderer as PIXIRenderer,
    Text,
    TextStyle
} from "pixi.js";
import { tsthreeConfig } from "../config/tsthreeConfig";
import { ENGINE_DEBUG_MODE } from "./Constants/Constants";
import { Easing } from "@tweenjs/tween.js";

export class UIManager {

    private canvasElement: HTMLCanvasElement;
    private renderer2d: PIXIRenderer;
    private stage: PIXIContainer;
    private engine: Engine;
    private changeDetected: boolean = false;
    private interactionManager: InteractionManager;
    private sceneObjects: unknown[] = [];
    private overlayGraphic: Graphics;

    constructor(_engine: Engine, _config: typeof tsthreeConfig) {
        this.engine = _engine;
        this.engine.getTicker().add(() => this.onStep());
        this.canvasElement = document.createElement("canvas") as HTMLCanvasElement;
        this.canvasElement.id = "ui-canvas";
        // fixme: this should probably be replaced with a CanvasRenderer so we don't use >1 webgl instances
        this.renderer2d = autoDetectRenderer({
            view: this.canvasElement,
            transparent: true,
            antialias: _config.antialias
        });

        this.interactionManager = this.renderer2d.plugins.interaction;
        this.stage = new PIXIContainer();
    }

    public static configureRenderer2d(_config: typeof tsthreeConfig, _engine: Engine, _renderer: PIXIRenderer): void {
        const context = _engine.getRenderer().getContext();
        // _renderer.resolution = (_config.devicePixelRatio);
        const w = context.canvas.width;
        const h = context.canvas.height;
        const sW = parseInt(context.canvas.style.width);
        const sH = parseInt(context.canvas.style.height);
        // _renderer.view.width = w;
        // _renderer.view.height = h;
        _renderer.resize(_config.width, _config.height);
        // this results in clipping
        // _renderer.view.style.width = sW + "px";
        // _renderer.view.style.height = sH + "px";
        // this works
        _renderer.view.style.width = Math.min(sW, window.innerWidth) + "px";
        _renderer.view.style.height = Math.min(sH, window.innerHeight) + "px";
    }

    private static hookResize(_config: typeof tsthreeConfig, _engine: Engine, _renderer: PIXIRenderer): void {
        const onResize = () => UIManager.configureRenderer2d(
            _config, _engine, _renderer
        );
        window.addEventListener('resize', onResize);
        onResize();
    }

    public getStage(): PIXIContainer {
        return this.stage;
    }

    public getRenderer(): PIXIRenderer {
        return this.renderer2d;
    }

    public getInteractionManager(): InteractionManager {
        return this.interactionManager;
    }

    public removeObject(obj: DisplayObject): void {
        const index: number = this.sceneObjects.indexOf(obj);
        if (index === -1) {
            throw new Error("Failed to find object!");
        } else {
            HelperFunctions.removeFromStage(this.stage, obj);
            this.sceneObjects.splice(index, 1);
            this.changeDetected = true;
        }
    }

    public init(_engine: Engine): void {
        // create new canvas element over top of existing one
        // create new renderer2d and bind to the above canvas element
        // ?
        // profit?
        document.body.appendChild(this.canvasElement);

        UIManager.hookResize(tsthreeConfig, _engine, this.renderer2d);

        if (ENGINE_DEBUG_MODE) {
            const debugGrid = new Graphics();
            debugGrid.lineStyle(5, 0x00FF00, 0.3, 0.5);
            debugGrid.lineTo(
                this.renderer2d.width,
                0
            );
            debugGrid.lineTo(
                this.renderer2d.width,
                this.renderer2d.height
            );
            debugGrid.lineTo(
                0,
                this.renderer2d.height
            );
            debugGrid.lineTo(
                0,
                0
            );
            debugGrid.lineTo(
                this.renderer2d.width,
                this.renderer2d.height
            );
            debugGrid.moveTo(
                0,
                this.renderer2d.height
            );
            debugGrid.lineTo(
                this.renderer2d.width,
                0
            );
            this.stage.addChild(debugGrid);
        }
    }

    /**
     * todo: fix the use of `sceneObjects` here like with the 3D scene traversal?
     * @param obj
     */
    public addObject(obj: DisplayObject): void {
        if (obj.parent === this.stage) return; // already done?
        try {
            HelperFunctions.addToStage2D(this.stage, obj);
            this.sceneObjects.push(obj);
            this.changeDetected = true;
        } catch (err) {
            console.error(err);
        }
    }

    public clear(): void {
        this.sceneObjects.length = 0;
        this.stage.children.length = 0;
        this.changeDetected = true;
        this.onStep();
    }

    public forceUpdate(): void {
        this.changeDetected = true;
    }

    public onStep(): void {
        this._update();
    }

    public showOverlay(_text?: string, _skipAnim?: boolean): void {
        if (!this.overlayGraphic) {
            const tempOverlay = new Graphics();
            tempOverlay.beginFill(0x010101, 0.85);
            tempOverlay.drawRect(0, 0, tsthreeConfig.width, tsthreeConfig.height);
            tempOverlay.endFill();
            HelperFunctions.makeInteractive(tempOverlay, true);
            this.overlayGraphic = tempOverlay;
            const text = new Text(_text || "", new TextStyle({
                fill: "#fafafa",
                fontFamily: "Baloo-Regular",
                fontSize: 30,
            }));
            text.anchor.set(0.5, 0.5);
            text.position.set(tsthreeConfig.width / 2, tsthreeConfig.height / 2);
            this.overlayGraphic.addChild(text);
        }
        this.overlayGraphic.visible = true;

        if (_skipAnim) {
            this.overlayGraphic.alpha = 1;
        } else {
            this.overlayGraphic.alpha = 0;
            HelperFunctions.TWEENAsPromise(
                this.overlayGraphic,
                "alpha",
                1,
                Easing.Quadratic.Out,
                200
            ).promise.then(() => this.overlayGraphic.alpha = 1);
        }

        this.updateOverlay(_text);
    }

    public hideOverlay(_skipAnim?: boolean): void {
        if (!this.overlayGraphic.visible) return;
        if (_skipAnim) {
            this.overlayGraphic.visible = false;
            if (this.overlayGraphic.parent) {
                this.overlayGraphic.parent.removeChild(this.overlayGraphic);
            }
        } else {
            HelperFunctions.TWEENAsPromise(
                this.overlayGraphic,
                "alpha",
                0,
                Easing.Quadratic.Out,
                200
            ).promise.then(() => {
                this.overlayGraphic.visible = false;
                if (this.overlayGraphic.parent) {
                    this.overlayGraphic.parent.removeChild(this.overlayGraphic);
                }
            });
        }
    }

    public updateOverlay(_text?: string): void {
        if (this.overlayGraphic.visible === false) return;
        if (this.overlayGraphic.parent) {
            this.overlayGraphic.parent.removeChild(this.overlayGraphic);
        }
        this.stage.addChild(this.overlayGraphic);
        // fixme: could break later
        (this.overlayGraphic.children[0] as Text).text = _text || "";
    }

    private _update(): void {
        if (this.overlayGraphic && this.overlayGraphic.visible) {
            this.updateOverlay();
        }
        // this.renderer2d.clear(); // fixme: is this clear() needed?
        this.renderer2d.render(this.stage);
        this.changeDetected = false;
    }
}
