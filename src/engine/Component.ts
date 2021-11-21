import { GameObject } from "./GameObject";

export abstract class Component {

    public static readonly id: string = "component";
    protected _parent: GameObject;

    public get parent(): GameObject {
        return this._parent;
    }

    public set parent(_parent: GameObject) {
        this._parent = _parent;
    }

    public abstract onAttach(): void;

    public abstract onDetach(): void;

    /**
     * Called when a component is added to the parent
     */
    public abstract onComponentAttached(_componentId: string, _component: Component): void;
}
