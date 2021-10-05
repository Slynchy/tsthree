import {Vector2 as Vec2} from "three";

const DEFAULT_MOVE_COST: number = 1.0;

export class NODE {

    public x: number;
    public y: number;
    public gcost: number;
    public fcost: number;
    public h: number;
    public cost: number;
    public parent: NODE;
    public isObstacle: boolean;

    constructor(
        x?: number,
        y?: number,
        isObstacle?: boolean,
        _gcost?: number,
        _fcost?: number,
        _h?: number,
        _cost?: number
    ) {
        this.x = x || 0;
        this.y = y || 0;
        this.gcost = x || 0;
        this.fcost = y || Infinity;
        this.h = _h || 0;
        this.cost = _cost || DEFAULT_MOVE_COST;
        this.isObstacle = isObstacle || false;
    }

    get pos(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    set pos(val: Vec2) {
        this.x = val.x;
        this.y = val.y;
    }
}
