import { System } from "./System";
import { Component } from "../Component";
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { BoxColliderComponent } from "../Components/BoxColliderComponent";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";

export class BoxColliderSystem extends System {

    constructor() {
        super();
    }

    public static destroy(_component: Component): void {
    };

    public static onAwake(_component: BoxColliderComponent): void {
        _component._box = new Box3();
        _component._mesh = new Mesh(new BoxGeometry(
            1, 1, 1, 1, 1, 1
        ));
        _component._mesh.visible = ENGINE_DEBUG_MODE;
        if (ENGINE_DEBUG_MODE) {
            _component._mesh.material = new MeshBasicMaterial({color: "red", transparent: true, opacity: 0.5})
        }
        _component._mesh.geometry.computeBoundingBox();
        // @ts-ignore
        _component._parent
            .add(_component._mesh);
        BoxColliderSystem.updateMatrices(_component);
    };

    public static onStep(_dt: number, _component: BoxColliderComponent): void {
        BoxColliderSystem.updateMatrices(_component);
    };

    public static onDestroy(_component: BoxColliderComponent): void {
        _component._mesh.removeFromParent();
        _component._box = null;
    };

    private static updateMatrices(_component: BoxColliderComponent): void {
        _component._box.copy(_component._mesh.geometry.boundingBox).applyMatrix4(_component._mesh.matrixWorld);
    }
}
