import { Component } from "../Component";

export abstract class System {
    public static destroy(_component: Component): void {
    };

    public static onAwake(_component: Component): void {
    };

    public static onStep(_dt: number, _component: Component): void {
    };

    public static onDestroy(_component: Component): void {
    };

    public static onEnable(_component: Component): void {
    };

    public static onDisable(_component: Component): void {
    };

}
