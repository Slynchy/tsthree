import { Saver } from "./Saver";
import { HelperFunctions } from "../HelperFunctions";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";
import { IData } from "../Types/IData";
import { SAVE_KEYS } from "../Constants/SaveKeys";

export class FBInstantSaver extends Saver {

    protected _dataCache: object;
    private _flushPromise: Promise<void>;

    clear(): Promise<void> {
        const keys: string[] = Object.keys(SAVE_KEYS);
        const obj: { [key: string]: null } = {};
        for (let i = 0; i < keys.length; i++) {
            // @ts-ignore
            obj[SAVE_KEYS[keys[i]]] = null;
        }
        if (ENGINE_DEBUG_MODE) console.log("FBInstantSaver.clear(%o)", obj);
        return FBInstant.player.setDataAsync(obj);
    }

    load(_keysToLoad?: string[]): Promise<IData> {
        if (ENGINE_DEBUG_MODE) console.log(`FBInstantSaver.load(${_keysToLoad})`);
        return FBInstant.player.getDataAsync(_keysToLoad).then((data: IData) => {
            if (ENGINE_DEBUG_MODE)
                console.log(data);
            return data;
        });
    }

    save(data: Partial<IData>): Promise<void> {
        if (ENGINE_DEBUG_MODE) console.log("FBInstantSaver.save(%o)", data);
        return FBInstant.player.setDataAsync(data).then(async () => {
            if (!this._flushPromise) {
                this._flushPromise = this.flushData();
            }
            await this._flushPromise
        });
    }

    private async flushData(): Promise<void> {
        if (ENGINE_DEBUG_MODE) console.log("FBInstantSaver.flushData()");
        await HelperFunctions.wait(750);
        return FBInstant.player.flushDataAsync();
    }

}
