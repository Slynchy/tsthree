import { Component } from "../Component";
import {
    BoxBufferGeometry,
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    OctahedronBufferGeometry,
    PlaneBufferGeometry,
    SphereBufferGeometry
} from "three";
import { Debug3DSystem } from "../Systems/Debug3DSystem";

export enum Debug3DShapes {
    SPHERE,
    CUBE,
    PLANE,
    OCTAHEDRON
}

const _DEBUG_GEOMETRY = {
    [Debug3DShapes.SPHERE]: new SphereBufferGeometry(),
    [Debug3DShapes.CUBE]: new BoxBufferGeometry(),
    [Debug3DShapes.PLANE]: new PlaneBufferGeometry(),
    [Debug3DShapes.OCTAHEDRON]: new OctahedronBufferGeometry(),
}

export class Debug3DComponent extends Component {
    public static readonly id: string = "Debug3DComponent";
    protected static readonly _system: typeof Debug3DSystem = Debug3DSystem;
    public _geometry: BufferGeometry;
    public _mesh: Mesh;

    constructor(_shape: Debug3DShapes | BufferGeometry, material?: MeshBasicMaterial) {
        super();

        switch (_shape) {
            case Debug3DShapes.SPHERE:
            case Debug3DShapes.CUBE:
            case Debug3DShapes.PLANE:
            case Debug3DShapes.OCTAHEDRON:
                this._geometry = _DEBUG_GEOMETRY[_shape];
                break;
            default:
                if (_shape instanceof BufferGeometry) {
                    this._geometry = _shape;
                } else {
                    console.warn("Debug3DComponent received unknown param %o", _shape);
                }
        }

        this._mesh = new Mesh(this._geometry, material || new MeshBasicMaterial({
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
