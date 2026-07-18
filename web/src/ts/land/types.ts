export type Vec2 = { x: number; y: number };
export type CanvasPos = Vec2 & { type: "canvas" };
export type WithinChunkPos = Vec2 & { type: "withinChunk" };
export type ChunkPos = Vec2 & { type: "chunk" };
export type CrudeTilePos = Vec2 & { type: "crude" };
export type TilePos = Vec2 & { type: "tile" };
export type StringVec2 = `${number};${number}`;
export type Camera = {
	pos: CrudeTilePos;
	scale: number;
};
export type Chunk = {
	pos: ChunkPos;
	tiles: Uint8Array;
	visible: boolean;
	tileTypeCounts: Uint8Array;
};
export type Icon =
	| "tree-1"
	| "tree-2"
	| "palm"
	| "stone-1"
	| "stone-2"
	| "sandstone-1"
	| "sandstone-2"
	| "waterstone-1"
	| "waterstone-2"
	| "x"
	| "waterWheel"
	| "waterWheel-animated"
	| "connector"
	| "rockCutter"
	| "big-0"
	| "big-180"

export type Chunks = Map<StringVec2, Chunk>;
