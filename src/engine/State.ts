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

    public abstract onStep(_engine: Engine): void;

    /**
     * Remember to delete objects in your override function here!
     * @param engine
     */
    public abstract onDestroy(engine: Engine): void;
}
