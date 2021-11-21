import { System } from "./System";
import { Component } from "../Component";
import { GenericAnimationComponent } from "../Components/GenericAnimationComponent";


export class GenericAnimationSystem extends System {
    public static destroy(_component: Component): void {
    };

    public static onAwake(_component: GenericAnimationComponent): void {
    };

    public static onStep(_dt: number, _component: GenericAnimationComponent): void {
        if (_component.isDone) {
            if (_component._loop) {
                _component._isLooping = true;
            } else {
                return;
            }
        }

        _component.onTick(
            _dt,
            _component._progress = Math.min(
                _component._progress += (_component._speed * (_dt / 100)) * (_component._isLooping ? -1 : 1),
                1
            )
        );
    };

    public static onDestroy(_component: Component): void {
    };

    public static onEnable(_component: Component): void {
    };

    public static onDisable(_component: Component): void {
    };

    private static onDone(_component: GenericAnimationComponent): void {
        _component.parent.removeComponent(_component);
    }
}
