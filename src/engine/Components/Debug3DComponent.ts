import { Component } from "../Component";
import {
    BoxGeometry,
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    OctahedronGeometry,
    PlaneGeometry,
    SphereGeometry
} from "three";
import { Debug3DSystem } from "../Systems/Debug3DSystem";

export enum Debug3DShapes {
    SPHERE,
    CUBE,
    PLANE,
    OCTAHEDRON
}

export class Debug3DComponent extends Component {
    public static readonly id: string = "Debug3DComponent";
    protected static readonly _system: typeof Debug3DSystem = Debug3DSystem;
    private _geometry: BufferGeometry;
    private _mesh: Mesh;

    constructor(_shape: Debug3DShapes | BufferGeometry, material?: MeshBasicMaterial) {
        super();

        switch (_shape) {
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
