import { Component } from "../Component";
import { Engine } from "../Engine";

export abstract class System {
    protected static _engineRef: Engine;
    protected static get engine(): Engine {
        return System._engineRef;
    }
    protected static set engine(engine) {
        System._engineRef = engine;
    }

    public static destroy(_component: Component)   : void {};

    public static onAwake(_component: Component): void {
    };

    public static onStep(_dt: number, _component: Component): void {
    };

    public static onDestroy(_component: Component): void {
    };

    public static onEnable(_component: Component)  : void {};
    public static onDisable(_component: Component) : void {};

}
