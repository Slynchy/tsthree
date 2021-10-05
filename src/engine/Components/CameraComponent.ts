import { Component } from "../Component";
import { Camera } from "three";
import { TransformComponent } from "./TransformComponent";

export class CameraComponent extends Component {

    public static readonly id: string = "CameraComponent";
    private _camera: Camera;

    constructor() {
        super();
    }

    public onAttach(): void {}
    public onDetach(): void {}
    onComponentAttached(_componentId: string, _component: Component): void {}
}
