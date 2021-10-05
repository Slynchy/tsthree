import { System } from "./System";
import { Component } from "../Component";
import { Engine } from "../Engine";

export class CameraSystem extends System {
    protected static _engineRef: Engine;
    protected static get engine(): Engine {
        return CameraSystem._engineRef;
    }
    protected static set engine(engine) {
        CameraSystem._engineRef = engine;
    }

    public static destroy(_component: Component)   : void {};

    public static onAwake(_component: Component)   : void {};
    public static onStep(_component: Component)    : void {};
    public static onDestroy(_component: Component) : void {};

    public static onEnable(_component: Component)  : void {};
    public static onDisable(_component: Component) : void {};
}
