export interface ILoaderReturnValue {
    [key: string]: { success: boolean, error?: Error }
}

export abstract class Loader<T> {
    public isLoading: boolean = false;

    public abstract isAssetLoaded(_key: string): boolean;

    public abstract add(_key: string, _asset: string): void;

    public abstract get<T>(_key: string): T;

    /**
     * Load any enqueued assets, resolves when done
     * @param _onProgress Function callback with progress parameter (expressed as 0 to 100 because Facebook)
     */
    public abstract load(_onProgress?: (progress: number) => void): Promise<ILoaderReturnValue>;

    public abstract unload(_key: string): void;

    public abstract cache<T>(_key: string, _asset: T): void;
}
