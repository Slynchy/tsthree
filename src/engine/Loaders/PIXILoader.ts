import { Loader } from "./Loader";
import { Loader as _PIXILoader, LoaderResource } from "pixi.js";

export class PIXILoader extends Loader {

    // @ts-ignore
    private loader: _PIXILoader;
    private readonly cache: {[key: string]: LoaderResource};

    constructor() {
        super();
        // @ts-ignore
        this.loader = new _PIXILoader();
        this.cache = {};
    }

    public add(_key: string, _asset: string): void {
        this.loader.add(
            _key,
            _asset
        );
    }

    public get<T>(_key: string): T {
        return (this.cache[_key] || null) as unknown as T;
    }

    public load(): Promise<void> {
        return new Promise<void>((resolve: Function, reject: Function): void => {
            this.loader.load((loader: _PIXILoader, resources: {[key: string]: LoaderResource}): void => {
                for (const k in resources) {
                    if (k && resources[k]) {
                        this.cache[k] = resources[k];
                    }
                }
                resolve();
            });
        });
    }
}
