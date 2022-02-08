import { ILoaderReturnValue, Loader } from "./Loader";
import { Loader as _PIXILoader, LoaderResource } from "pixi.js";
import { HelperFunctions } from "../HelperFunctions";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";

export class PIXILoader extends Loader<PIXI.LoaderResource> {

    // @ts-ignore
    private loader: _PIXILoader;
    private readonly _cache: { [key: string]: PIXI.LoaderResource };
    private _currentQueue: string[] = [];

    constructor() {
        super();
        // @ts-ignore
        this.loader = new _PIXILoader();
        this._cache = {};
    }

    public add(_key: string, _asset: string): void {
        this.loader.add(
            _key,
            _asset
        );
        this._currentQueue.push(_key);
    }

    public get<T>(_key: string): T {
        // fixme
        // @ts-ignore
        return (this._cache[_key] || null);
    }

    public unload(_key: string): void {
        if (this._cache[_key])
            this._cache[_key] = undefined;
    }

    async load(
        _onProgress?: (progress: number) => void
    ): Promise<ILoaderReturnValue> {
        if (this.isLoading) {
            await HelperFunctions.waitForTruth(() => !this.isLoading);
        }
        const returnValue: ILoaderReturnValue = {};
        const queueLen = this._currentQueue.length;
        let counter = 0;
        if (queueLen === 0) return Promise.resolve(returnValue);
        this.isLoading = true;
        this._currentQueue.forEach((e) => returnValue[e] = {success: false});
        this._currentQueue = [];
        return new Promise<ILoaderReturnValue>((resolve: Function, reject: Function): void => {
            const bindingId = this.loader.onProgress.add(
                () => _onProgress((++counter / queueLen) * 100)
            );
            this.loader.load((loader: _PIXILoader, resources: { [key: string]: LoaderResource }): void => {
                for (const k in resources) {
                    if (resources[k]) {
                        // Hack (?) to fix loading spritesheet JSONs
                        if (k.lastIndexOf("_image") === k.length - ("_image".length)) {
                            returnValue[k] = {success: false};
                        }
                        returnValue[k].success = true;
                        if (ENGINE_DEBUG_MODE)
                            console.log(`Loaded PIXI asset ${resources[k].url}`);
                        this.cache(k, resources[k]);
                    } else {
                        returnValue[k].success = false;
                    }
                }
                this.loader.onProgress.detach(bindingId);
                this.isLoading = false;
                this.loader.reset();
                resolve();
            });
        });
    }

    public cache<T>(_key: string, _asset: T): void {
        if (ENGINE_DEBUG_MODE) {
            console.log("Cached PIXI asset " + _key);
        }
        // @ts-ignore
        this._cache[_key] = _asset;
    }

    public isAssetLoaded(_key: string): boolean {
        return Boolean(this._cache[_key]);
    }
}
