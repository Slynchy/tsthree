import { GameObject } from "./GameObject";
import {
    Container as PIXIContainer,
    DisplayObject,
    InteractionEvent as PIXIInteractionEvent,
    ObservablePoint,
    Sprite,
    Sprite as PIXISprite
} from "pixi.js";
import { InteractionEvent } from "./Types/InteractionEvent";
import { SpriteComponent } from "./Components/SpriteComponent";
import { ContainerComponent } from "./Components/ContainerComponent";
import { Container } from "./Container";
import { Engine } from "./Engine";
import {
    Box3,
    BufferGeometry,
    Camera,
    Euler,
    Group,
    Line,
    LineBasicMaterial,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Raycaster,
    Vector2,
    Vector3
} from "three";
import { DEFAULT_CAMERA_FOV } from "./Constants/Constants";
import { degToRad, radToDeg } from "three/src/math/MathUtils";
import { DIRECTION } from "./Types/Direction";
import { IVector2, IVector3 } from "../tsthree";
import * as TWEEN from '@tweenjs/tween.js'
import { tsthreeConfig } from "../config/tsthreeConfig";
import { BoxColliderComponent } from "./Components/BoxColliderComponent";

export interface TooltipProperties {
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    body: string;
    dontAddToUI?: boolean;
}

export interface ITweenAnimationReturnValue {
    cancel: () => void;
    promise: Promise<void>;
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
     * Scales a target object based on specified width/height.
     * Use `null` in the targetSize object to scale with the other axis
     * Example: smartScale2D({x: 100, y: null}, aSprite);
     * @param targetSize IVector2 In pixels; width/height
     * @param obj PIXI.Sprite
     */
    public static smartScale2D(
        targetSize: IVector2, //
        obj: Sprite
    ): void {
        let widthScale = typeof targetSize.x !== "undefined" ? (targetSize.x / obj.width) : null;
        let heightScale = typeof targetSize.y !== "undefined" ? (targetSize.y / obj.height) : null;

        if (widthScale && !heightScale) {
            heightScale = widthScale;
        } else if (heightScale && !widthScale) {
            widthScale = heightScale;
        }

        obj.scale.set(
            widthScale,
            heightScale,
        );
    }

    public static getDirectionFromSize(_e: Box3): DIRECTION.RIGHT | DIRECTION.UP {
        const size: Vector3 = new Vector3();
        _e.getSize(size);
        if (size.x > size.y) {
            return DIRECTION.UP;
        } else {
            return DIRECTION.RIGHT;
        }

    }

    public static roundToSpecifiedDivider(num: number, div: number): number {
        return Math.round(num / div) * div;
    }

    public static getDirectionFromOffset(_offset: IVector2): DIRECTION {
        const axis = _offset.x > _offset.y ? "x" : "y";

        if (axis === "x") {
            if (_offset[axis] > 0) {
                return DIRECTION.DOWN;
            } else {
                return DIRECTION.UP;
            }
        } else {
            if (_offset[axis] > 0) {
                return DIRECTION.RIGHT;
            } else {
                return DIRECTION.LEFT;
            }
        }
    }

    public static waitForTruth(func: () => boolean, refreshRateMs: number = 15): Promise<void> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (func()) {
                    clearInterval(interval);
                    resolve();
                }
            }, refreshRateMs);
        });
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

    public static roundToDecimalPlaces(num: number, decimalPlaces: number = 1): number {
        const factor = (Math.pow(10, decimalPlaces));
        return Math.round(num * factor) / factor;
    }

    public static getDirectionFromTwoIVecs(vecA: IVector2, vecB: IVector2, _z: number = 0.1): DIRECTION {
        return HelperFunctions.getDirectionFromTwoPoints(
            new Vector3(
                vecA.x,
                vecA.y,
                _z
            ),
            new Vector3(
                vecB.x,
                vecB.y,
                _z
            )
        );
    }

    public static getDirectionFromTwoPoints(vecA: Vector2 | Vector3, vecB: Vector2 | Vector3): DIRECTION {
        const _direction = vecA.clone()
            .sub(vecB as Vector2 & Vector3);
        _direction.set(
            Math.round(_direction.x * 10) / 10,
            Math.round(_direction.y * 10) / 10,
            0,
        )
        let direction: DIRECTION;
        if (Math.abs(_direction.y) < Math.abs(_direction.x)) {
            if (
                _direction.x < 0
            ) {
                direction = DIRECTION.DOWN;
            } else {
                direction = DIRECTION.UP;
            }
        } else {
            if (
                _direction.y < 0
            ) {
                direction = DIRECTION.RIGHT;
            } else {
                direction = DIRECTION.LEFT;
            }
        }
        return direction;
    }

    /**
     * Use this function if a model has an overly large bumpmap texture
     * @param mesh
     * @param scale Scale of normal map
     * @param repeat Scale of repeat of normal map
     */
    public static hackFixOverlargeBumpmapOnMesh(mesh: Mesh, scale: number = 0.6, repeat: number = 22): Mesh {
        // @ts-ignore
        if (!mesh.material || !mesh.material.normalMap) {
            return;
        }


        // @ts-ignore
        (mesh).material.normalMap.repeat = new Vector2(repeat, repeat);
        // @ts-ignore
        (mesh).material.normalScale = new Vector2(scale, -scale);

        // sam - since shifting to GLTF, this needs less input (still needs some though, smh)

        // @ts-ignore
        // mesh.material.shininess = 0;
        // @ts-ignore
        // (mesh).material.normalMap = (mesh).material.bumpMap;
        // @ts-ignore
        // if (!(mesh).material.normalMap) {
        //     return mesh;
        // }
        // @ts-ignore
        // (mesh).material.normalMap.repeat = new Vector2(repeat, repeat);
        // @ts-ignore
        // (mesh).material.bumpMap = null;
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
        let line = end.sub(start);
        const len = Math.sqrt(line.x * line.x + line.y * line.y + line.z * line.z);
        line = line.normalize();

        const v = pnt.sub(start);
        let d = v.dot(line);
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

    public static parseInteractionEvent(ev: PIXIInteractionEvent, canvasWidth?: number, canvasHeight?: number): IVector2 {
        const width = canvasWidth ? canvasWidth : parseInt(
            HelperFunctions.getMainCanvasElement().style.width
        );
        const height = canvasHeight ? canvasHeight : parseInt(
            HelperFunctions.getMainCanvasElement().style.height
        );
        const scaleFactor = HelperFunctions.calculateScaleFactor({x: width, y: height});

        return {
            x: ev.data.global.x * scaleFactor,
            y: ev.data.global.y * scaleFactor,
        };
    }

    public static getUICanvas(): HTMLCanvasElement {
        return document.getElementById("ui-canvas") as HTMLCanvasElement;
    }

    public static calculateScaleFactor(_screenSize: IVector2): number {
        let scaleFactor: number;
        const canvas3dWidth = _screenSize ? _screenSize.x : parseInt(
            HelperFunctions.getMainCanvasElement().style.width
        );
        const canvas3dHeight = _screenSize ? _screenSize.y : parseInt(
            HelperFunctions.getMainCanvasElement().style.height
        );
        switch (tsthreeConfig.autoResize) {
            case "height":
                scaleFactor = canvas3dHeight / HelperFunctions.getUICanvas().height;
                break;
            case "none":
            case "width":
            default:
                scaleFactor = canvas3dWidth / HelperFunctions.getUICanvas().width;
                break;
        }
        return scaleFactor;
    }

    public static raycastFromInteractionEvent(
        ev: PIXIInteractionEvent,
        camera: Camera,
        objectsToCheck: Array<Box3 | BoxColliderComponent>,
        screenSize?: IVector2
    ): GameObject | Box3 | null {
        const raycaster = new Raycaster();
        const width = screenSize ? screenSize.x : parseInt(
            HelperFunctions.getMainCanvasElement().style.width
        );
        const height = screenSize ? screenSize.y : parseInt(
            HelperFunctions.getMainCanvasElement().style.height
        );
        const e: IVector2 = HelperFunctions.parseInteractionEvent(ev, width, height);
        const mouse = new Vector2(
            (e.x / width) * 2 - 1,
            -(e.y / height) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);

        const firstValidObj = objectsToCheck.find((e) => Boolean(e));

        if (firstValidObj instanceof BoxColliderComponent) {
            for (let i = 0; i < objectsToCheck.length; i++) {
                if (!objectsToCheck[i]) continue;
                if (raycaster.ray.intersectsBox((objectsToCheck[i] as BoxColliderComponent)._box))
                    return (objectsToCheck[i] as BoxColliderComponent).parent;
            }
        } else if (firstValidObj instanceof Box3) {
            for (let i = 0; i < objectsToCheck.length; i++) {
                if (!objectsToCheck[i]) continue;
                if (raycaster.ray.intersectsBox(objectsToCheck[i] as Box3)) return (objectsToCheck[i] as Box3)
            }
        } else {
            console.warn("Empty array passed to raycastFromInteractionEvent");
        }

        return null;
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

    public static addToStage(stage: Group, obj: GameObject | Object3D, unsafe?: boolean): void {
        // Sam - since making GameObject just extend Object3D, this function got a bit easier
        stage.add(obj);
    }

    public static formatTimeToHHMMSS(_time: number): string {
        const hours = Math.floor((_time / 1000 / 3600) % 24)
        return `${hours}:${HelperFunctions.formatTimeToMMSS(_time)}`;
    }

    /**
     * Modified from https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
     * @param _time
     */
    public static formatTimeToMMSS(_time: number): string {
        // 1- Convert to seconds:
        const seconds = Math.floor((_time / 1000) % 60);
        const minutes = Math.floor((_time / 1000 / 60) % 60);

        return `${
            minutes < 10 ? "0" + minutes : minutes
        }:${
            seconds < 10 ? "0" + seconds : seconds
        }`;
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
                66
            );
            await HelperFunctions.lerpToPromise(
                _target,
                {
                    x: origPos.x,
                    y: origPos.y
                },
                66
            );
        }
        _target.x = origPos.x;
        _target.y = origPos.y;
    }

    public static createBox3(_pos: IVector2, _size: IVector2 = {x: 1, y: 1}): Box3 {
        const box3 = new Box3();
        box3.set(
            new Vector3(
                (_pos.x),
                (_pos.y),
                0
            ),
            new Vector3(
                (_pos.x) + _size.x,
                (_pos.y) + _size.y,
                2
            ),
        );
        return box3;
    }

    public static getDirectionOfSwipe(
        _pointerUpEvent: PIXIInteractionEvent,
        _pointerDownPos: Vector2 | PIXIInteractionEvent,
        _scrSize?: IVector2
    ): DIRECTION {
        const parsedEvent: IVector2 = HelperFunctions.parseInteractionEvent(_pointerUpEvent, _scrSize?.x, _scrSize?.y);
        const eventCoords = new Vector2(parsedEvent.x, parsedEvent.y);

        let _direction: Vector2;
        if (_pointerDownPos instanceof Vector2) {
            _direction = eventCoords.sub(new Vector2(_pointerDownPos.x, _pointerDownPos.y)).normalize();
        } else {
            const parsedDownEvent = HelperFunctions.parseInteractionEvent(_pointerDownPos);
            _direction = eventCoords.sub(new Vector2(parsedDownEvent.x, parsedDownEvent.y)).normalize();
        }

        let swipeDirection: DIRECTION;
        if (Math.abs(_direction.y) < Math.abs(_direction.x)) {
            if (
                _direction.x < 0
            ) {
                swipeDirection = DIRECTION.LEFT;
            } else {
                swipeDirection = DIRECTION.RIGHT;
            }
        } else {
            if (
                _direction.y < 0
            ) {
                swipeDirection = DIRECTION.UP;
            } else {
                swipeDirection = DIRECTION.DOWN;
            }
        }

        return swipeDirection;
    }

    public static lerp(v0: number, v1: number, t: number): number {
        return v0 * (1 - t) + v1 * t;
    }

    public static TWEENVec2AsPromise(
        _target: Vector2 | ObservablePoint | IVector2,
        _destVal: Vector2 | ObservablePoint | IVector2,
        _func: typeof TWEEN.Easing.Linear.None,
        _duration: number = 1000,
        _onTick?: (obj?: any, elapsed?: number) => boolean
    ): ITweenAnimationReturnValue {
        const xPromise = HelperFunctions.TWEENAsPromise(
            _target, "x", _destVal.x, _func, _duration, _onTick
        );
        const yPromise = HelperFunctions.TWEENAsPromise(
            _target, "y", _destVal.y, _func, _duration
        );

        return {
            promise: Promise.all([
                xPromise.promise,
                yPromise.promise,
            ]) as unknown as Promise<void>,
            cancel: () => {
                xPromise.cancel();
                yPromise.cancel();
            }
        };
    }

    public static TWEENVec3AsPromise(
        _target: Vector3 | Euler | IVector3,
        _destVal: Vector3 | Euler | IVector3,
        _func: typeof TWEEN.Easing.Linear.None,
        _duration: number = 1000,
        _onTick?: (obj?: any, elapsed?: number) => boolean
    ): ITweenAnimationReturnValue {
        const xPromise = HelperFunctions.TWEENAsPromise(
            _target, "x", _destVal.x, _func, _duration, _onTick
        );
        const yPromise = HelperFunctions.TWEENAsPromise(
            _target, "y", _destVal.y, _func, _duration
        );
        const zPromise = HelperFunctions.TWEENAsPromise(
            _target, "z", _destVal.z, _func, _duration
        );

        return {
            promise: Promise.all([
                xPromise.promise,
                yPromise.promise,
                zPromise.promise
            ]) as unknown as Promise<void>,
            cancel: () => {
                xPromise.cancel();
                yPromise.cancel();
                zPromise.cancel();
            }
        };
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
     * @param _onTick
     * @constructor
     */
    public static TWEENAsPromise(
        _target: any,
        _key: string,
        _destVal: number,
        _func: typeof TWEEN.Easing.Linear.None,
        _duration: number = 1000,
        _onTick?: (obj?: any, elapsed?: number) => boolean
    ): ITweenAnimationReturnValue {
        const start = {};
        const dest = {};
        // @ts-ignore
        start[_key] = _target[_key];
        // @ts-ignore
        dest[_key] = _destVal;

        const tween = new TWEEN.Tween(start)
            .to(dest, _duration)
            .onUpdate((e, t) => {
                const cont: boolean = _onTick ? _onTick(e, t) as boolean : true;
                if (cont)
                    _target[_key]
                        // @ts-ignore
                        = start[_key];
                else {
                    tween.stop();
                }
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
                const intervalID: unknown = setInterval(() => {
                    progress = Math.min(progress + (speed * (_engine?.deltaTime || 1)), 1);
                    if (!_target) reject();
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

    /**
     * @deprecated Use `HelperFunctions.TWEENVec3AsPromise`
     * @param _sprite
     * @param _destination
     * @param _duration
     */
    public static lerpToPromise(
        _sprite: Vector2 | Vector3 | ObservablePoint,
        _destination: { x: number, y: number, z?: number },
        _duration: number = 1000
    ): Promise<void> {

        return HelperFunctions.TWEENVec3AsPromise(
            _sprite as Vector3,
            _destination instanceof Vector3 ? _destination : new Vector3(_destination.x, _destination.y, _destination.z),
            TWEEN.Easing.Linear.None,
            _duration
        ).promise as unknown as Promise<void>;
    }

    /**
     * @param self
     * @param propKey
     */
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
                        self[propKey][prop] = undefined;
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
                                self[propKey][f] = undefined;
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
