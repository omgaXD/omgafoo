import { BuildingKind } from "../building/building";
import { Tile } from "../tile";
import { ChunkPos, CrudeTilePos, TilePos } from "../coreTypes";
import { StressNetworkElementStrategy } from "../building/strategy/stress";
import { StrategyStates } from "../building/strategy/registry";
import { PreviewInstruction } from "../building/types";

type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };

export interface ISaveable<T extends JSONValue> {
	save(): T;
	load(data: T | undefined): void;
}

export interface IWorldService {}

export interface IWorldServiceFactory<T extends IWorldService> {
	new (world: IWorld): T;
}

export type FinalCanPlaceVerdict = {
	verdict: boolean;
	previewState: Partial<StrategyStates>;
	preview: PreviewInstruction[];
}

export interface IWorldBuildingService extends IWorldService {
	getBuildings(): BuildingGen;
	getBuilding(pos: TilePos): BuildingKind | undefined;
	setBuilding(pos: TilePos, building: BuildingKind): void;
	canPlaceBuilding(pos: TilePos, building: BuildingKind): FinalCanPlaceVerdict;
}

export interface IWorldDataService extends IWorldService {
	getData<T extends JSONValue>(pos: TilePos, key: string): T | undefined;
	setData<T extends JSONValue>(pos: TilePos, key: string, value: T): void;
	data<T extends JSONValue>(pos: TilePos, key: string): { get: () => T | undefined; set: (t: T) => void };
}

export type StressCanPlaceVerdict =
	| { verdict: true; direction: "clock" | "counterclock"; connections: TilePos[] }
	| { verdict: false; direction: "contradiction"; clock: TilePos[]; counterclock: TilePos[] };

export interface IWorldStressNetworkService extends IWorldService {
	track(pos: TilePos, strategy: StressNetworkElementStrategy): void;
	canPlace(pos: TilePos, strategy: StressNetworkElementStrategy): StressCanPlaceVerdict;
	untrack(pos: TilePos): void;
}

export interface IWorld {
	dataService: IWorldDataService & ISaveable<JSONValue>;
	buildingService: IWorldBuildingService & ISaveable<JSONValue>;
	stressNetworkService: IWorldStressNetworkService & ISaveable<JSONValue>;

	getChunk(pos: ChunkPos): Chunk | undefined;
	hasChunk(pos: ChunkPos): boolean;
	createChunk(pos: ChunkPos): void;
	tile(pos: TilePos, setTo?: number | Tile): number | undefined;
	chunkGen(from: ChunkPos, to: ChunkPos): ChunkGen;
}

export type Chunk = {
	pos: ChunkPos;
	tiles: Uint8Array;
	visible: boolean;
	tileTypeCounts: Uint8Array;
	perimeters: Perimeter[];
};
export type ChunkGen = Generator<[ChunkPos, Chunk | undefined]>;
export type BuildingGen = Generator<[TilePos, BuildingKind]>;

export type Perimeter = CrudeTilePos[][];
