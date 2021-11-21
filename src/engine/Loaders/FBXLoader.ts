import { FBXLoader as ThreeFBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Loader } from "./Loader";
import { Group } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { LoaderStatus } from "./LoaderStatus";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";
import MaterialCreator = MTLLoader.MaterialCreator;

const DEBUG_MODE: boolean = ENGINE_DEBUG_MODE;

export interface IFBXLoaderProgress {
    status: LoaderStatus,
    result: unknown,
    path: string,
    type: "fbx",
    loader: ThreeFBXLoader
}

export class FBXLoader extends Loader<Group> {

    private activeQueueProgress: { [key: string]: IFBXLoaderProgress };
    private readonly _cache: { [key: string]: Group | MTLLoader.MaterialCreator } = {};

    constructor() {
        super();
        this.activeQueueProgress = {};
    }

    add(_key: string, _asset: string): void {
        if(this.existsInCache(_key)) {
            FBXLoader.log(`Resource attempted to be added with key ${_key} is already in cache`);
        }
        FBXLoader.log(`Adding ${_key}...`);
        this.activeQueueProgress[_key] = {
            status: LoaderStatus.LOADING,
            result: null,
            path: _asset,
            type: "fbx",
            loader: new ThreeFBXLoader()
        };
    }

    get<T>(_key: string): T {
        // fixme: I think I got confused with TS here; I think <T> needs adding to the class name
        return this._cache[_key] as unknown as T;
    }

    _reset(): void {
        this.activeQueueProgress = {};
    }

    unload(_key: string): void {
        if (this._cache[_key])
            delete this._cache[_key];
    }

    load(): Promise<void> {
        return new Promise<void>((_resolve, _reject) => {
            const resolve: () => void = () => {
                const keys = Object.keys(this.activeQueueProgress);
                const len = keys
                    .map((e) => this.activeQueueProgress[e])
                    .filter((e) => e.status === LoaderStatus.SUCCESS || e.status === LoaderStatus.ERROR)
                    .length;

                if (len !== Object.keys(this.activeQueueProgress).length) {
                    // not done yet
                    setTimeout(() => resolve(), 100);
                    FBXLoader.log("Waiting to load more");
                    return;
                } else {
                    FBXLoader.log("Done loading");
                }

                // donezo
                keys.forEach((e) => {
                    if (
                        this.activeQueueProgress[e].result &&
                        this.activeQueueProgress[e].status === LoaderStatus.SUCCESS
                    ) {
                        this.cache(e, this.activeQueueProgress[e].result);
                    }
                });

                this._reset();
                _resolve();
            }

            Object.keys(this.activeQueueProgress).forEach((_key: string) => {
                const fbxLoaderProgress = (this.activeQueueProgress[_key]);
                this.loadResource(fbxLoaderProgress)
                    .then(() => FBXLoader.log(`Loaded FBX ${fbxLoaderProgress.path}`))
                    .then(() => resolve())
                    .catch((err) => {
                        console.error(err);
                    });
            });
        })
    }

    cache<T>(_key: string, _asset: T): void {
        this._cache[_key] = _asset as unknown as Group;
    }

    private static log(str: string): void {
        if (DEBUG_MODE)
            console.log(str);
    }

    private loadResource(obProg: IFBXLoaderProgress): Promise<Group | MaterialCreator> {
        return new Promise((resolve, reject) => {
            const _loader: ThreeFBXLoader = obProg.loader;

            _loader.load(
                obProg.path,
                (e) => {
                    obProg.result = e;
                    obProg.status = LoaderStatus.SUCCESS;
                    resolve(e);
                },
                () => {
                    obProg.status = LoaderStatus.LOADING;
                },
                (err) => {
                    obProg.status = LoaderStatus.ERROR
                    obProg.result = err;
                    reject(err);
                }
            );
        });
    }

    private existsInCache(_key: string): boolean {
        return Boolean(this._cache[_key]);
    }


}