import { Component } from "../Component";
import {
    SphereGeometry,
    BoxGeometry,
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    OctahedronGeometry
} from "three";

export enum Debug3DShapes {
    SPHERE,
    CUBE,
    PLANE,
    OCTAHEDRON
}

export class Debug3DComponent extends Component {
    public readonly id: string = "Debug3DComponent";
    private _geometry: BufferGeometry;
    private _mesh: Mesh;

    constructor(_shape: Debug3DShapes) {
        super();

        switch(_shape) {
            case Debug3DShapes.SPHERE:
                this._geometry = new SphereGeometry();
                break;
            case Debug3DShapes.CUBE:
                this._geometry = new BoxGeometry();
                break;
            case Debug3DShapes.PLANE:
                this._geometry = new PlaneGeometry();
                break;
            case Debug3DShapes.OCTAHEDRON:
                this._geometry = new OctahedronGeometry();
                break;
        }

        this._mesh = new Mesh( this._geometry, new MeshBasicMaterial( {
            color: 0xFFFFFF
        }));
    }

    public getMesh(): Mesh {
        return this._mesh;
    }

    onAttach(): void {
    }

    onComponentAttached(_componentId: string, _component: Component): void {
    }

    onDetach(): void {
    }
}
