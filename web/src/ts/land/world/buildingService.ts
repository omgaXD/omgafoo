import { BuildingKind, buildings, BuildingStates } from "../building/building";
import { IBuildingStrategy } from "../building/types";
import { $str, $unstr } from "../pos";
import { StringVec2, TilePos } from "../coreTypes";
import { BuildingGen, FinalCanPlaceVerdict, ISaveable, IWorld, IWorldBuildingService } from "./types";
import { getStratState, StrategyRegistry, StrategyStates } from "../building/strategy/strategy";

export class WorldBuildingService implements IWorldBuildingService, ISaveable<[StringVec2, BuildingKind][]> {
	private _buildings: Map<StringVec2, BuildingKind> = new Map();
	constructor(private world: IWorld) {}
	*getBuildings(): BuildingGen {
		for (const [pos, building] of this._buildings) {
			yield [{ type: "tile", ...$unstr(pos) }, building];
		}
	}

	canPlaceBuilding<T extends BuildingKind>(pos: TilePos, building: T): FinalCanPlaceVerdict<T> {
		return Object.entries(buildings[building].strategies).reduce(
			(result: FinalCanPlaceVerdict<T>, val: [string, IBuildingStrategy]) => {
				if (result.verdict === false) return result;
				const verdict = val[1].canPlace?.({ world: this.world, pos }) ?? true;
				if (verdict === false) {
					return { verdict: false, preview: [], previewState: {} } satisfies FinalCanPlaceVerdict<T>;
				} else if (verdict === true) {
					return result;
				} else if (verdict.verdict === false) {
					return {
						verdict: false,
						preview: verdict.preview,
						previewState: {[val[0]]: verdict.previewState},
					} satisfies FinalCanPlaceVerdict<T>;
				} else {
					return {
						verdict: true,
						preview: result.preview.concat(verdict.preview),
						previewState: Object.assign(result.previewState, {[val[0]]: verdict.previewState}),
					} satisfies FinalCanPlaceVerdict<T>;
				}
			},
			{ verdict: true, preview: [], previewState: {} } satisfies FinalCanPlaceVerdict<T>,
		);
	}

	getBuilding(pos: TilePos): BuildingKind | undefined {
		return this._buildings.get($str(pos));
	}
	setBuilding(pos: TilePos, building: BuildingKind): void {
		this._buildings.set($str(pos), building);
	}
	getBuildingState<T extends BuildingKind | undefined>(
		pos: TilePos,
		assumedKind?: T,
	): (T extends BuildingKind ? BuildingStates[T] : Partial<StrategyStates>) | null {
		const kind = this.getBuilding(pos);
		if (kind === undefined) return null;
		else if (assumedKind !== undefined && assumedKind !== kind) return null;
		return (Object.entries(buildings[kind].strategies) as [keyof StrategyRegistry, IBuildingStrategy][]).map(
			([key, strat]) => getStratState(key, strat, this.world, pos),
		) as any; // hopefully this can be rewritten without any TODO
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
