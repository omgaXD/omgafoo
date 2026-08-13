import { BuildingKind, buildings } from "../building/building";
import { IBuildingStrategy } from "../building/types";
import { $str, $unstr } from "../pos";
import { StringVec2, TilePos } from "../coreTypes";
import { BuildingGen, FinalCanPlaceVerdict, ISaveable, IWorld, IWorldBuildingService } from "./types";

export class WorldBuildingService implements IWorldBuildingService, ISaveable<[StringVec2, BuildingKind][]> {
	private _buildings: Map<StringVec2, BuildingKind> = new Map();
	constructor(private world: IWorld) {}
	*getBuildings(): BuildingGen {
		for (const [pos, building] of this._buildings) {
			yield [{ type: "tile", ...$unstr(pos) }, building];
		}
	}

	canPlaceBuilding(pos: TilePos, building: BuildingKind): FinalCanPlaceVerdict {
		return Object.entries(buildings[building].strategies).reduce((result: FinalCanPlaceVerdict, val: [string, IBuildingStrategy]) => {
			if (result.verdict === false) return result;
			const verdict = val[1].canPlace?.({world: this.world, pos}) ?? true;
			if (verdict === false) {
				return { verdict: false, preview: [], previewState: []} as FinalCanPlaceVerdict
			} else if (verdict === true) {
				return result;
			} else if (verdict.verdict === false) {
				return {
					verdict: false,
					preview: verdict.preview,
					previewState: verdict.previewState
				} as FinalCanPlaceVerdict;
			} else {
				return {
					verdict: true,
					preview: result.preview.concat(verdict.preview),
					previewState: Object.assign(result.previewState, verdict.previewState)
				} as FinalCanPlaceVerdict
			}
		}, { verdict: true, preview: [], previewState: []} as FinalCanPlaceVerdict)
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
