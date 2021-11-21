import { GameObject } from "./GameObject";
import {
    Container as PIXIContainer,
    DisplayObject,
    ObservablePoint,
    Sprite as PIXISprite
} from "pixi.js";

import * as PIXI from "pixi.js";
type InteractionEvent = PIXI.interaction.InteractionEvent;

import { SpriteComponent } from "./Components/SpriteComponent";
import { ContainerComponent } from "./Components/ContainerComponent";
import { Container } from "./Container";
import { Engine } from "./Engine";
import {
    BufferGeometry,
    Camera,
    Euler,
    Group,
    Intersection,
    Line,
    LineBasicMaterial,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Raycaster,
    Vector2,
    Vector3
} from "three";
import { DEFAULT_CAMERA_FOV, ENGINE_DEBUG_MODE } from "./Constants/Constants";
import { degToRad, radToDeg } from "three/src/math/MathUtils";
import { IVector2 } from "../tsthree";
import * as TWEEN from '@tweenjs/tween.js'

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

    public static traverseChildren<P extends Object3D, C extends Object3D>(baseObject: P | C, funcToCall: (e: C) => void): void {
        funcToCall(baseObject as C);
        for (let i = 0; i < baseObject.children.length; i++) {
            HelperFunctions.traverseChildren(baseObject.children[i] as C, funcToCall);
        }
    }

    /**
     * Returns array of enum keys
     * @author https://www.petermorlion.com/iterating-a-typescript-enum/
     * @param obj
     */
    public static enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
        return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
    }

    public static getFirstGameObjectInAncestors(obj: Object3D): GameObject | undefined {
        let result: GameObject | Object3D | undefined = obj;
        while (Boolean(result) && !(result instanceof GameObject)) {
            result = result.parent;
        }
        // @ts-ignore
        return result;
    }

    /**
     * Use this function if a model has an overly large bumpmap texture
     * @param mesh
     * @param scale Scale of normal map
     * @param repeat Scale of repeat of normal map
     */
    public static hackFixOverlargeBumpmapOnMesh(mesh: Mesh, scale: number = 0.6, repeat: number = 12): Mesh {

        // @ts-ignore
        mesh.material.shininess = 0;
        // @ts-ignore
        (mesh).material.normalMap = (mesh).material.bumpMap;
        // @ts-ignore
        if (!(mesh).material.normalMap) {
            return mesh;
        }
        // @ts-ignore
        (mesh).material.normalMap.repeat = new Vector2(repeat, repeat);
        // @ts-ignore
        (mesh).material.normalScale = new Vector2(scale, scale);
        // @ts-ignore
        (mesh).material.bumpMap = null;
        return mesh;
    }

    public static getMainCanvasElement(): HTMLCanvasElement {
        return document.getElementById("main-canvas") as HTMLCanvasElement;
    }

    public static createDebugLineObject(p1: Vector3 | Vector3[], p2?: Vector3, color?: number): Line {
        const geom =
            Array.isArray(p1) ? new BufferGeometry().setFromPoints(p1) : new BufferGeometry().setFromPoints([p1, p2]);
        return new Line(
            geom,
            new LineBasicMaterial({color: color ?? 0xff0000})
        );
    }

    public static NearestPointOnFiniteLine(start: Vector3, end: Vector3, pnt: Vector3): Vector3 {
        var line = end.sub(start);
        var len = Math.sqrt(line.x * line.x + line.y * line.y + line.z * line.z);
        line = line.normalize();

        var v = pnt.sub(start);
        var d = v.dot(line);
        d = HelperFunctions.clamp(d, 0, len);
        return line.multiply(new Vector3(d, d, d)).add(start);
    }

    public static clamp(val: number, min: number, max: number): number {
        return Math.min(Math.max(val, min), max);
    }

    public static makeInteractive(_obj: DisplayObject & { interactiveChildren: boolean }, _skipButtonMode?: boolean): void {
        _obj.interactive = _obj.interactiveChildren = true;
        _obj.buttonMode = !_skipButtonMode;
    }

    public static parseInteractionEvent(ev: InteractionEvent, canvasWidth?: number, canvasHeight?: number): PointerEvent {
        let e: PointerEvent;

        let width = canvasWidth;
        let height = canvasHeight;

        if (!width) {
            width = parseInt(
                HelperFunctions.getMainCanvasElement().style.width
            );
        }
        if (!height) {
            height = parseInt(
                HelperFunctions.getMainCanvasElement().style.height
            );
        }

        if (ev.data.originalEvent instanceof TouchEvent) {
            const factorX = width / canvasWidth;
            const factorY = height / canvasHeight;
            e = {
                offsetX: ev.data.global.x * factorX,
                offsetY: ev.data.global.y * factorY,
            } as PointerEvent
        } else {
            e = {
                offsetX: ev.data.global.x,
                offsetY: ev.data.global.y,
            } as PointerEvent
        }
        return e;
    }

    public static raycastFromInteractionEvent(ev: InteractionEvent, camera: Camera, objectsToCheck: GameObject[], screenSize?: Vector2): Intersection[] | null {
        const raycaster = new Raycaster();
        const width = screenSize ? screenSize.x : parseInt(
            HelperFunctions.getMainCanvasElement().style.width
        );
        const height = screenSize ? screenSize.y : parseInt(
            HelperFunctions.getMainCanvasElement().style.height
        );
        let e: PointerEvent = HelperFunctions.parseInteractionEvent(ev, width, height);
        const mouse = new Vector2(
            (e.offsetX / width) * 2 - 1,
            -(e.offsetY / height) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);
        return raycaster.intersectObjects(objectsToCheck);
    }

    public static deg2rad(num: number): number {
        return degToRad(num);
    }

    public static rad2deg(num: number): number {
        return radToDeg(num);
    }

    public static resetCamera(camera: Camera): void {
        camera.position.set(0, 0, 0);
        camera.setRotationFromEuler(new Euler(0, 0, 0));
        if (camera instanceof PerspectiveCamera) {
            camera.fov = DEFAULT_CAMERA_FOV;
        }
        // todo: reset other camera properties
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

    /**
     * NOTE: There is no protection against calling `await` on this function
     * So if you wonder why your animation finishes instantly, it's because you
     * need to `await TWEENAsPromise(...).promise`.
     * @param _target
     * @param _key
     * @param _destVal
     * @param _func
     * @param _duration
     * @constructor
     */
    public static TWEENAsPromise(
        _target: any,
        _key: string,
        _destVal: number,
        _func: typeof TWEEN.Easing.Linear.None,
        _duration: number = 1000
    ): {
        promise: Promise<void>,
        cancel: Function
    } {
        const start = {};
        const dest = {};
        let tween: TWEEN.Tween<{}>;
        // @ts-ignore
        start[_key] = _target[_key];
        // @ts-ignore
        dest[_key] = _destVal;

        tween = new TWEEN.Tween(start)
            .to(dest, _duration)
            .onUpdate(() => {
                _target[_key]
                    // @ts-ignore
                    = start[_key];
            })
            .easing(_func);

        let resolveEscape: Function;
        const promise = new Promise<void>((resolve) => {
            resolveEscape = resolve;
            tween.onComplete(() => {
                _target[_key] = _destVal;
                resolve();
            }).start(Date.now());
        });

        return {
            promise: promise,
            cancel: () => {
                tween.stop();
                resolveEscape();
            }
        };
    }

    public static easeInBack(x: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return c3 * x * x * x - c1 * x * x;
    }

    public static tweenScalarPromise(
        _target: any,
        _key: string,
        _destValue: number,
        _tweenFunc?: (v0: number, v1: number, t: number) => number,
        _speed?: number,
        _engine?: Engine
    ): Promise<void> {
        const speed: number = _speed || 0.01;
        const origValue: number = _target[_key];
        const tweenFunc: Function = _tweenFunc || HelperFunctions.lerp;

        return new Promise<void>(async (resolve: Function, reject: Function): Promise<void> => {
            let progress: number = 0;
            await new Promise((resolve2: Function): void => {
                let intervalID: unknown;
                intervalID = setInterval(() => {
                    progress = Math.min(progress + (speed * (_engine?.deltaTime || 1)), 1);
                    if(!_target) reject();
                    _target[_key] = tweenFunc(origValue, _destValue, progress);
                    if (progress === 1) {
                        // @ts-ignore
                        clearInterval(intervalID);
                        resolve2();
                    }
                }, 0);
            });
            _target[_key] = _destValue;
            resolve();
        });
    }

    public static wait(ms: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => resolve(), ms);
        });
    }

    public static lerpToPromise(
        _sprite: Vector2 | Vector3 | ObservablePoint,
        _destination: { x: number, y: number, z?: number },
        _speed?: number,
        _lerpFunc?: Function,
        _engine?: Engine
    ): Promise<void> {
        const speed: number = _speed || 0.01;
        let origPos: Vector2 | Vector3;
        if(_sprite instanceof Vector3) {
            origPos = new Vector3(_sprite.x, _sprite.y, _sprite.z);
        } else {
            origPos = new Vector2(_sprite.x, _sprite.y);
        }
        const lerpFunc: Function = _lerpFunc || HelperFunctions.lerp;

        return new Promise<void>(async (resolve: Function): Promise<void> => {
            let progress: number = 0;
            await new Promise((resolve2: Function): void => {
                let intervalID: unknown;
                intervalID = setInterval(() => {
                    progress = Math.min(progress + (speed * (_engine?.deltaTime || 1)), 1);
                    _sprite.x = lerpFunc(origPos.x, _destination.x, progress);
                    _sprite.y = lerpFunc(origPos.y, _destination.y, progress);
                    if (_sprite instanceof Vector3) {
                        _sprite.z = lerpFunc((origPos as Vector3).z, _destination.z, progress);
                    }
                    if (progress === 1) {
                        // @ts-ignore
                        clearInterval(intervalID);
                        resolve2();
                    }
                }, 0);
            });
            _sprite.x = _destination.x;
            _sprite.y = _destination.y;
            if (_sprite instanceof Vector3) {
                _sprite.z = _destination.z;
            }
            resolve();
        });
    }

    /**
     * @param self
     * @param propKey
     */
    // @ts-ignore
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
