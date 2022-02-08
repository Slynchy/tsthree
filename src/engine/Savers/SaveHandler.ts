import { Saver } from "./Saver";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";
import { IData } from "../Types/IData";
import { HelperFunctions } from "../HelperFunctions";
import { tsthreeConfig } from "../../config/tsthreeConfig";
import { PlayerDataSingleton } from "../../game/Logic/PlayerDataSingleton";

export class SaveHandler {

    private readonly _getLatestData: (_data: Array<IData>) => IData;
    private readonly _savers: Saver[] = [];
    private _saveIntervalID: any = undefined;

    constructor(_savers: Saver[], _getLatestData: (_data: Array<IData>) => IData) {
        this._savers = _savers;
        this._getLatestData = _getLatestData;
    }

    private _allowedToSave: boolean = false;

    public get allowedToSave(): boolean {
        return this._allowedToSave;
    }

    public set allowedToSave(_val: boolean) {
        this._allowedToSave = _val;
        console.log("SaveHandler now " + (_val ? "" : "not ") + "allowed to save.");
        if (this.allowedToSave && Boolean(tsthreeConfig.autoSave) && !this._saveIntervalID) {
            this._saveIntervalID = setInterval(() => {
                if (PlayerDataSingleton.isDirty()) {
                    // fixme: GAME CODE IN ENGINE CODE; sorry but deadlines :(
                    this.save(PlayerDataSingleton.export())
                        .catch((err) => {
                            console.error("Failed to autosave!");
                            console.error(err);
                        });
                }
            }, tsthreeConfig.autoSave);
        }
    }

    public async save(_data: IData): Promise<void> {
        if (!this._allowedToSave) {
            return Promise.reject(new Error('SaveHandler is not currently allowed to save.'));
        }

        return new Promise<void>((resolve: Function, reject: Function) => {
            for (let i: number = 0; i < this._savers.length; i++) {
                const iCache = i;
                const curr: Saver = this._savers[i];

                curr
                    .save(_data)
                    .then((_res) => iCache === 0 ? resolve(_res) : null)
                    .catch((err) => reject(err));
            }
        });
    }

    public async load(_keysToLoad?: string[]): Promise<IData> {
        const retVal: IData[] = [];
        retVal.length = this._savers.length;

        if (ENGINE_DEBUG_MODE) {
            console.log(`[SaveHandler] Loading keys ${_keysToLoad}`);
        }

        const retry = () => {
            const promises: Array<Promise<IData>> = [];
            for (let i: number = 0; i < this._savers.length; i++) {
                promises.push(
                    this._savers[i].load(_keysToLoad).then((_data: IData) => {
                        retVal[i] = (_data);
                        return _data;
                    })
                );
            }
            return Promise.allSettled(promises);
        }

        await retry().catch((err) => {
            console.error(err);
            return HelperFunctions.wait(750).then(() => retry()).catch(() => {
                console.error(err);
                return Promise.reject(err);
            });
        });

        return this._getLatestData(retVal);
    }

    public clear(): Promise<void[]> {
        const promises: Promise<void>[] = [];
        for (let i = 0; i < this._savers.length; i++) {
            const curr = this._savers[i];
            promises.push(curr.clear());
        }
        return Promise.all(promises);
    }

}
