import { Engine } from "./Engine";
import { GameObject } from "./GameObject";
import { HelperFunctions } from "./HelperFunctions";
import { Group, Object3D } from "three";

export class Scene {
    protected stage: Group;

    constructor() {}

    public addObject(obj: GameObject | Object3D): void {
        if (!this.stage) this.createStage();
        try {
            HelperFunctions.addToStage(this.stage, obj);
        } catch (err) {
            console.error(err);
        }
    }

    public removeObject(obj: GameObject): void {
        obj.removeFromParent();
    }

    public getStage(): unknown[] {
        return this.stage.children;
    }

    public destroyAllObjects(): void {
        this.stage.traverse((e) => {
            if (e instanceof GameObject) {
                e.destroy();
            }
        });
        this.stage.removeFromParent();
        this.stage = new Group();
        this.removeAllObjects();
    }

    public removeAllObjects(_destroy?: boolean): void {
        if (_destroy)
            this.stage.traverse((e: GameObject) => e.destroy ? e.destroy() : null);
        this.stage.clear();
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
        this.stage.traverse((e) => {
            if (e instanceof GameObject) {
                e.onStep(_engine.deltaTime);
            }
        });
    }

    public render(_engine: Engine): void {
        _engine.getRenderer().render(this.stage, _engine.getMainCamera());
    }

    private createStage(): void {
        this.stage = new Group();
    }
}
