import { Saver } from "./Saver";
import { HelperFunctions } from "../HelperFunctions";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";
import { IData } from "../Types/IData";

export class FBInstantSaver extends Saver {

    protected _dataCache: {[key: string]: unknown};
    private _flushPromise: Promise<void>;

    clear(): Promise<void> {
        if (ENGINE_DEBUG_MODE) console.log("FBInstantSaver.clear()");
        return FBInstant.player.setDataAsync({});
    }

    load(_keysToLoad?: string[]): Promise<IData> {
        if (ENGINE_DEBUG_MODE) console.log(`FBInstantSaver.load(${_keysToLoad})`);
        return FBInstant.player.getDataAsync(_keysToLoad);
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
