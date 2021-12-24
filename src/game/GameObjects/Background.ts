import { GameObject } from "../../engine/GameObject";
import { Debug3DComponent, Debug3DShapes } from "../../engine/Components/Debug3DComponent";
import { Color, LineBasicMaterial, MeshBasicMaterial } from "three";
import { lerp } from "three/src/math/MathUtils";
import { HelperFunctions } from "../../engine/HelperFunctions";
import * as TWEEN from "@tweenjs/tween.js";

const DEFAULT_SIZE = 5;

export class Background extends GameObject {

    private minScale: number = DEFAULT_SIZE;
    public speed: number = 0;

    private mainShape: GameObject;
    private secondShape: GameObject;

    public animateRotation: boolean = false;

    constructor() {
        super();

        const obj1: GameObject = new GameObject();
        obj1.addComponent(new Debug3DComponent(Debug3DShapes.OCTAHEDRON));
        obj1.getComponent(Debug3DComponent).getMesh().material = new MeshBasicMaterial({
            color: 0xfa3333,
            wireframe: true
        });
        this.mainShape = obj1;
        this.add(obj1);

        const obj2: GameObject = new GameObject();
        obj2.addComponent(new Debug3DComponent(Debug3DShapes.OCTAHEDRON));
        obj2.getComponent(Debug3DComponent).getMesh().material = new MeshBasicMaterial({
            color: 0xfa3333,
            wireframe: true
        });
        obj2.scale.set(this.minScale * 0.4, this.minScale * 0.4, this.minScale * 0.4);
        this.secondShape = obj2;
        this.add(obj2);

        this.position.setZ(-100);
    }

    public pulse(): void {
        this.minScale = Math.min(25, this.minScale + 1);
        this.scale.set(
            this.minScale * 1.6,
            this.minScale * 1.6,
            this.minScale * 1.6
        );
        this.mainShape.getComponent(Debug3DComponent).getMesh().material
            // @ts-ignore
            .color.set(0x33fa33)
    }

    public async rotate(): Promise<void> {
        await HelperFunctions.TWEENVec3AsPromise(
            this.rotation,
            {x: Math.PI / 2, y: this.rotation.y, z: this.rotation.z},
            TWEEN.Easing.Linear.None
        ).promise;
        await HelperFunctions.TWEENVec3AsPromise(
            this.rotation,
            {x: this.rotation.x, y: Math.PI / 2, z: this.rotation.z},
            TWEEN.Easing.Linear.None
        ).promise;
        return;
    }

    public reset(): void {
        this.scale.set(this.minScale * 0.8, this.minScale * 0.8, this.minScale * 0.8);
        this.minScale = DEFAULT_SIZE;
        this.mainShape.getComponent(Debug3DComponent).getMesh().material
            // @ts-ignore
            .color = new Color(0xfa3333);
    }

    onStep(_dt: number) {
        super.onStep(_dt);

        const scale = lerp(this.scale.x, this.minScale, 0.065 * _dt);
        this.scale.set(scale, scale, scale);

        // @ts-ignore
        this.mainShape.getComponent(Debug3DComponent).getMesh().material.color.lerpColors(
            // @ts-ignore
            this.mainShape.getComponent(Debug3DComponent).getMesh().material.color,
            new Color(0xfa3333),
            0.01 * _dt
        );

        if(this.speed > 0) {
            this.speed = lerp(this.speed, 0.05, 0.01 * ( _dt));
            this.secondShape.rotateX(0.04 * this.speed * _dt );
            this.secondShape.rotateY(-0.03 * this.speed * _dt);
            this.secondShape.rotateZ(0.02 * this.speed * _dt);
            this.mainShape.rotateX(0.05 * this.speed * _dt );
            this.mainShape.rotateY(-0.04 * this.speed * _dt);
            this.mainShape.rotateZ(0.03 * this.speed * _dt);
        }
    }
}
