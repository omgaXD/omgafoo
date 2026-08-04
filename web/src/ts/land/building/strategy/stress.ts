import { TilePos } from "../../coreTypes";
import { IWorld } from "../../world/types";
import { IBuildingStrategy } from "../types";

export class StressNetworkElementStrategy implements IBuildingStrategy {
	readonly id = "stressNetworkElement";
	constructor(
		public su: number,
	) {}

	onPlace(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.track(pos, this);
	}

	onRemove(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.untrack(pos);
	}
}
