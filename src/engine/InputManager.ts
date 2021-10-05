import { Engine } from "./Engine";
import { MouseOverObject } from "./Types/MouseOverObject";
import { MouseOverState } from "./Types/MouseOverState";
import { PIXIConfig } from "../config/PIXIConfig";
import { Vector2 as Vec2 } from "three";
import isMobile from "is-mobile";

/**
 * @deprecated Just use PIXI.DisplayObject `interactive`, `buttonMode`, and `.on("pointerevent", ...)`
 */
export class InputManager {

    private readonly clickHandlerElement: Element;
    private registeredDownEvents: { [key: number]: { [uid: string]: Function; }; } = {};
    private registeredUpEvents: { [key: number]: { [uid: string]: Function; }; } = {};

    private registeredMouseDownEvents: { [key: number]: { [uid: string]: Function; }; } = {};
    private registeredMouseUpEvents: { [key: number]: { [uid: string]: Function; }; } = {};
    private registeredMouseMoveEvents: { [uid: string]: Function; } = {};

    private registeredMouseOverObjects: { [uid: string]: MouseOverObject; } = {};

    private currentState: { [uid: string]: boolean; } = {};

    constructor(_engine: Engine) {
        document.addEventListener("keydown", (e: KeyboardEvent) => this.onKeyDown(e));
        document.addEventListener("keyup", (e: KeyboardEvent) => this.onKeyUp(e));
        document.body.appendChild(
            this.clickHandlerElement = this.createAndSetupClickHandler(
                PIXIConfig.width,
                PIXIConfig.height,
            )
        );

        // disable right-click menu
        // todo: make configurable
        // tslint:disable-next-line
        document.oncontextmenu = document.body.oncontextmenu = function () {
            return false;
        };

        // @ts-ignore
        window._INPUT_MANAGER = this;
    }

    public removeRegisteredMouseOverObject(uid: string): void {
        if (this.registeredMouseOverObjects[uid]) {
            document.body.style.cursor = "default"; // fixme: hackfix
            delete this.registeredMouseOverObjects[uid];
        }
    }

    public registerMouseOverObject(
        x: number,
        y: number,
        width: number,
        height: number,
        onmousemove?: (ev: MouseEvent) => void,
        onmouseenter?: (ev: MouseEvent) => void,
        onmouseexit?: (ev: MouseEvent) => void,
        onclick?: (ev: MouseEvent) => void
    ): string {
        const uid: string = this.generateUID();
        this.registeredMouseOverObjects[uid] = ({
            pos: new Vec2(x, y),
            dimensions: new Vec2(width, height),
            _currState: MouseOverState.NULL,
            onmousemove,
            onmouseenter,
            onmouseexit,
            onclick
        });
        return uid;
    }

    /**
     * @param keyCode 1=lmb,2=rmb,3=mmb(?)
     * @param event
     */
    public registerMouseDown(keyCode: number | number[], event: Function): string[] {
        return this.registerEvent(
            "registeredMouseDownEvents",
            "mdown",
            keyCode,
            event
        );
    }

    public registerMouseMove(event: Function): string {
        const uid: string = this.generateUID();
        // @ts-ignore
        this.registeredMouseMoveEvents[uid] = (event);
        return `mmove:${uid}`;
    }

    public registerMouseUp(keyCode: number | number[], event: Function): string[] {
        return this.registerEvent(
            "registeredMouseUpEvents",
            "mup",
            keyCode,
            event
        );
    }

    public registerKeyDownOnce(keycode: number, event: Function): void {
        let id: string;
        id = this.registerKeyDown(keycode, () => {
            this.removeRegisteredEvent(id);
            event();
        })[0];
    }

    public registerKeyUpOnce(keycode: number, event: Function): void {
        let id: string;
        id = this.registerKeyUp(keycode, () => {
            this.removeRegisteredEvent(id);
            event();
        })[0];
    }

    public removeRegisteredEvent(id: string): void {
        const keycode: number = Number(id.substr(0, id.indexOf(":")));
        const isMouse: boolean = (id.substr(
            id.indexOf(":") + 1,
            4
        )[0] === "m");
        const isDown: boolean = (id.substr(
            id.indexOf(":") + 1,
            id.lastIndexOf(":") - (id.indexOf(":") + 1)
        ) === (isMouse ? "mdown" : "down"));
        const uid: string = (id.substr(id.lastIndexOf(":") + 1));
        if (!keycode) throw new Error("Failed to find keycode in ID!");
        if (isMouse) {
            if (isDown) {
                delete this.registeredMouseDownEvents[keycode][uid];
            } else {
                delete this.registeredMouseUpEvents[keycode][uid];
            }
        } else {
            if (isDown) {
                delete this.registeredDownEvents[keycode][uid];
            } else {
                delete this.registeredUpEvents[keycode][uid];
            }
        }
    }

    public registerKeyDown(keyCode: number | number[], event: Function): string[] {
        return this.registerEvent(
            "registeredDownEvents",
            "down",
            keyCode,
            event
        );
    }

    public registerKeyUp(keyCode: number | number[], event: Function): string[] {
        return this.registerEvent(
            "registeredUpEvents",
            "up",
            keyCode,
            event
        );
    }

    private generateUID(): string {
        return Math.random().toString().slice(2);
    }

    private createAndSetupClickHandler(_width: number, _height: number): Element {
        const element: HTMLDivElement = document.createElement("div");
        element.id = "click-handler";
        element.style.width = _width.toString() + "px";
        element.style.height = _height.toString() + "px";

        const mdownKey = isMobile() ? "onpointerdown" : "onmousedown";
        const mupKey = isMobile() ? "onpointerup" : "onmouseup";

        // @ts-ignore
        element[mdownKey] = (ev: MouseEvent): MouseEvent => {
            this.onMouseDown(ev);
            return ev;
        };
        // @ts-ignore
        element[mupKey] = (ev: MouseEvent): MouseEvent => {
            this.onMouseUp(ev);
            return ev;
        };
        // @ts-ignore
        element.onmousemove = (ev: MouseEvent): MouseEvent => {
            this.onMouseMove(ev);
            return ev;
        };
        // @ts-ignore
        element.onclick = (ev: MouseEvent): MouseEvent => {
            this.onMouseClick(ev);
            return ev;
        };
        return element;
    }

    private onMouseClick(ev: MouseEvent): void {
        for (const f in this.registeredMouseOverObjects) {
            if (this.registeredMouseOverObjects.hasOwnProperty(f)) {
                if (this.registeredMouseOverObjects[f]._currState === MouseOverState.MOVEMENT) {
                    if (this.registeredMouseOverObjects[f].onclick) {
                        this.registeredMouseOverObjects[f].onclick(ev);
                    }
                    return;
                }
            }
        }
    }

    private onMouseDown(ev: MouseEvent): void {
        if (this.registeredMouseDownEvents[ev.button]) {
            for (const f in this.registeredMouseDownEvents[ev.button]) {
                if (this.registeredMouseDownEvents[ev.button].hasOwnProperty(f)) {
                    this.registeredMouseDownEvents[ev.button][f](ev);
                }
            }
        }
    }

    private onMouseUp(ev: MouseEvent): void {
        if (this.registeredMouseUpEvents[ev.button]) {
            for (const f in this.registeredMouseUpEvents[ev.button]) {
                if (this.registeredMouseUpEvents[ev.button].hasOwnProperty(f)) {
                    this.registeredMouseUpEvents[ev.button][f](ev);
                }
            }
        }
    }

    private onMouseMove(ev: MouseEvent): void {
        for (const f in this.registeredMouseMoveEvents) {
            if (this.registeredMouseMoveEvents.hasOwnProperty(f)) {
                this.registeredMouseMoveEvents[f](ev);
            }
        }
        for (const f in this.registeredMouseOverObjects) {
            if (this.registeredMouseOverObjects.hasOwnProperty(f)) {
                // check overlap, if true:
                if (
                    ev.offsetX >= this.registeredMouseOverObjects[f].pos.x &&
                    (
                        ev.offsetX <= this.registeredMouseOverObjects[f].pos.x +
                        this.registeredMouseOverObjects[f].dimensions.x
                    ) &&
                    ev.offsetY >= this.registeredMouseOverObjects[f].pos.y &&
                    (
                        ev.offsetY <= this.registeredMouseOverObjects[f].pos.y +
                        this.registeredMouseOverObjects[f].dimensions.y
                    )
                ) {
                    // overlap!
                    if (this.registeredMouseOverObjects[f]._currState === MouseOverState.NULL) {
                        this.registeredMouseOverObjects[f]._currState = MouseOverState.ENTERED;
                    }
                    switch (this.registeredMouseOverObjects[f]._currState) {
                        case MouseOverState.NULL:
                            break;
                        case MouseOverState.ENTERED:
                            if (this.registeredMouseOverObjects[f].onmouseenter) {
                                this.registeredMouseOverObjects[f].onmouseenter(ev);
                            }
                            this.registeredMouseOverObjects[f]._currState = MouseOverState.MOVEMENT;
                            if (this.registeredMouseOverObjects[f].onclick) document.body.style.cursor = "pointer";
                            break;
                        case MouseOverState.MOVEMENT:
                            if (this.registeredMouseOverObjects[f].onmousemove) {
                                this.registeredMouseOverObjects[f].onmousemove(ev);
                            }
                            break;
                        case MouseOverState.EXIT:
                            // should never be reached
                            break;
                    }
                } else {
                    if (this.registeredMouseOverObjects[f]._currState === MouseOverState.MOVEMENT) {
                        if (this.registeredMouseOverObjects[f].onmouseexit) {
                            this.registeredMouseOverObjects[f].onmouseexit(ev);
                        }
                        this.registeredMouseOverObjects[f]._currState = MouseOverState.NULL;
                        document.body.style.cursor = "default";
                    }
                }
            }
        }
    }

    private registerEvent(key: string, type: string, keyCode: number | number[], event: Function): string[] {
        if (!Array.isArray(keyCode)) {
            keyCode = [keyCode];
        }
        const eventIds: string[] = [];
        for (const kc of keyCode) {
            // @ts-ignore
            if (!this[key][kc]) {
                // @ts-ignore
                this[key][kc] = {};
            }
            const uid: string = this.generateUID();
            // @ts-ignore
            this[key][kc][uid] = (event);
            eventIds.push(`${kc}:${type}:${uid}`);
        }
        return eventIds;
    }

    public isKeyDown(keycode: string | number): boolean {
        return Boolean(this.currentState[keycode]);
    }

    private onKeyDown(ev: KeyboardEvent): void {
        this.currentState[ev.keyCode] = true;
        if (this.registeredDownEvents[ev.keyCode]) {
            for (const f in this.registeredDownEvents[ev.keyCode]) {
                if (this.registeredDownEvents[ev.keyCode].hasOwnProperty(f)) {
                    this.registeredDownEvents[ev.keyCode][f](ev);
                }
            }
        }
    }

    private onKeyUp(ev: KeyboardEvent): void {
        this.currentState[ev.keyCode] = false;
        if (this.registeredUpEvents[ev.keyCode]) {
            for (const f in this.registeredUpEvents[ev.keyCode]) {
                if (this.registeredUpEvents[ev.keyCode].hasOwnProperty(f)) {
                    this.registeredUpEvents[ev.keyCode][f](ev);
                }
            }
        }
    }
}
