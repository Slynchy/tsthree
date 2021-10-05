import { Engine } from "./Engine";
import { Container as PIXIContainer, DisplayObject, Filter } from "pixi.js";
import { GameObject } from "./GameObject";
import { HelperFunctions } from "./HelperFunctions";
import { Container } from "./Container";
import { Group, Object3D } from "three";

export class Scene {
    protected stage: Group;
    protected sceneObjects: unknown[];

    constructor() {}

    public addObject(obj: GameObject): void {
        if (!this.stage) this.createStage();
        try {
            HelperFunctions.addToStage(this.stage, obj);
            this.sceneObjects.push(obj);
        } catch (err) {
            console.error(err);
        }
    }

    public removeAllObjects(): void {
        // fixme
        // for (let i: number = this.sceneObjects.length; i >= 0; i--) {
        //     this.stage.remove(<Object3D>this.sceneObjects[i]);
        //     this.sceneObjects.pop();
        // }
    }

    /**
     * Called when adding the scene to the engine
     */
    public onApply(_engine: Engine): void {
        if (!this.stage) this.createStage();
        _engine.getStage().add(this.stage);
    }

    /**
     * Called when removing the scene from the engine
     */
    public onDestroy(_engine: Engine): void {
        this.removeAllObjects();
    }

    public onStep(_engine: Engine): void {
        for (const i of this.sceneObjects) {
            if (i && i instanceof GameObject) {
                (i as GameObject).onStep(_engine.deltaTime);
            }
        }
    }

    public render(_engine: Engine): void {
        _engine.getRenderer().render(this.stage, _engine.getMainCamera());
    }

    private createStage(): void {
        this.stage = new Group();
        this.sceneObjects = [];
    }
}
