import { CHUNK_SIZE, TILE_H, TILE_W } from "./const";
import type { TilePos, WithinChunkPos, ChunkPos, Vec2, StringVec2, CrudeTilePos, CanvasPos } from "./types";

function mod(a: number, m: number) {
	if (a < 0) return ((a % m) + m) % m;
	else return a % m;
}

export function tile2wc(pos: TilePos): WithinChunkPos {
	return {
		type: "withinChunk",
		x: mod((pos.x - mod(pos.y, 2)) / 2, CHUNK_SIZE),
		y: mod(pos.y, CHUNK_SIZE),
	};
}
export function tile2c(pos: TilePos): ChunkPos {
	return {
		type: "chunk",
		x: Math.floor((pos.x - mod(pos.y, 2)) / 2 / CHUNK_SIZE),
		y: Math.floor(pos.y / CHUNK_SIZE),
	};
}
export function cwc2tile(c: ChunkPos, wc: WithinChunkPos): TilePos {
	return {
		type: "tile",
		x: c.x * CHUNK_SIZE * 2 + wc.x * 2 + (wc.y % 2),
		y: c.y * CHUNK_SIZE + wc.y,
	};
}
export function i2wc(i: number): WithinChunkPos {
	return {
		type: "withinChunk",
		x: i % CHUNK_SIZE,
		y: Math.floor(i / CHUNK_SIZE),
	};
}
export function xy2wc(i: number, j: number): WithinChunkPos {
	return {
		type: "withinChunk",
		x: i,
		y: j,
	};
}
export function xy2c(i: number, j: number): ChunkPos {
	return {
		type: "chunk",
		x: i,
		y: j,
	};
}
export function wc2i(pos: WithinChunkPos): number {
	return pos.y * CHUNK_SIZE + pos.x;
}
export function $str(v: Vec2): StringVec2 {
	return `${v.x};${v.y}`;
}
export function $unstr(s: StringVec2): Vec2 {
	const split = s.split(";");
	return {
		x: +split[0],
		y: +split[1],
	};
}

export function posEquals(a: Vec2, b: Vec2) {
	return a.x === b.x && a.y === b.y;
}

export type CanvasCameraInfo = {
	canvasWidth: number;
	canvasHeight: number;
	cameraPos: CrudeTilePos;
	cameraScale: number;
};

export function canvas2crude(pos: CanvasPos, info: CanvasCameraInfo): CrudeTilePos {
	const centerX = info.canvasWidth / 2;
	const centerY = info.canvasHeight / 2;

	const tileX = (pos.x - centerX) / (TILE_W * 0.5 * info.cameraScale) + info.cameraPos.x;
	const tileY = (pos.y - centerY) / (TILE_H * 0.75 * info.cameraScale) + info.cameraPos.y;

	return {
		type: "crude",
		x: tileX,
		y: tileY,
	};
}

export function crude2tile(pos: CrudeTilePos): TilePos {
	const t1X = Math.round(pos.x / 2) * 2;
	const t1Y = Math.round(pos.y / 2) * 2;
	const t2X = Math.round((pos.x + 1) / 2) * 2 - 1;
	const t2Y = Math.round((pos.y + 1) / 2) * 2 - 1;

	const d1 = (t1X - pos.x) ** 2 + 3 * (t1Y - pos.y) ** 2;
	const d2 = (t2X - pos.x) ** 2 + 3 * (t2Y - pos.y) ** 2;

	if (d1 < d2) return { type: "tile", x: t1X, y: t1Y };
	else return { type: "tile", x: t2X, y: t2Y };
}

export function canvas2tile(pos: CanvasPos, info: CanvasCameraInfo): TilePos {
	return crude2tile(canvas2crude(pos, info));
}

export function tile2canvas(pos: TilePos | CrudeTilePos, info: CanvasCameraInfo): CanvasPos {
	const centerX = info.canvasWidth / 2;
	const centerY = info.canvasHeight / 2;

	return {
		type: "canvas",
		x: (pos.x - info.cameraPos.x) * info.cameraScale * TILE_W * 0.5 + centerX,
		y: (pos.y - info.cameraPos.y) * info.cameraScale * TILE_H * 0.75 + centerY,
	};
}

export function getVisibleChunkPoses(info: CanvasCameraInfo, outset: number = 0): [ChunkPos, ChunkPos] {
	const tl = canvas2tile({ type: "canvas", x: 0, y: 0 }, info);
	const br = canvas2tile({ type: "canvas", x: info.canvasWidth, y: info.canvasHeight }, info);
	tl.x -= outset;
	tl.y -= outset;
	br.x += outset;
	br.y += outset;

	return [tile2c(tl), tile2c(br)];
}
