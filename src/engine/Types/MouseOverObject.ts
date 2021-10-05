import { MouseOverState } from "./MouseOverState";
import { Vector2 as Vec2 } from "three";

export interface MouseOverObject {
    pos: Vec2;
    dimensions: Vec2;
    onclick?: (ev: MouseEvent) => void;
    onmouseenter?: (ev: MouseEvent) => void;
    onmouseexit?: (ev: MouseEvent) => void;
    onmousemove?: (ev: MouseEvent) => void;
    _currState?: MouseOverState;
}
