import { Component } from "../Component";
import { InteractionManager } from "pixi.js";
import { Box3 } from "three";
import { Engine } from "../Engine";
import { InteractionEvent } from "../Types/InteractionEvent";
import { HelperFunctions } from "../HelperFunctions";
import { InputRaycastSystem } from "../Systems/InputRaycastSystem";

type TPointerTypes = "pointerdown" | "pointerup" | "pointermove";

/**
 * Fires pointer events when the raycast hits a target obj
 */
export class InputRaycastComponent extends Component {

    public static readonly id: string = "InputRaycastComponent";
    protected static readonly _system: typeof InputRaycastSystem = InputRaycastSystem;

    public _interactionManagerCache: Function[] = [];

    public _engineRef: Engine;
    public _interactionManager: InteractionManager;
    public _boxesForRaycastRef: Box3[];

    private _onPointerDownInteractionEvent: InteractionEvent<Function>;
    private _onPointerUpInteractionEvent: InteractionEvent<Function>;
    private _onPointerMoveInteractionEvent: InteractionEvent<Function>;
    private _onPointerDown: { [key: string]: Function; } = {};
    private _onPointerUp: { [key: string]: Function; } = {};
    private _onPointerMove: { [key: string]: Function; } = {};

    constructor(
        _engineRef: Engine,
        _boxes?: Box3[]
    ) {
        super();
        this._engineRef = _engineRef;
        this._interactionManager = this._engineRef.getUIManager().getInteractionManager();

        this._onPointerDownInteractionEvent =
            HelperFunctions.createInteractionEvent(this, "_onPointerDown");
        this._onPointerUpInteractionEvent =
            HelperFunctions.createInteractionEvent(this, "_onPointerUp");
        this._onPointerMoveInteractionEvent =
            HelperFunctions.createInteractionEvent(this, "_onPointerMove");

        this._boxesForRaycastRef = _boxes;
    }

    public onPointerDown(): InteractionEvent<Function> {
        return this._onPointerDownInteractionEvent
    }

    public onPointerUp(): InteractionEvent<Function> {
        return this._onPointerUpInteractionEvent;
    }

    public onPointerMove(): InteractionEvent<Function> {
        return this._onPointerMoveInteractionEvent;
    }

    onAttach(): void {
        this._interactionManager.addListener("pointerup", this._interactionManagerCache[0]);
        this._interactionManager.addListener("pointerdown", this._interactionManagerCache[1]);
        this._interactionManager.addListener("pointermove", this._interactionManagerCache[2]);
    }

    onComponentAttached(_componentId: string, _component: Component): void {
    }

    onDetach(): void {
        this._interactionManager.removeListener("pointerup", this._interactionManagerCache[0]);
        this._interactionManager.removeListener("pointerdown", this._interactionManagerCache[1]);
        this._interactionManager.removeListener("pointermove", this._interactionManagerCache[2]);
        this._interactionManagerCache.length = 0;
    }

}
