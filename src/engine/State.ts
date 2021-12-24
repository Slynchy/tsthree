import { Engine } from "./Engine";
import { Scene } from "./Scene";

declare const window: Window & {
    ENGINE: Engine
};

interface StateConfig {
    scene?: Scene;
}

/**
 * Base class
 */
export abstract class State {
    protected scene: Scene;

    constructor(_config?: StateConfig) {
        this.scene = _config?.scene || new Scene();
    }

    public getScene(): Scene {
        return this.scene;
    }

    public abstract onAwake(_engine: Engine, _params?: unknown): void;

    public onStep(_engine: Engine): void {
        if (this.scene) this.scene.onStep(_engine);
    };

    public abstract preload(_engine: Engine): Promise<void>;

    /**
     * Remember to delete objects in your override function here!
     * @param engine
     */
    public abstract onDestroy(_engine: Engine): void;
}
