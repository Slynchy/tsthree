import { GameObject } from "../../engine/GameObject";
import { Debug3DComponent, Debug3DShapes } from "../../engine/Components/Debug3DComponent";
import { Color, LineBasicMaterial, Material, MeshBasicMaterial, MeshPhongMaterial, Vector3 } from "three";

const spawn_area = {x: 125, y: 0, z: 20};
// const sphere_scale = 3;
const sphere_speed = 0.8;
export const max_sphere_scale = 6.0;
export const min_sphere_scale = 3.0;

enum SPHERE_STATES {
    DEFAULT,
    EXPLODING,
    EXPLODED
}

enum DIRECTIONS {
    DOWN,
    UP,
    RIGHT,
    LEFT,
    NUM_OF_DIRECTIONS
}

export class TargetSphere extends GameObject {

    public active: boolean = false;

    public direction: DIRECTIONS = DIRECTIONS.DOWN;

    public explodingState: SPHERE_STATES = SPHERE_STATES.DEFAULT;

    private _d3dcomp: Debug3DComponent = null;

    private _scale: Vector3 = new Vector3(max_sphere_scale, max_sphere_scale, max_sphere_scale);

    // private _explodeMaterial: LineBasicMaterial = new LineBasicMaterial({
    //     color: 0xfa2121,
    //     linewidth: 10
    // })

    constructor() {
        super();

        this.addComponent(this._d3dcomp = new Debug3DComponent(Debug3DShapes.SPHERE));
        this.getComponent(Debug3DComponent).getMesh().material = new MeshBasicMaterial({
            transparent: true,
            color: 0xffffffff,
            // linewidth: 0.1
        });

        this.scale.set(max_sphere_scale, max_sphere_scale, max_sphere_scale);
        this.position.set(0,300, 0);
    }

    public canRespawn(): boolean {
        return this.position.y < -70 ||
            this.explodingState === SPHERE_STATES.EXPLODED ||
            this.position.x > 120 ||
            this.position.x < -120 ||
            this.position.y > 70;
    }

    public canExplode(): boolean {
        return this.active && this.explodingState === SPHERE_STATES.DEFAULT;
    }

    public explode(): void {
        console.log("explode");
        // this.visible = false;
        // @ts-ignore
        this._d3dcomp.getMesh().material.color = new Color(0xfa2121);
        // @ts-ignore
        this._d3dcomp.getMesh().material.wireframe = true;
        this._d3dcomp.getMesh().material
            // @ts-ignore
            .opacity = 0.7;
        this.scale.set(
            this.scale.x * 1.2,
            this.scale.y * 1.2,
            this.scale.z * 1.2,
        );
        this.explodingState = SPHERE_STATES.EXPLODING;
    }

    private randomisePosition(): void {
        this.position.setZ((Math.random() * spawn_area.z) - (spawn_area.z) / 2);
        const scale = min_sphere_scale + Math.random() * (max_sphere_scale - min_sphere_scale);
        this.scale.set(scale, scale, scale);

        this.direction = Math.floor(Math.random() * DIRECTIONS.NUM_OF_DIRECTIONS);
        switch(this.direction) {
            case DIRECTIONS.LEFT:
                this.position.setX(100);
                this.position.setY(
                    (Math.random() * 50) - (50) / 2
                );
                break;
            case DIRECTIONS.RIGHT:
                this.position.setX(-100);
                this.position.setY(
                    (Math.random() * 50) - (50) / 2
                );
                break;
            case DIRECTIONS.UP:
                this.position.setX((Math.random() * spawn_area.x) - (spawn_area.x) / 2);
                this.position.setY(-60);
                break;
            case DIRECTIONS.DOWN:
            default:
                this.position.setX((Math.random() * spawn_area.x) - (spawn_area.x) / 2);
                this.position.setY(
                    ((Math.random() * spawn_area.y)
                        - (spawn_area.y) / 2) + 60
                );
                break;
        }
    }

    public reset(): void {
        this.position.setY(60);
        this.getComponent(Debug3DComponent).getMesh().material
            // @ts-ignore
            .wireframe = false;
        // @ts-ignore
        this.getComponent(Debug3DComponent).getMesh().material.color.set(0xffffff);
        this.scale.set(max_sphere_scale, max_sphere_scale, max_sphere_scale);
        this._d3dcomp.getMesh().material
            // @ts-ignore
            .opacity = 1;
        this.randomisePosition();
    }

    onStep(_dt: number) {
        super.onStep(_dt);

        if(!this.active) return;

        if(this.explodingState === SPHERE_STATES.EXPLODING) {
            this.scale.set(
                this.scale.x + (0.45 * _dt),
                this.scale.y + (0.45 * _dt),
                this.scale.z + (0.45 * _dt),
            );
            this.position.setZ(this.position.z += (0.09 * _dt));

            this._d3dcomp.getMesh().material
                // @ts-ignore
                .opacity -= 0.02 * _dt;

            if(this._d3dcomp.getMesh().material
                // @ts-ignore
                .opacity <= 0
            ) {
                this.explodingState = SPHERE_STATES.EXPLODED;
                this.active = false;
                this.reset();
            }
        }

        this.rotateX(0.03 * _dt);
        this.rotateY(0.03 * _dt);
        this.rotateZ(-0.03 * _dt);

        if(this.canRespawn()) {
            this.active = false;
            this.explodingState = SPHERE_STATES.DEFAULT;
        } else if (this.explodingState !== SPHERE_STATES.EXPLODING) {
            let x = this.position.x, y = this.position.y;
            switch(this.direction) {
                case DIRECTIONS.LEFT:
                    x = this.position.x - (sphere_speed * _dt);
                    break;
                case DIRECTIONS.RIGHT:
                    x = this.position.x + (sphere_speed * _dt);
                    break;
                case DIRECTIONS.UP:
                    y = this.position.y + (sphere_speed * _dt);
                    break;
                default:
                case DIRECTIONS.DOWN:
                    y = this.position.y - (sphere_speed * _dt);
                    break;
            }
            this.position.setX(x);
            this.position.setY(y);
        }
    }
}
