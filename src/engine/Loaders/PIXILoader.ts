import { Loader } from "./Loader";
import { Loader as _PIXILoader, LoaderResource } from "pixi.js";

export class PIXILoader extends Loader<PIXI.LoaderResource> {

    // @ts-ignore
    private loader: _PIXILoader;
    private readonly _cache: {[key: string]: PIXI.LoaderResource};

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
    }

    public get<T>(_key: string): T {
        // fixme
        // @ts-ignore
        return (this._cache[_key] || null);
    }

    public unload(_key: string): void {
        if (this._cache[_key])
            delete this._cache[_key];
    }

    public load(): Promise<void> {
        return new Promise<void>((resolve: Function, reject: Function): void => {
            this.loader.load((loader: _PIXILoader, resources: { [key: string]: LoaderResource }): void => {
                for (const k in resources) {
                    if (k && resources[k]) {
                        this._cache[k] = resources[k];
                    }
                }
                resolve();
            });
        });
    }

    public cache<T>(_key: string, _asset: T): void {

    }
}
