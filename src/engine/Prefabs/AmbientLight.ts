import { GameObject } from "../GameObject";
import { AmbientLight as ThreeAmbientLight } from "three";

export class AmbientLight extends GameObject {

    private _lightObj: ThreeAmbientLight;

    constructor(color?: number, intensity?: number) {
        super();
        this._lightObj = new ThreeAmbientLight(
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
