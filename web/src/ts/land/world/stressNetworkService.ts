import { StressNetworkElementStrategy } from "../building/strategy/stress";
import { StringVec2, TilePos } from "../coreTypes";
import { ISaveable, IWorld, IWorldStressNetworkService, PlacementVerdict } from "./types";

export class WorldStressNetworkService implements IWorldStressNetworkService, ISaveable<{ data: any }> {	
	constructor(private world: IWorld) {}
	canPlace(pos: TilePos, strategy: StressNetworkElementStrategy): PlacementVerdict {
		throw new Error("Method not implemented.");
	}
	
	track(pos: TilePos, strategy: StressNetworkElementStrategy): void {
		throw new Error("Method not implemented.");
	}
	untrack(pos: TilePos): void {
		throw new Error("Method not implemented.");
	}
	save(): { data: any } {
		throw new Error("Method not implemented.");
	}
	load(data: { data: any } | undefined): void {
		throw new Error("Method not implemented.");
	}
}
