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

export type Chunks = Map<StringVec2, Chunk>;
