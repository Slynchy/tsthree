import { GameObject } from "./GameObject";

export abstract class Component {

    public static readonly id: string = "component";
    protected parent: GameObject;

    public setParent(_parent: GameObject): void {
        this.parent = _parent;
    }

    public abstract onAttach(): void;
    public abstract onDetach(): void;

    /**
     * Called when a component is added to the parent
     */
    public abstract onComponentAttached(_componentId: string, _component: Component): void;
}
