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

    onStep(_dt: number) {
        super.onStep(_dt);
    }
}
