import { Engine } from "./Engine";
import { HelperFunctions } from "./HelperFunctions";
import { Container as PIXIContainer, DisplayObject, Renderer as PIXIRenderer } from "pixi.js";
import { PIXIConfig } from "../config/PIXIConfig";

export class UIManager {

    public readonly width: number;
    public readonly height: number;
    private canvasElement: HTMLCanvasElement;
    private renderer2d: PIXIRenderer;
    private stage: PIXIContainer;
    private engine: Engine;
    private changeDetected: boolean = false;
    private sceneObjects: unknown[] = [];

    constructor(_engine: Engine) {
        this.engine = _engine;
        this.engine.getTicker().add(() => this.onStep());
        this.canvasElement = document.createElement("canvas") as HTMLCanvasElement;
        this.canvasElement.id = "ui-canvas";
        // todo: this should probably be replaced with a CanvasRenderer so we don't use >1 webgl instances
        this.renderer2d = new PIXIRenderer({
            view: this.canvasElement,
            transparent: true,
            width: this.width = PIXIConfig.width,
            height: this.height = PIXIConfig.height,
            antialias: true
        });
        this.renderer2d.view.style.width = PIXIConfig.width.toString() + "px";
        this.renderer2d.view.style.height = PIXIConfig.height.toString() + "px";
        this.stage = new PIXIContainer();
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

    public init(): void {
        // create new canvas element over top of existing one
        // create new renderer2d and bind to the above canvas element
        // ?
        // profit?
        document.body.appendChild(this.canvasElement);
    }

    public addObject(obj: DisplayObject): void {
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

    private _update(): void {
        this.renderer2d.clear();
        this.renderer2d.render(this.stage);
        this.changeDetected = false;
    }
}
