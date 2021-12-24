import { State } from "../State";
import { Engine } from "../Engine";

export class DefaultTransition extends State {
    onAwake(_engine: Engine, _params?: unknown): void {
    }

    onDestroy(engine: Engine): void {
    }

    onStep(_engine: Engine): void {
    }

    preload(_engine: Engine): Promise<void> {
        return Promise.resolve(undefined);
    }

}
