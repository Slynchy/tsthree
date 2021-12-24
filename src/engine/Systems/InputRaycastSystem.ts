import { System } from "./System";
import { InputRaycastComponent } from "../Components/InputRaycastComponent";
import { InteractionEvent as PIXIInteractionEvent, InteractionManager } from "pixi.js";
import { HelperFunctions } from "../HelperFunctions";
import { Box3 } from "three";

export class InputRaycastSystem extends System {
    constructor() {
        super();
    }

    public static destroy(_component: InputRaycastComponent): void {
    };

    public static onAwake(_component: InputRaycastComponent): void {
        const _3dRenderer = _component._engineRef.getRenderer();
        const _UIRenderer = _component._engineRef.getUIManager().getRenderer();

        if (!_component._interactionManager) {
            _component._interactionManager
                = new InteractionManager(_UIRenderer);
        }

        let collidedObj: Box3 = null;

        const pointerdown = (_e: PIXIInteractionEvent) => {
            collidedObj =
                HelperFunctions.raycastFromInteractionEvent(
                    _e,
                    _component._engineRef.getMainCamera(),
                    _component._boxesForRaycastRef
                ) as Box3;
            if (collidedObj) {
                InputRaycastSystem.fireEvent(_component, "_onPointerDown", _e, collidedObj);
            } else {
                collidedObj = null;
            }
        };
        const pointermove = (_e: PIXIInteractionEvent) => {
            if (collidedObj)
                InputRaycastSystem.fireEvent(_component, "_onPointerMove", _e, collidedObj);
        }
        const pointerup = (_e: PIXIInteractionEvent) => {
            if (collidedObj)
                InputRaycastSystem.fireEvent(_component, "_onPointerUp", _e, collidedObj);

            collidedObj = null;
        };
        _component._interactionManagerCache.push(...[pointerup, pointerdown, pointermove])
    };

    public static onStep(_dt: number, _component: InputRaycastComponent): void {
    };

    public static onDestroy(_component: InputRaycastComponent): void {
    };

    // tslint:disable-next-line:no-any
    private static fireEvent(_component: InputRaycastComponent, key: string, ...params: any[]): void {
        // @ts-ignore
        for (const ev in (_component[key]) as { [key: string]: Function; }) {
            // @ts-ignore
            if (_component[key][ev]) {
                // @ts-ignore
                _component[key][ev](...params);
            }
        }
    }

}
