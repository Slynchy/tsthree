import { GameObject } from "./GameObject";
import { Container as PIXIContainer, DisplayObject, Sprite as PIXISprite } from "pixi.js";
import { SpriteComponent } from "./Components/SpriteComponent";
import { ContainerComponent } from "./Components/ContainerComponent";
import { InteractionEvent } from "./Types/InteractionEvent";
import { Container } from "./Container";
import { Engine } from "./Engine";
import { Group, Object3D, Vector2 } from "three";

const DEBUG_MODE: boolean = false;

export interface TooltipProperties {
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    body: string;
    dontAddToUI?: boolean;
}

declare const window: Window & {
    ENGINE: Engine;
};

export class HelperFunctions {
    constructor() {
        throw new Error("HelperFunctions class is intended to be static; no instances!");
    }

    public static removeFromStage(stage: Container, obj: DisplayObject | GameObject, unsafe?: boolean): void {
        if (unsafe || HelperFunctions.isDisplayObject(obj)) {
            stage.removeChild(obj as DisplayObject);
        } else if (HelperFunctions.isGameObject(obj)) {
            if ((obj as GameObject).hasComponent(SpriteComponent)) {
                const sprite: PIXISprite = ((obj as GameObject).getComponent(SpriteComponent) as SpriteComponent).getSpriteObj();
                if (sprite) stage.removeChild(sprite);
            } else if ((obj as GameObject).hasComponent(ContainerComponent)) {
                const container: PIXIContainer
                    = ((obj as GameObject).getComponent(ContainerComponent) as ContainerComponent).getContainer();
                if (container) stage.removeChild(container);
            } else {
                throw new Error("GameObject must have Sprite or Container component to be added to scene!");
            }
        } else if (!unsafe) {
            throw new Error("Invalid object attempted to add to scene");
        }
    }

    public static addToStage(stage: Group, obj: GameObject, unsafe?: boolean): void {
        // Sam - since making GameObject just extend Object3D, this function got a bit easier
        stage.add(obj);
    }

    public static addToStage2D(stage: Container, obj: DisplayObject | GameObject, unsafe?: boolean): void {
        if (unsafe || HelperFunctions.isDisplayObject(obj)) {
            stage.addChild(obj as DisplayObject);
        } else if (HelperFunctions.isGameObject(obj)) {
            if ((obj as GameObject).hasComponent(SpriteComponent)) {
                const sprite: PIXISprite = ((obj as GameObject).getComponent(SpriteComponent) as SpriteComponent).getSpriteObj();
                if (sprite) stage.addChild(sprite);
            } else if ((obj as GameObject).hasComponent(ContainerComponent)) {
                const container: PIXIContainer
                    = ((obj as GameObject).getComponent(ContainerComponent) as ContainerComponent).getContainer();
                if (container) stage.addChild(container);
            } else {
                throw new Error("GameObject must have Sprite or Container component to be added to scene!");
            }
        } else if (!unsafe) {
            throw new Error("Invalid object attempted to add to scene");
        }
    }

    public static async shakeObject(_target: Vector2, _iterations?: number): Promise<void> {
        const iterations: number = _iterations || 30;
        // @ts-ignore
        const origPos: Vector2 = {
            x: _target.x, y: _target.y
        };
        for(let n: number = 0; n < iterations; n++) {
            await HelperFunctions.lerpToPromise(
                _target,
                {
                    x: _target.x + ((Math.random() * 20) - 10),
                    y: _target.y + ((Math.random() * 20) - 10)
                },
                0.4,
                window.ENGINE.getWASM("lerp").lerp
            );
            await HelperFunctions.lerpToPromise(
                _target,
                {
                    x: origPos.x,
                    y: origPos.y
                },
                0.4,
                window.ENGINE.getWASM("lerp").lerp
            );
        }
        _target.x = origPos.x;
        _target.y = origPos.y;
    }

    public static lerp(v0: number, v1: number, t: number): number {
        return v0 * (1 - t) + v1 * t;
    }

    public static lerpToPromise(
        _sprite: Vector2,
        _destination: {x: number, y: number},
        _speed?: number,
        _lerpFunc?: Function
    ): Promise<void> {
        const speed: number = _speed || 0.01;
        const origPos: Vector2 = new Vector2(_sprite.x, _sprite.y);
        const lerpFunc: Function = _lerpFunc || HelperFunctions.lerp;

        return new Promise<void>( async (resolve: Function): Promise<void> => {
            let progress: number = 0;
            await new Promise((resolve2: Function): void => {
                let intervalID: unknown;
                intervalID = setInterval(() => {
                    progress = Math.min(progress + speed, 1);
                    _sprite.x = lerpFunc(origPos.x, _destination.x, progress);
                    _sprite.y = lerpFunc(origPos.y, _destination.y, progress);
                    if(progress === 1) {
                        // @ts-ignore
                        clearInterval(intervalID);
                        resolve2();
                    }
                }, 8);
            });
            _sprite.x =  _destination.x;
            _sprite.y = _destination.y;
            resolve();
        });
    }

    public static createInteractionEvent<T>(self: object, propKey: string): InteractionEvent<T> {
        return {
            add: (prop: T): string => {
                const key: string = Math.random().toString().slice(2);
                // @ts-ignore
                self[propKey][key] = (prop);
                return key;
            },
            remove: (prop: T | string): void => {
                if (typeof prop === "string") {
                    // @ts-ignore
                    if (self[propKey][prop]) {
                        // @ts-ignore
                        delete self[propKey][prop];
                        return;
                    }
                } else {
                    // @ts-ignore
                    for (const f in self[propKey]) {
                        // @ts-ignore
                        if (self[propKey].hasOwnProperty(f)) {
                            // @ts-ignore
                            if (self[propKey][f] === prop) {
                                // @ts-ignore
                                delete self[propKey][f];
                                return;
                            }
                        }
                    }
                }
                throw new Error(`Failed to find ${propKey} event to remove`);
            }
        };
    }

    public static isGameObject(obj: unknown): boolean {
        return (obj instanceof GameObject);
    }

    public static isDisplayObject(obj: unknown): boolean {
        return (obj instanceof DisplayObject);
    }
}
