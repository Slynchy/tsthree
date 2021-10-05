type TickerFunction = (_dt: number) => void;

export class Ticker {
    private _maxFPS: number = 60;
    private readonly _tasks: TickerFunction[] = [];

    constructor() {}

    public set maxFPS(_fps: number) {
        this._maxFPS = _fps;
    }

    public get maxFPS(): number {
        return this._maxFPS;
    }

    public add(_func: TickerFunction): void {
        this._tasks.push(_func);
    }

    public tick(_dt: number): void {
        this._tasks.forEach((t: TickerFunction) => t(_dt));
    }

    public remove(_func: TickerFunction): void {
        const index: number = this._tasks.findIndex((f: TickerFunction) => _func === f);
        if (index !== -1) {
            this._tasks.splice(index);
        } else {
            console.warn("Failed to remove ticker function" + _func);
        }
    }
}
