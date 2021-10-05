import { Loader } from "./Loader";

export class WASMLoader extends Loader {

    private readonly cache: {[key: string]: object} = {};
    private queue: {[key: string]: string} = {};

    public add(_key: string, _asset: string): void {
        this.queue[_key] = _asset;
    }

    public get<T>(_key: string): T {
        return (this.cache[_key] as unknown as T) || null;
    }

    public load(): Promise<void> {
        return new Promise<void>(async (resolve: Function, reject: Function): Promise<void> => {
            const keys: string[] = Object.keys(this.queue).filter((key: string) => this.queue.hasOwnProperty(key));
            // tslint:disable-next-line:no-any
            const promises: Array<Promise<any>> = [];
            // tslint:disable-next-line:prefer-for-of
            for (let i: number = 0; i < keys.length; i++) {
                const currKey: string = keys[i];
                const currUrl: string = this.queue[currKey];
                try {
                    await fetch(currUrl).then((jsStrBuffer: Response): Promise<string> => jsStrBuffer.text())
                        .then((jsStr: string) => {
                            // tslint:disable-next-line:no-eval
                            promises.push(eval(`
(function(){
    return new Promise((_______resolve) => {
\n\n${jsStr}\n\n
        Module['onRuntimeInitialized'] = function() {
          _______resolve(Module);
        };
    });
})()`));
                        });
                } catch(err) {
                    console.error(err);
                }
            }

            Promise.all(promises).then((responses: object[]) => {
                responses.forEach((e: object, i: number) => {
                    this.cache[keys[i]] = e;
                });
                resolve();
            });

            // (function(){
            // return new Promise((_______resolve) => {
            // Module['onRuntimeInitialized'] = function() {
            //   _______resolve();
            // };
            // });})()
        });
    }

}
