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
export type OptionalProps<B extends string, U extends Record<string, unknown>> = {
	yes: { [key in B]: true } & U;
	common: ({ [key in B]: true } & U) | ({ [key in B]?: false } & { [key in keyof U]?: never });
};