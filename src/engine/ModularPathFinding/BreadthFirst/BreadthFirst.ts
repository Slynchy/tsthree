import { PathAlgo } from "../PathAlgo";
import { NODE } from "../Node";
import { Vector2 as Vec2 } from "three";

export class BreadthFirst extends PathAlgo {
    constructor() {
        super();
    }

    public GeneratePath(
        _start: Vec2,
        _goal: Vec2,
        _map: NODE[][],
        _allowDiagonal: boolean,
        _ignoreObstacles: boolean
    ): NODE[] {
        const Q: NODE[] = [];
        const used_nodes: Vec2[] = [];
        Q.push(new NODE(_start.x, _start.y, false));
        used_nodes.push(Q[0].pos);

        while (Q.length !== 0) {
            const t: NODE = Q.shift();
            if (
                t.x === _goal.x &&
                t.y === _goal.y
            ) {
                return this.CleanUp(t);
            }

            // std::vector<NODE*> neighbours = GetNeighbors(t, &_map, _allowDiagonal);
            const neighbours: NODE[] = this.GetNeighbors(t, _map, _allowDiagonal);
            for (const node of neighbours) {
                if (
                    (node.x >= 0 && node.y >= 0) &&
                    (node.x < _map.length && node.y < _map[node.x].length)
                ) {
                    if (!_ignoreObstacles && _map[node.x][node.y].isObstacle === true) {
                        // It's an obstacle; close it off
                        used_nodes.push(node.pos);
                        continue;
                    }
                } else {
                    used_nodes.push(node.pos);
                    continue;
                }
                if (!this.PositionExistsInVector(used_nodes, node.pos)) {
                    // is not in the vector
                    if (
                        node.x === _goal.x &&
                        node.y === _goal.y
                    ) {
                        return this.CleanUp(node);
                    }
                    used_nodes.push(node.pos);
                    Q.push(node);
                }
            }
        }

        console.error(`BreadthFirst failed to find a path from (${_start.x},${_start.y}) to (${_goal.x},${_goal.y})`);
        return [];
    }
}
