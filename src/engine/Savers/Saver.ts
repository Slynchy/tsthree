import { IData } from "../Types/IData";

export abstract class Saver {
    protected abstract _dataCache: {[key: string]: unknown};

    constructor() {/* abstract class */
    }

    public abstract save(data: Partial<IData>): Promise<void>;

    public abstract load(_keysToLoad?: string[]): Promise<IData>;

    public abstract clear(): Promise<void>;
}
