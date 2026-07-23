import { TilePos } from "../../coreTypes";
import { IWorld } from "../../world/types";
import { propertyWithDefault } from "../buildingProperty";
import { IBuildingStrategy } from "../types";

export class StressProducerStrategy implements IBuildingStrategy {
	readonly id = "stressProducer";
	active: (world: IWorld, pos: TilePos, value?: boolean) => boolean;

	constructor(public su: number) {
		this.active = propertyWithDefault<boolean>(this, "active", true);
	}

	onPlace(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.trackProducer(pos, this);
	}

	onRemove(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.untrack(pos);
	}
}

export class StressConsumerStrategy implements IBuildingStrategy {
	readonly id = "stressConsumer";
	constructor(public su: number) {}

	onPlace(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.trackConsumer(pos, this);
	}

	onRemove(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.untrack(pos);
	}
}

export class StressConnectorStrategy implements IBuildingStrategy {
	readonly id = "stressConnector";
	constructor(public range: number) {}

	onPlace(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.trackConnector(pos, this);
	}

	onRemove(world: IWorld, pos: TilePos): void {
		world.stressNetworkService.untrack(pos);
	}
}
