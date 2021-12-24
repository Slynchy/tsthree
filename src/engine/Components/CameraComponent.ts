import { Component } from "../Component";
import { Camera } from "three";
import { CameraSystem } from "../Systems/CameraSystem";

/**
 * @deprecated
 */
export class CameraComponent extends Component {

    public static readonly id: string = "CameraComponent";
    protected static readonly _system: typeof CameraSystem = CameraSystem;
    private _camera: Camera;

    constructor() {
        super();
    }

    public onAttach(): void {}

    public onDetach(): void {}

    onComponentAttached(_componentId: string, _component: Component): void {}
}
