import { TransformComponent } from "../Components/TransformComponent";
import { TransformSystem } from "./TransformSystem";
import { System } from "./System";
import { Component } from "../Component";
import { SpriteComponent } from "../Components/SpriteComponent";
import { SpriteSystem } from "./SpriteSystem";
import { Debug3DComponent } from "../Components/Debug3DComponent";
import { Debug3DSystem } from "./Debug3DSystem";
import { CameraComponent } from "../Components/CameraComponent";
import { CameraSystem } from "./CameraSystem";

export const SystemMap: {
    [key: string]: typeof System;
} = {
    [TransformComponent.id]: TransformSystem,
    [SpriteComponent.id]: SpriteSystem,
    [Debug3DComponent.id]: Debug3DSystem,
    [CameraComponent.id]: CameraSystem,
};

export function getSystem(_component: Component): typeof System {
    const res = SystemMap[(_component.constructor as typeof Component).id];
    if(!res) {
        throw new Error(`Failed to find system for component ${_component.constructor.name}`);
    }
    return res;
}
