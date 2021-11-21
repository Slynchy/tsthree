import { GameObject } from "../GameObject";
import { DirectionalLight as ThreeDirectionalLight } from "three";

export class DirectionalLight extends GameObject {

    private _lightObj: ThreeDirectionalLight;

    constructor(color?: number, intensity?: number) {
        super();
        this._lightObj = new ThreeDirectionalLight(
            color ?? 0xfafafa,
            intensity ?? 1
        );
        this.add(this._lightObj);

        this.onDestroy().add(() => {
            this.remove(this._lightObj);
            this._lightObj.dispose();
            this._lightObj = null;
        });
    }

    // @ts-ignore
    public get castShadow(): boolean {
        return this._lightObj?.castShadow || false;
    }

    // @ts-ignore
    public set castShadow(val: boolean) {
        if (this._lightObj) {
            this._lightObj.castShadow = val;
        }
    }

    public getLightObj(): ThreeDirectionalLight {
        return this._lightObj;
    }

    onStep(_dt: number) {
        super.onStep(_dt);
    }
}
