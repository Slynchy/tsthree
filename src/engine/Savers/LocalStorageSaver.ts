import { Saver } from "./Saver";
import { IData } from "../Types/IData";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";

export class LocalStorageSaver extends Saver {

    protected _dataCache: object;

    clear(): Promise<void> {
        window.localStorage.clear();
        return Promise.resolve(undefined);
    }

    load(_keysToLoad?: string[]): Promise<IData> {
        const obj: { [key: string]: unknown } = {};
        for (let i = 0; i < _keysToLoad.length; i++) {
            obj[_keysToLoad[i]] = window.localStorage.getItem(_keysToLoad[i]);
        }
        return Promise.resolve(obj);
    }

    save(data: Partial<IData>): Promise<void> {
        const keys = Object.keys(data);
        for (let i = keys.length; i >= 0; i--) {
            const curr = keys[i];
            if (!data.hasOwnProperty(curr))
                keys.splice(i, 1);
            else {
                // fixme: this might break
                try {
                    window.localStorage.setItem(curr, data[curr] as string);
                    if (ENGINE_DEBUG_MODE) {
                        console.log(`[LocalStorageSaver] Saved key ${curr} with data ${data[curr]}`);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
        return Promise.resolve();
    }
}
