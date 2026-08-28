export type TileBase = {};
export type PlayerTile = TileBase & {
	type: "player";
	side: "p1" | "p2";
	moveCount: 1 | 2;
};
export type NeutralTile = TileBase & {
	type: "neutral";
};
export type EmptyTile = TileBase & {
	type: "empty";
	collectedBy: "p1" | "p2" | null;
	wasPlayer: boolean;
};
export type Tile = PlayerTile | NeutralTile | EmptyTile;
export type Player = {
	side: "p1" | "p2";
	collected: number;
};

export type Rules = {
	tiles: (i: number, j: number) => Tile;
	width: number;
	height: number;
	turnOf: "p1" | "p2";
};

export type Field = {
	tiles: Tile[][];
	players: { p1: Player; p2: Player };
	turnOf: "p1" | "p2";
	state: "playing" | "p1-won" | "p2-won" | "tie";
};

export type Vec2 = { x: number; y: number };
export type MoveDir = "u" | "d" | "l" | "r";
export type ValidMove = {
	valid: true;
	/**
	 * first element is origin. last element is the last tile in the move sequence.
	 */
	coords: Vec2[]
	moves: MoveDir[];
	field: Field;
};
export type InvalidMove =
	| {
			valid: false;
			reason: "wrong-format";
			field: Field;
	  }
	| {
			valid: false;
			reason: `overflow-${MoveDir}` | "cant-move-this";
			/**
			 * contains one element - the origin
			 */
			coords: Vec2[];
			field: Field;
	  }
	| {
			valid: false;
			reason: "too-few-moves" | "too-many-moves";
			moves: MoveDir[];
			/**
			 * first element is origin. last element is the last tile in the move sequence.
			 */
			coords: Vec2[];
			field: Field;
	  };
export type MoveResult = ValidMove | InvalidMove;
