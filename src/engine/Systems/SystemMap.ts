// File is deprecated now that Systems are statically linked to component prototypes -Sam
//
// import { System } from "./System";
// import { Component } from "../Component";
//
// import { SpriteComponent } from "../Components/SpriteComponent";
// import { SpriteSystem } from "./SpriteSystem";
//
// import { Debug3DComponent } from "../Components/Debug3DComponent";
// import { Debug3DSystem } from "./Debug3DSystem";
//
// import { CameraComponent } from "../Components/CameraComponent";
// import { CameraSystem } from "./CameraSystem";
//
// import { GenericAnimationComponent } from "../Components/GenericAnimationComponent";
// import { GenericAnimationSystem } from "./GenericAnimationSystem";
//
// import { PJCarComponent } from "../../game/Components/PJCarComponent";
// import { PJCarSystem } from "../../game/Systems/PJCarSystem";
//
// import { TransformComponent } from "../Components/TransformComponent";
// import { TransformSystem } from "./TransformSystem";
//
// import { LevelEditorComponent } from "../../game/Components/LevelEditorComponent";
// import { LevelEditorSystem } from "../../game/Systems/LevelEditorSystem";
// import { LEVEL_EDIT_MODE } from "../../game/Constants/Constants";
//
// import { BoxColliderComponent } from "../Components/BoxColliderComponent";
// import { BoxColliderSystem } from "./BoxColliderSystem";
//
// import { InputRaycastComponent } from "../Components/InputRaycastComponent";
// import { InputRaycastSystem } from "./InputRaycastSystem";
//
// import { PJGridComponent } from "../../game/Components/PJGridComponent";
// import { PJGridSystem } from "../../game/Systems/PJGridSystem";
//
// import { PJEnvironmentComponent } from "../../game/Components/PJEnvironmentComponent";
// import { PJEnvironmentSystem } from "../../game/Systems/PJEnvironmentSystem";
//
// import { PJLevelRendererComponent } from "../../game/Components/PJLevelRendererComponent";
// import { PJLevelRendererSystem } from "../../game/Systems/PJLevelRendererSystem";
// import { PJUIComponent } from "../../game/Components/PJUIComponent";
// import { PJUISystem } from "../../game/Systems/PJUISystem";
//
// export const SystemMap: {
//     [key: string]: typeof System;
// } = {
//     [TransformComponent.id]: TransformSystem,
//     [SpriteComponent.id]: SpriteSystem,
//     [Debug3DComponent.id]: Debug3DSystem,
//     [CameraComponent.id]: CameraSystem,
//     [GenericAnimationComponent.id]: GenericAnimationSystem,
//     [PJCarComponent.id]: PJCarSystem,
//     [BoxColliderComponent.id]: BoxColliderSystem,
//     [InputRaycastComponent.id]: InputRaycastSystem,
//     [PJGridComponent.id]: PJGridSystem,
//     [PJEnvironmentComponent.id]: PJEnvironmentSystem,
//     [PJLevelRendererComponent.id]: PJLevelRendererSystem,
//     [PJUIComponent.id]: PJUISystem,
// };
//
// if (LEVEL_EDIT_MODE) {
//     SystemMap[LevelEditorComponent.id] = LevelEditorSystem;
// }
//
// /**
//  * @deprecated Causes circular dependencies
//  * @param _component
//  */
// export function getSystem(_component: Component): typeof System {
//     const res = SystemMap[(_component.constructor as typeof Component).id];
//     if (!res) {
//         throw new Error(`Failed to find system for component ${_component.constructor.name}`);
//     }
//     return res;
// }
