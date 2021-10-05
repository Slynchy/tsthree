import { Component } from "../Component";
import { SpriteComponent } from "./SpriteComponent";
import { CameraComponent } from "./CameraComponent";
import { Debug3DComponent } from "./Debug3DComponent";
import { Vector3 as Vec3, Vector2 as Vec2 } from "three";

interface IUpdateReferences {
    x: number;
    y: number;
    z: number;
    scale: Vec2 | Vec3;
    anchor: Vec2 | Vec3;
    position: Vec2 | Vec3;
    rotation: number;
}

/**
 * @deprecated GameObject inherits from Object3D which has `position`
 */
export class TransformComponent extends Component {

    public static readonly id: string = "TransformComponent";
    public divider: number = 16;
    public rotation: Vec3 = new Vec3(0,0,0);

    private readonly _references: IUpdateReferences[] = [];
    private position: Vec3 = new Vec3(0,0,0);
    private scale: Vec3 = new Vec3(1,1,1);
    private anchor: Vec3 = new Vec3(0,0,0);

    public isDirty: boolean = false;

    constructor(initialPos?: Vec3, divider?: number) {
        super();

        this.divider = divider || this.divider;

        if (initialPos) {
            this.position = initialPos;
            if (this._references) {
                this._references.forEach((e) => {
                    e.x = initialPos.x * this.divider;
                    e.y = initialPos.y * this.divider;
                });
            }
        }
    }

    public onAttach(): void {
        const spriteComponent = this.parent.getComponent(SpriteComponent);
        if(spriteComponent) {
            // @ts-ignore
            this._references.push(spriteComponent.getSpriteObj());
        }
    }

    public onComponentAttached(_componentId: string, _component: Component): void {
        switch(_componentId) {
            case Debug3DComponent.id:
                // @ts-ignore
                this._references.push(_component._mesh);
                break;
            case CameraComponent.id:
                break;
            case SpriteComponent.id:
                // @ts-ignore
                this._references.push((_component as SpriteComponent).getSpriteObj());
                break;
            case TransformComponent.id:
                // ???
                break;
        }
    }

    public onDetach(): void {
        this._references.length = 0;
    }

    public addReference(_ref: IUpdateReferences): void {
        this._references.push(_ref);
    }

    public removeReference(_ref: IUpdateReferences): void {
        const ind = this._references.indexOf(_ref);
        if(ind === -1) console.warn("Cannot remove reference; it isn't attached");
        this._references.splice(ind, 1);
    }

    public getPosition(): Vec3 {
        return this.position;
    }

    public getAnchor(): Vec3 {
        return this.anchor;
    }

    public getScale(): Vec3 {
        return this.scale;
    }

    public getReferences(): IUpdateReferences[] {
        return [...this._references];
    }

    public get x(): number {
        return this.position.x;
    }

    public set x(val: number) {
        this.position.x = val;
        this.isDirty = true;
    }

    public get y(): number {
        return this.position.y;
    }

    public set y(val: number) {
        this.position.y = val;
        this.isDirty = true;
    }

    public setAnchor(_anchor: Vec3): void {
        this.anchor = _anchor;
        this.isDirty = true;
    }

    public setScale(_scale: Vec3): void {
        this.scale = _scale;
        this.isDirty = true;
    }

    public rotate(x: number, y: number, z: number): void {
        this.rotation.set(x,y,z);
        this.isDirty = true;
    }
}
