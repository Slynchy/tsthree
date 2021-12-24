import { Component } from "./Component";
import { InteractionEvent } from "./Types/InteractionEvent";
import { HelperFunctions } from "./HelperFunctions";
import { Object3D } from "three";

// tslint:disable-next-line:no-any
type BasicClass = new (...args: any) => any;

export class GameObject extends Object3D {
    private components: Component[] = [];
    private _onDestroy: { [key: string]: Function; } = {};
    private _queuedForDestruction: boolean = false;
    private _onAddComponent: { [key: string]: Function; } = {};
    private _onRemoveComponent: { [key: string]: Function; } = {};

    constructor() {
        super();
    }

    public addComponent(_component: Component): void {
        if (this.hasComponent(_component)) {
            throw new Error("Cannot have multiple of the same component on a single GameObject!");
        }
        this.components.push(_component);
        this.components[this.components.length - 1].parent = (this);
        _component.getSystem().onAwake(_component);
        _component.onAttach();
        for(let i = 0; i < this.components.length - 1; i++) {
            this.components[i].onComponentAttached(
                (_component.constructor as typeof Component).id,
                _component
            );
        }
        this.fireEvent("_onAddComponent", _component);
    }

    public removeComponent(_component: typeof Component | Component): void {
        if (!this.hasComponent(_component)) {
            throw new Error("Could not remove component from GameObject; doesn't exist!");
        }

        for (const c in this.components) {
            if (this.components[c] === _component || this.components[c].constructor === _component) {
                this.components[c].onDetach();
                this.fireEvent(
                    "_onRemoveComponent",
                    this.components.splice(Number(c), 1)[0]
                );
                return;
            }
        }
    }

    public removeAllComponents(): void {
        for (const c in this.components) {
            this.removeComponent(this.components[c]);
        }
    }

    public onAddComponent(): InteractionEvent<Function> {
        return HelperFunctions.createInteractionEvent(this, "_onAddComponent");
    }

    public onRemoveComponent(): InteractionEvent<Function> {
        return HelperFunctions.createInteractionEvent(this, "_onRemoveComponent");
    }

    public isQueuedForDestruction(): boolean {
        return this._queuedForDestruction;
    }

    public onDestroy(): InteractionEvent<Function> {
        return HelperFunctions.createInteractionEvent(this, "_onDestroy");
    }

    public hasComponent(_component: typeof Component | Component | string): boolean {
        if(typeof _component === typeof Component) {
            return Boolean(this.components.find((e) => {
                return (e.constructor as typeof Component).id === (_component as typeof Component).id;
            }));
        } else if(_component instanceof Component) {
            return Boolean(this.components.find((e) => {
                return (e.constructor as typeof Component).id === (_component.constructor as typeof Component).id;
            }));
        } else {
            return Boolean(this.components.find((e) => {
                return (e.constructor as typeof Component).id === _component;
            }));
        }
    }

    public getComponent<T extends BasicClass>(_component: T): InstanceType<T> | null {
        for (const c of this.components) {
            if (c.constructor === _component) return c as InstanceType<T>;
        }
        return null;
    }

    public destroy(): void {
        for (const onDestroyId in this._onDestroy) {
            if (this._onDestroy.hasOwnProperty(onDestroyId)) {
                this._onDestroy[onDestroyId]();
            }
        }
        this._onDestroy = null;
        for (const comp of this.components) {
            comp.getSystem().destroy(comp);
        }
        this.removeAllComponents();
        this.traverse((e) => {
            if (e === this) return;
            // @ts-ignore
            if (e.destroy)
                // @ts-ignore
                e.destroy();
        })
        this.components.length = 0;
        this._queuedForDestruction = true;
    }

    public onStep(_dt: number): void {
        for (const component of this.components) {
            component.getSystem().onStep(_dt, component);
        }
    }

    // tslint:disable-next-line:no-any
    private fireEvent(key: string, ...params: any[]): void {
        // @ts-ignore
        for (const ev in (this[key]) as { [key: string]: Function; }) {
            // @ts-ignore
            if( this[key][ev] ) {
                // @ts-ignore
                this[key][ev](params);
            }
        }
    }
}
