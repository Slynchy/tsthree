import { Component } from "../Component";
import { Box3, Mesh } from "three";
import { BoxColliderSystem } from "../Systems/BoxColliderSystem";

export class BoxColliderComponent extends Component {

    public static readonly id: string = "BoxColliderComponent";
    protected static readonly _system: typeof BoxColliderSystem = BoxColliderSystem;
    public _box: Box3;
    public _mesh: Mesh;

    public get collider(): Box3 {
        return this._box;
    }

    onAttach(): void {
    }

    onComponentAttached(_componentId: string, _component: Component): void {
    }

    onDetach(): void {
    }

}
