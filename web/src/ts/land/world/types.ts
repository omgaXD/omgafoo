import { BuildingKind } from "../building/building";
import { StressConnectorStrategy, StressConsumerStrategy, StressProducerStrategy } from "../building/strategy";
import { Tile } from "../tile";
import { ChunkPos, CrudeTilePos, TilePos } from "../coreTypes";

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

export interface IWorldBuildingService extends IWorldService {
	getBuildings(): BuildingGen;
	getBuilding(pos: TilePos): BuildingKind | undefined;
	setBuilding(pos: TilePos, building: BuildingKind): void;
	canPlaceBuilding(pos: TilePos, building: BuildingKind): boolean;
}

export interface IWorldDataService extends IWorldService {
	getData<T extends JSONValue>(pos: TilePos, key: string): T | undefined;
	setData<T extends JSONValue>(pos: TilePos, key: string, value: T): void;
	data<T extends JSONValue>(pos: TilePos, key: string): { get: () => T | undefined; set: (t: T) => void };
}

export interface IWorldStressNetworkService extends IWorldService {
	trackProducer(pos: TilePos, strategy: StressProducerStrategy): void;
	trackConsumer(pos: TilePos, strategy: StressConsumerStrategy): void;
	trackConnector(pos: TilePos, strategy: StressConnectorStrategy): void;
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
