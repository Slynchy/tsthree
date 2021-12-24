import { OBJLoader as ThreeOBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { ILoaderReturnValue, Loader } from "./Loader";
import { Group } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { LoaderStatus } from "./LoaderStatus";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";
import MaterialCreator = MTLLoader.MaterialCreator;

const DEBUG_MODE: boolean = ENGINE_DEBUG_MODE;

export interface IOBJLoaderProgress {
    status: LoaderStatus,
    result: unknown,
    path: string,
    type: "mtl" | "obj" | "obj/mtl",
    loader: ThreeOBJLoader | MTLLoader
}

export class OBJLoader extends Loader<Group> {

    private activeQueueProgress: { [key: string]: IOBJLoaderProgress };
    private readonly _cache: { [key: string]: Group | MTLLoader.MaterialCreator } = {};

    constructor() {
        super();
        this.activeQueueProgress = {};
    }

    add(_key: string, _asset: string, _skipMtl?: boolean): void {
        if (this.existsInCache(_key)) {
            OBJLoader.log(`Resource attempted to be added with key ${_key} is already in cache`);
        }
        OBJLoader.log(`Adding ${_key}...`);
        this.activeQueueProgress[_key] = {
            status: LoaderStatus.LOADING,
            result: null,
            path: _asset,
            type: _skipMtl ? "obj" : "obj/mtl",
            loader: new ThreeOBJLoader()
        };

        if (!_skipMtl && _asset.indexOf(".obj") === (_asset.length - ".obj".length)) {
            const mtlPath = _asset.substr(0, _asset.lastIndexOf(".obj")) + ".mtl";
            const mtlKey = _key + "_texture";
            OBJLoader.log(`Adding ${mtlKey}...`);
            this.activeQueueProgress[mtlKey] = {
                status: LoaderStatus.LOADING,
                result: null,
                path: mtlPath,
                type: "mtl",
                loader: new MTLLoader()
            };
        }
    }

    unload(_key: string): void {
        if (this._cache[_key])
            delete this._cache[_key];
    }

    get<T>(_key: string): T {
        // fixme: I think I got confused with TS here; I think <T> needs adding to the class name
        return this._cache[_key] as unknown as T;
    }

    _reset(): void {
        this.activeQueueProgress = {};
    }

    load(
        _onProgress?: (progress: number) => void
    ): Promise<ILoaderReturnValue> {
        let done = false;
        const returnValue: ILoaderReturnValue = {};
        let _cacheCounter = -1;
        return new Promise<ILoaderReturnValue>((_resolve, _reject) => {
            const onProgress: () => void = () => {
                const keys = Object.keys(this.activeQueueProgress);
                if (keys.length === 0) return;
                const len = keys
                    .map((e) => this.activeQueueProgress[e])
                    .filter((e) => e.status === LoaderStatus.SUCCESS || e.status === LoaderStatus.ERROR)
                    .length;

                if (_cacheCounter !== len) {
                    _cacheCounter = len;
                    _onProgress ? _onProgress((len / keys.length) * 100) : undefined;
                }

                if (len !== keys.length) {
                    // not done yet
                    setTimeout(() => onProgress(), 100);
                    OBJLoader.log("Waiting to load more");
                    return;
                } else if (!done) {
                    OBJLoader.log("Done loading obj queue");
                    done = true;
                } else {
                    return;
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
                _resolve(returnValue);
            }

            Object.keys(this.activeQueueProgress).forEach((_key: string) => {
                const mtlLoaderProgress = this.activeQueueProgress[_key];
                returnValue[_key] = {success: false};
                if (mtlLoaderProgress.type !== "mtl") {
                    if (mtlLoaderProgress.type === "obj") {
                        this.loadResource(mtlLoaderProgress)
                            .then(() => {
                                OBJLoader.log(`Loaded model ${mtlLoaderProgress.path}`);
                                returnValue[_key].success = true;
                            })
                            .then(() => onProgress())
                            .catch((err) => {
                                console.error(err);
                                returnValue[_key].error = err;
                            });
                    }
                    return;
                }

                const objLoaderProgress = (this.activeQueueProgress[
                    _key.substr(0, _key.lastIndexOf("_texture"))
                ]);
                this.loadResource(mtlLoaderProgress)
                    .then((e: MaterialCreator) => {
                        OBJLoader.log(`Loaded texture ${mtlLoaderProgress.path}`);
                        e.preload();
                        (objLoaderProgress.loader as ThreeOBJLoader).setMaterials(e as MaterialCreator);
                    })
                    .then(() => this.loadResource(objLoaderProgress))
                    .then(() => OBJLoader.log(`Loaded model ${objLoaderProgress.path}`))
                    .then(() => onProgress());
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

    private loadResource(obProg: IOBJLoaderProgress): Promise<Group | MaterialCreator> {
        return new Promise((resolve, reject) => {
            const _loader: ThreeOBJLoader | MTLLoader = obProg.loader;

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

    public isAssetLoaded(_key: string): boolean {
        return this.existsInCache(_key);
    }


}
