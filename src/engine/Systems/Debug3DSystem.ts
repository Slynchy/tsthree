import { System } from "./System";
import { Component } from "../Component";
import { Engine } from "../Engine";
import { Debug3DComponent } from "../Components/Debug3DComponent";


export class Debug3DSystem extends System {
    protected static _engineRef: Engine;
    protected static get engine(): Engine {
        return Debug3DSystem._engineRef;
    }
    protected static set engine(engine) {
        Debug3DSystem._engineRef = engine;
    }

    public static destroy(_component: Component)   : void {};

    public static onAwake(_component: Debug3DComponent): void {
        // @ts-ignore
        _component.parent.add(_component._mesh);
    };

    public static onStep(_dt: number, _component: Component): void {

    };

    public static onDestroy(_component: Debug3DComponent): void {
        // @ts-ignore
        _component.parent.remove(_component._mesh);
    };

    public static onEnable(_component: Component)  : void {};
    public static onDisable(_component: Component) : void {};
}
