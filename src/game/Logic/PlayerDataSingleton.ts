import { SAVE_KEYS } from "../../engine/Constants/SaveKeys";

class PlayerDataSingletonClass {

    // Data

    // Properties
    private _initialized: boolean = false;
    private _dirty: Array<SAVE_KEYS> = [];

    constructor() {}

    public isDirty(): boolean {
        return this._dirty.length > 0;
    }

    public export(_exportAll: boolean = false): { [key: string]: unknown } {
        const retVal: { [key: string]: unknown } = {};

        // if (_exportAll || this._dirty.indexOf(SAVE_KEYS.PLACEHOLDER) !== -1)
        //     retVal[SAVE_KEYS.PLACEHOLDER] = this._something.toString();

        this._dirty = [];

        return retVal;
    }
}

export const PlayerDataSingleton = new PlayerDataSingletonClass();
