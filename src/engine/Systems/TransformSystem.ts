import { System } from "./System";
import { TransformComponent } from "../Components/TransformComponent";
import { Engine } from "../Engine";
import { Mesh } from "three";

export class TransformSystem extends System {
    protected static _engineRef: Engine;
    protected static get engine(): Engine {
        return TransformSystem._engineRef;
    }
    protected static set engine(engine) {
        TransformSystem._engineRef = engine;
    }

    public static destroy(_component: TransformComponent): void {
        // TransformSystem.onDestroy(_component);
    }

    public static onStep(_component: TransformComponent): void {
        this.updateReferences(_component);
    }

    private static updateReferences(_component: TransformComponent): void {
        if(!_component.isDirty) return;

        const _refs = _component.getReferences();
        if (_refs) {
            _refs.forEach((e) => {
                const pos = _component.getPosition();
                const anchor = _component.getAnchor();
                const scale = _component.getScale();
                if(e instanceof Mesh) {
                    e.position.x = pos.x * _component.divider;
                    e.position.y = pos.y * _component.divider;
                    // e.setRotationFromEuler(_component.rotation);
                    e.scale.x = scale.x;
                    e.scale.y = scale.y;
                    if(_component.rotation.x)
                        e.rotateX(_component.rotation.x);
                    if(_component.rotation.y)
                        e.rotateY(_component.rotation.y);
                    if(_component.rotation.z)
                        e.rotateZ(_component.rotation.z);
                    _component.rotation.set(0,0,0);
                    return;
                }
                e.x = pos.x * _component.divider;
                e.y = pos.y * _component.divider;
                // e.rotation = _component.rotation;
                e.anchor.x = anchor.x;
                e.anchor.y = anchor.y;
                e.scale.x = scale.x;
                e.scale.y = scale.y;
            })
        }

        _component.isDirty = false;
    }
}
