import { CHUNK_SIZE } from "../const";
import { getType } from "../generation";
import { calculatePerimeters } from "../perimeter";
import { cwc2tile, $str, i2wc, tile2c, tile2wc, wc2i, xy2c } from "../pos";
import { encodeTile, tileTypes, type Tile } from "../tile";
import type { StringVec2, ChunkPos, TilePos } from "../coreTypes";
import { WorldBuildingService } from "./buildingService";
import { WorldDataService } from "./dataService";
import { WorldStressNetworkService } from "./stressNetworkService";
import {
	Chunk,
	ChunkGen,
	ISaveable,
	IWorld,
	IWorldBuildingService,
	IWorldDataService,
	IWorldService,
	IWorldServiceFactory,
	IWorldStressNetworkService,
	JSONValue,
} from "./types";

function serviceFactory<T extends IWorldService>(ctor: IWorldServiceFactory<T>, world: IWorld) {
	return new ctor(world);
}

type Chunks = Map<StringVec2, Chunk>;
export class World implements IWorld {
	private chunks: Chunks = new Map();
	dataService: IWorldDataService & ISaveable<JSONValue> = serviceFactory(WorldDataService, this);
	buildingService: IWorldBuildingService & ISaveable<JSONValue> = serviceFactory(WorldBuildingService, this);
	stressNetworkService: IWorldStressNetworkService & ISaveable<JSONValue> = serviceFactory(
		WorldStressNetworkService,
		this,
	);
	getChunk(pos: ChunkPos) {
		return this.chunks.get($str(pos));
	}
	hasChunk(pos: ChunkPos) {
		return this.chunks.has($str(pos));
	}
	createChunk(pos: ChunkPos) {
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
			perimeters: calculatePerimeters(tiles, pos),
		};

		this.chunks.set($str(pos), chunk);
	}
	tile(pos: TilePos, setTo?: number | Tile): number | undefined {
		const c = $str(tile2c(pos));
		const i = wc2i(tile2wc(pos));
		if (!this.chunks.has(c)) {
			return undefined;
		}
		if (setTo !== undefined) {
			if (typeof setTo !== "number") setTo = encodeTile(setTo);
			this.chunks.get(c)!.tiles[i] = setTo;
		}
		return this.chunks.get(c)!.tiles[i];
	}
	*chunkGen(from: ChunkPos, to: ChunkPos): ChunkGen {
		for (let x = from.x; x <= to.x; x++) {
			for (let y = from.y; y <= to.y; y++) {
				const pos = xy2c(x, y);
				yield [pos, this.getChunk(pos)] as [ChunkPos, Chunk | undefined];
			}
		}
	}
}

// export type BuildingGen = Generator<[TilePos, BuildingData]>;
// export function* buildingGen(from: ChunkPos, to: ChunkPos): BuildingGen {
// 	for (const [stp, b] of placedBuildings) {
// 		const tp: TilePos = { type: "tile", ...$unstr(stp) };
// 		const c = tile2c(tp);
// 		if (from.x <= c.x && c.x <= to.x && from.y <= c.y && c.y <= to.y) {
// 			yield [tp, b];
// 		}
// 	}
// }

// export function placeBuilding(b: PreviewBuildingData, tp: TilePos) {
// 	placedBuildings.set($str(tp), b);
// 	if (buildings[b.b].shape === 3) {
// 		if (b.rotation === 0) {
// 			placedBuildings.set($str({ x: tp.x + 2, y: tp.y }), { type: "partial", pointsTo: tp });
// 		}
// 	}
// }

// export function hasBuilding(tp: TilePos) {
// 	if (placedBuildings.has($str(tp))) return true;
// }
