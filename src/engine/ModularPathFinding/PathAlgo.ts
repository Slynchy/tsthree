import { NODE } from "./Node";
import { Vector2 as Vec2 } from "three";

// tslint:disable-next-line:max-classes-per-file
export abstract class PathAlgo {
    public abstract GeneratePath(
        _start: Vec2,
        _goal: Vec2,
        _map: NODE[][],
        _allowDiagonal: boolean,
        _ignoreObstacles: boolean
    ): NODE[];

    public GetNeighbors(_start: NODE, _nmap: NODE[][], _allowDiagonal?: boolean): NODE[] {
        const neighbours: NODE[] = [];
        neighbours.push(new NODE(_start.x, _start.y + 1));
        neighbours.push(new NODE(_start.x, _start.y - 1));
        neighbours.push(new NODE(_start.x + 1, _start.y));
        neighbours.push(new NODE(_start.x - 1, _start.y));

        if (_allowDiagonal === true) {
            neighbours.push(new NODE(_start.x + 1, _start.y + 1));
            neighbours.push(new NODE(_start.x - 1, _start.y + 1));
            neighbours.push(new NODE(_start.x + 1, _start.y + 1));
            neighbours.push(new NODE(_start.x + 1, _start.y - 1));
        }
        for (const _node of neighbours) {
            _node.parent = _start;
        }

        return neighbours;
    }

    public PositionExistsInVector(
        _vec: Vec2[],
        _pos: Vec2
    ): Vec2 {
        return _vec.find((e: Vec2) => {
            return (e.x === _pos.x && e.y === _pos.y);
        });
    }

    public CleanUp(
        current: NODE,
        index: NODE[] = [],
        openList: NODE[] = [],
        closedList: NODE[] = [],
        openList_vec: Vec2[] = [],
        closedList_vec: Vec2[] = [],
    ): NODE[] {
        let endreached: boolean = false;
        let result: NODE[] = [];
        while (!endreached) {
            const temp: NODE = current;
            // temp.parent = null;
            if (temp) {
                result.push(new NODE(temp.x, temp.y, false));
            }
            if (!((current || {}).parent)) {
                endreached = true;
                break;
            } else {
                current = current.parent;
            }
        }
        for (const i in index) {
            if (index[i]) {
                index[i] = undefined;
            }
        }
        openList.length = 0;
        closedList.length = 0;
        openList_vec.length = 0;
        closedList_vec.length = 0;
        index.length = 0;
        result = result.reverse();
        return result;
    }
}
