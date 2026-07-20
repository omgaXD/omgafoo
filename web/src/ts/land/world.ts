import { BuildingData, PreviewBuildingData } from "./building";
import { CHUNK_SIZE } from "./const";
import { getType } from "./generation";
import { calculatePerimeters, Perimeter } from "./perimeter";
import { cwc2tile, $str, i2wc, tile2c, tile2wc, wc2i, xy2c, $unstr } from "./pos";
import { encodeTile, tileTypes, type Tile } from "./tile";
import type { StringVec2, ChunkPos, TilePos } from "./types";

export type Chunks = Map<StringVec2, Chunk>;
export type Chunk = {
	pos: ChunkPos;
	tiles: Uint8Array;
	visible: boolean;
	tileTypeCounts: Uint8Array;
	perimeters: Perimeter[]
};

export const world: Chunks = new Map<StringVec2, Chunk>();
export const placedBuildings = new Map<StringVec2, BuildingData>();

export function tile(pos: TilePos, setTo?: number | Tile): number | undefined {
	const c = $str(tile2c(pos));
	const i = wc2i(tile2wc(pos));
	if (!world.has(c)) {
		return undefined;
	}
	if (setTo !== undefined) {
		if (typeof setTo !== "number") setTo = encodeTile(setTo);
		world.get(c)!.tiles[i] = setTo;
	}
	return world.get(c)!.tiles[i];
}

export function createChunk(pos: ChunkPos) {
	const tiles = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
	const tileTypeCounts = new Uint8Array(tileTypes.length);
	for (let i = 0; i < CHUNK_SIZE * CHUNK_SIZE; i++) {
		const typeIndex = getType(cwc2tile(pos, i2wc(i)));
		const tile: Tile = {
			typeIndex,
			featureIndex: 0,
		};
		tiles[i] = encodeTile(tile);
		tileTypeCounts[typeIndex]++;
	}
	const chunk: Chunk = {
		visible: true,
		pos,
		tiles,
		tileTypeCounts,
		perimeters: calculatePerimeters(tiles, pos)
	};

	world.set($str(pos), chunk);
}
export function toggleChunk(pos: ChunkPos, state: boolean) {
	if (world.has($str(pos))) world.get($str(pos))!.visible = state;
}
export function hasChunk(pos: ChunkPos) {
	return world.has($str(pos));
}
export function getChunk(pos: ChunkPos) {
	return world.get($str(pos));
}

export type ChunkGen = Generator<[ChunkPos, Chunk | undefined]>;
export function* chunkGen(from: ChunkPos, to: ChunkPos): ChunkGen {
	for (let x = from.x; x <= to.x; x++) {
		for (let y = from.y; y <= to.y; y++) {
			const pos = xy2c(x, y);
			yield [pos, getChunk(pos)] as [ChunkPos, Chunk | undefined];
		}
	}
}

export type BuildingGen = Generator<[TilePos, BuildingData]>;
export function* buildingGen(from: ChunkPos, to: ChunkPos): BuildingGen {
	for (const [stp, b] of placedBuildings) {
		const tp: TilePos = { type: 'tile', ...$unstr(stp) };
		const c = tile2c(tp);
		if (from.x <= c.x && c.x <= to.x && from.y <= c.y && c.y <= to.y) {
			yield [tp, b];
		}
	}
}

export function placeBuilding(b: PreviewBuildingData, tp: TilePos) {
	placedBuildings.set($str(tp), b);
}