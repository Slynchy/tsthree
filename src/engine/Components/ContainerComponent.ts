import { Component } from "../Component";
import { Container as PIXIContainer, DisplayObject } from "pixi.js";
import { GameObject } from "../GameObject";
import { TransformComponent } from "./TransformComponent";
import { SpriteComponent } from "./SpriteComponent";

/**
 * @deprecated The fuck is this actually used for?
 */
export class ContainerComponent extends Component {

    // protected static readonly _system: typeof BoxColliderSystem = BoxColliderSystem;
    private _container: PIXIContainer;

    constructor() {
        super();
        this._container = new PIXIContainer();
    }

    public onAttach(): void {}

    public onDetach(): void {
        const spriteComp = this.parent.getComponent(SpriteComponent);
        if(spriteComp) {
            this._container.removeChild(spriteComp.getSpriteObj());
        }
    }

    onComponentAttached(_componentId: string, _component: Component): void {
        switch(_componentId) {
            case (_component.constructor as typeof SpriteComponent).id:
                // @ts-ignore
                (_component as TransformComponent).addReference(this._container);
                break;
        }
    }

    public get alpha(): number {
        return this._container.alpha;
    }

    public set alpha(_alpha: number) {
        this._container.alpha = _alpha;
    }

    public get x(): number {
        return this._container.x;
    }

    public set x(_x: number) {
        this._container.x = _x;
    }

    public get y(): number {
        return this._container.y;
    }

    public set y(_y: number) {
        this._container.y = _y;
    }

    /**
     * @deprecated
     * @param _child
     */
    public addChild(_child: GameObject | DisplayObject): void {
        // HelperFunctions.addToStage(this._container, _child);
    }

    public getContainer(): PIXIContainer {
        return this._container;
    }

    public onAwake(): void {

    }

    public onStep(): void {

    }

    public destroy(): void {
        if (this._container.parent) {
            this._container.parent.removeChild(this._container);
        }
        this._container.destroy({children: true});
        this._container = null;
    }
}
