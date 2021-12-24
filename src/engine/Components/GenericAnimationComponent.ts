import { Component } from "../Component";
import { GenericAnimationSystem } from "../Systems/GenericAnimationSystem";

type TOnTickCallback = (
    _dt: number,
    _progress: number
) => void;

export class GenericAnimationComponent extends Component {
    public static readonly id: string = "GenericAnimationComponent";
    protected static readonly _system: typeof GenericAnimationSystem = GenericAnimationSystem;
    public readonly onTick: TOnTickCallback;
    public _progress: number;
    public _speed: number;
    public _loop: boolean;
    public _isLooping: boolean;

    constructor(
        _onTick: TOnTickCallback,
        _speed?: number,
        _progress?: number,
        _loop?: boolean
    ) {
        super();
        this.onTick = _onTick;
        this._speed = _speed ?? 1;
        this._progress = _progress ?? 0;
        this._loop = _loop ?? false;
        this._isLooping = false;
    }

    public get isDone(): boolean {
        return this._progress === 1;
    }

    onAttach(): void {
    }

    onComponentAttached(_componentId: string, _component: Component): void {
    }

    onDetach(): void {
    }
}
