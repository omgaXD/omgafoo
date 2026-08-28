import { vec2PlusDir } from "./move";
import { Field, MoveDir, Player, PlayerTile, Rules, ValidMove, Vec2 } from "./types";

export function defaultRules(width: number = 8, height: number = 6): Rules {
	return {
		width,
		height,
		tiles: (j,i) => {
			if (i === 0) return { type: "player", moveCount: j % 2 == 0 ? 2 : 1, side: "p1" };
			else if (i === width - 1) return { type: "player", moveCount: j % 2 == 0 ? 2 : 1, side: "p2" };
			else return { type: "neutral" };
		},
		turnOf: "p1",
	};
}

export function createField(rules: Rules): Field {
	const p1: Player = { side: "p1", collected: 0 };
	const p2: Player = { side: "p2", collected: 0 };
	const field: Field = {
		tiles: Array.from({ length: rules.height }).map((_, i) =>
			Array.from({ length: rules.width }).map((_, j) => rules.tiles(i, j)),
		),
		players: { p1, p2 },
		turnOf: rules.turnOf,
		state: "playing",
	};
	return field;
}

function tileAt(field: Field, vec: Vec2) {
	return field.tiles[vec.y][vec.x];
}

export function doMove({ field, coords }: ValidMove): void {
	const playerTile = tileAt(field, coords[0]) as PlayerTile;

	coords.slice(0, -1).forEach((c) => {
		field.tiles[c.y][c.x] = { type: "empty", collectedBy: field.turnOf, wasPlayer: false };
	});
	const { x: lastX, y: lastY } = coords[coords.length - 1];
	field.tiles[lastY][lastX] = playerTile;
	field.players[playerTile.side].collected += coords.length - 1;

	// Kill all player tiles that have no valid moves
	for (let y = 0; y < field.tiles.length; y++) {
		for (let x = 0; x < field.tiles[0].length; x++) {
			const tile = field.tiles[y][x];
			if (tile.type === "player") {
				if (!hasValidMoves(field, { x, y })) {
					field.tiles[y][x] = { type: "empty", collectedBy: field.turnOf, wasPlayer: true };
					field.players[field.turnOf].collected += 1;
				}
			}
		}
	}

	// Change turn only if the other player still has player tiles
	const otherPlayerSide = field.turnOf === "p1" ? "p2" : "p1";
	const playersWithTiles = whichPlayersHaveTiles(field);
	const thisPlayerHasTiles = playersWithTiles[field.turnOf];
	const otherPlayerHasTiles = playersWithTiles[otherPlayerSide];
	if (otherPlayerHasTiles) {
		field.turnOf = field.turnOf === "p1" ? "p2" : "p1";
	}
	if (!thisPlayerHasTiles && !otherPlayerHasTiles) {
		endGame(field);
	}
}

function whichPlayersHaveTiles(field: Field): { p1: boolean; p2: boolean } {
	let p1has = false;
	let p2has = false;
	for (let y = 0; y < field.tiles.length; y++) {
		for (let x = 0; x < field.tiles[0].length; x++) {
			const tile = field.tiles[y][x];
			if (tile.type === "player") {
				if (tile.side === "p1") {
					p1has = true;
				} else if (tile.side === "p2") {
					p2has = true;
				}
			}
		}
	}
	return { p1: p1has, p2: p2has };
}

function endGame(field: Field) {
	const p1score = field.players.p1.collected;
	const p2score = field.players.p2.collected;
	if (p1score > p2score) {
		field.state = "p1-won";
	} else if (p2score > p1score) {
		field.state = "p2-won";
	} else {
		field.state = "tie";
	}
}

function hasValidMoves(field: Field, vecPos: Vec2): boolean {
	const tile = field.tiles[vecPos.y][vecPos.x];
	if (tile.type !== "player") {
		return false;
	}

	// If all neighboring tiles are oob, empty, or player, return false
	const directions: MoveDir[] = ["u", "d", "l", "r"];
	for (const dir1 of directions) {
		const pos1 = vec2PlusDir(vecPos, dir1);
		if (pos1.x < 0 || pos1.x >= field.tiles[0].length || pos1.y < 0 || pos1.y >= field.tiles.length) {
			continue;
		}
		const tile1 = field.tiles[pos1.y][pos1.x];
		if (tile1.type === "neutral") {
			if (tile.moveCount === 1) {
				return true;
			} else {
				for (const dir2 of directions) {
					const pos2 = vec2PlusDir(pos1, dir2);
					if (pos2.x < 0 || pos2.x >= field.tiles[0].length || pos2.y < 0 || pos2.y >= field.tiles.length) {
						continue;
					}
					if (pos2.x === vecPos.x && pos2.y === vecPos.y) {
						continue; // Can't move back to original position
					}
					const tile2 = field.tiles[pos2.y][pos2.x];
					if (tile2.type === "neutral") {
						return true;
					}
				}
			}
		}
	}
	return false;
}
