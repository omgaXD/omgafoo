import { StressProducerStrategy, StressConsumerStrategy, StressConnectorStrategy } from "../building/strategy";
import { TilePos } from "../coreTypes";
import { ISaveable, IWorld, IWorldStressNetworkService } from "./types";

export class WorldStressNetworkService implements IWorldStressNetworkService, ISaveable<{ data: any }> {
	constructor(private world: IWorld) {}

	trackProducer(pos: TilePos, strategy: StressProducerStrategy): void {
		throw new Error("Method not implemented.");
	}
	trackConsumer(pos: TilePos, strategy: StressConsumerStrategy): void {
		throw new Error("Method not implemented.");
	}
	trackConnector(pos: TilePos, strategy: StressConnectorStrategy): void {
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
