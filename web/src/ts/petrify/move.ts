import { parseLetterCoord } from "./letterCoords";
import { Field, MoveDir, MoveResult, Vec2 } from "./types";

export function parseMove(field: Field, command: string, checkMoveCount: boolean): MoveResult {
	const regex = new RegExp("([a-j]+)([0-9]+)([udlr]*)");
	const result = regex.exec(command);
	if (result === null) return { valid: false, reason: "wrong-format", field };
	const row = parseLetterCoord(result[1]) - 1;
	const col = +result[2] - 1;
	const moves = result[3] === '' ? [] : result[3].split("") as MoveDir[];
    console.log(row);
	const coords = [] as Vec2[];
	if (row < 0) return { valid: false, reason: "overflow-l", coords, field };
	if (row >= field.tiles.length) return { valid: false, reason: "overflow-r", coords, field };
	if (col < 0) return { valid: false, reason: "overflow-u", coords, field };
	if (col >= field.tiles[0].length) return { valid: false, reason: "overflow-d", coords, field };
    coords.push({ x: col, y: row });
    for (const move of moves) {
        const newPos = clampedVec2PlusDir(field, coords[coords.length - 1], move);
        if (newPos.success === false) {
            return { valid: false, reason: newPos.result, coords, field } 
        }
        coords.push(newPos.result);
        if (field.tiles[newPos.result.y][newPos.result.x].type != 'neutral') return { valid: false, reason: 'cant-move-this', coords, field};
    }
	if (checkMoveCount) {
		const tile = field.tiles[row][col];
		if (tile.type != "player") {
			return { valid: false, reason: "cant-move-this", coords, field };
		}
		if (tile.side != field.turnOf) {
			return { valid: false, reason: "cant-move-this", coords, field };
		}
		if (tile.moveCount > moves.length) {
			return { valid: false, reason: "too-few-moves", coords, moves: moves, field };
		}
		if (tile.moveCount < moves.length) {
			return { valid: false, reason: "too-many-moves", coords, moves: moves, field };
		}
	}
	return {
		valid: true,
		moves: moves as MoveDir[],
		coords,
		field,
	};
}

type Vec2Result =
    | {
            success: true;
            result: Vec2;
      }
    | {
            success: false;
            result: `overflow-${MoveDir}`;
      };

export function clampedVec2PlusDir(field: Field, vec: Vec2 | Vec2Result, dir: MoveDir): Vec2Result {
    if ("success" in vec) {
        if (vec.success === false) return vec;
        vec = vec.result;
    }
    const result = vec2PlusDir(vec, dir);
    if (result.x < 0) return { success: false, result: "overflow-l" };
    if (result.x >= field.tiles[0].length) return { success: false, result: "overflow-r" };
    if (result.y < 0) return { success: false, result: "overflow-u" };
    if (result.y >= field.tiles.length) return { success: false, result: "overflow-d" };
    return { success: true, result };
}
export function vec2PlusDir(vec: Vec2, dir: MoveDir): Vec2 {
    switch (dir) {
        case "u":
            return { x: vec.x, y: vec.y - 1 };
        case "d":
            return { x: vec.x, y: vec.y + 1 };
        case "l":
            return { x: vec.x - 1, y: vec.y };
        case "r":
            return { x: vec.x + 1, y: vec.y };
    }
}