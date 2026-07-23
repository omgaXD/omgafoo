import { BuildingKind, buildings } from "../building/building";
import { IBuildingStrategy } from "../building/types";
import { $str, $unstr } from "../pos";
import { StringVec2, TilePos } from "../coreTypes";
import { BuildingGen, ISaveable, IWorld, IWorldBuildingService } from "./types";

export class WorldBuildingService implements IWorldBuildingService, ISaveable<[StringVec2, BuildingKind][]> {
	private _buildings: Map<StringVec2, BuildingKind> = new Map();
	constructor(private world: IWorld) {}
	*getBuildings(): BuildingGen {
		for (const [pos, building] of this._buildings) {
			yield [{ type: "tile", ...$unstr(pos) }, building];
		}
	}

	canPlaceBuilding(pos: TilePos, building: BuildingKind): boolean {
		if (this._buildings.has($str(pos))) return false;
		return !buildings[building].strategies.some(
			(strat: IBuildingStrategy) => !(strat.canPlace?.(this.world, pos) ?? true),
		);
	}

	getBuilding(pos: TilePos): BuildingKind | undefined {
		return this._buildings.get($str(pos));
	}
	setBuilding(pos: TilePos, building: BuildingKind): void {
		this._buildings.set($str(pos), building);
	}
	save() {
		return [...this._buildings.entries()];
	}
	load(data: [StringVec2, BuildingKind][] | undefined): void {
		if (data !== undefined) {
			this._buildings = new Map(data);
		}
	}
}
