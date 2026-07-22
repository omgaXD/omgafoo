import { Feature, features } from "../feature";
import { Item } from "../item";
import { decodeTile, tileHasTag, TileTag } from "../tile";
import { TilePos } from "../types/core";
import { IWorld } from "../world/types";
import { propertyWithDefault } from "./buildingProperty";
import { IBuildingStrategy } from "./types";

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

type InventoryConfig = Partial<Record<Item | "*", { maxCount: number; accept: boolean; push: boolean }>>;

export class InventoryStrategy implements IBuildingStrategy {
	readonly id = "inventory";
	inventoryConfig: (world: IWorld, pos: TilePos, value: InventoryConfig | undefined) => InventoryConfig | undefined;
	constructor(private config: InventoryConfig) {
		this.inventoryConfig = propertyWithDefault<InventoryConfig | undefined>(this, "inventoryConfig", this.config);
	}

	hasEnoughItem(world: IWorld, pos: TilePos, item: Item, count: number) {
		return true;
	}
	reduceItem(world: IWorld, pos: TilePos, item: Item, count: number) {}
	tick(world: IWorld, pos: TilePos): void {
		// some way to exchange items by reading/writing to dataService ig
	}
	onRemove(world: IWorld, pos: TilePos): void {
		this.inventoryConfig(world, pos, undefined);
	}
}

export class BurnForGoods implements IBuildingStrategy {
	readonly id = "burnForGoods";
	burnTime: (world: IWorld, pos: TilePos, value?: number) => number;
	burns: (world: IWorld, pos: TilePos, value?: boolean) => boolean;

	constructor(
		private burnMaxTime: number,
		private canBurn: (world: IWorld, pos: TilePos) => boolean,
		private startBurn: (world: IWorld, pos: TilePos) => void,
		private continueBurn: (world: IWorld, pos: TilePos) => void,
		private stopBurn: (world: IWorld, pos: TilePos) => void,
	) {
		this.burnTime = propertyWithDefault<number>(this, "burnTime", 0);
		this.burns = propertyWithDefault<boolean>(this, "burns", false);
	}

	tick(world: IWorld, pos: TilePos): void {
		if (this.burns(world, pos)) {
			const bt = this.burnTime(world, pos);
			if (bt === 0) {
				if (this.canBurn(world, pos)) {
					this.continueBurn(world, pos);
					this.burnTime(world, pos, this.burnMaxTime);
				} else {
					this.stopBurn(world, pos);
					this.burns(world, pos, false);
				}
			} else {
				this.burnTime(world, pos, bt - 1);
			}
		} else {
			if (this.canBurn(world, pos)) {
				this.startBurn(world, pos);
				this.burns(world, pos, true);
				this.burnTime(world, pos, this.burnMaxTime);
			}
		}
	}
}

export class TileTagWhitelistStrategy implements IBuildingStrategy {
	id='tileTagWhitelist'
	constructor (private tags: TileTag[]) {}
	canPlace(world: IWorld, pos: TilePos): boolean {
		return this.tags.some(t => tileHasTag(decodeTile(world.tile(pos)!).typeIndex, t));
	}
}
export class FeatureWhitelistStrategy implements IBuildingStrategy {
	id = "featureWhitelist";
	constructor(private tags: Feature[]) {}
	canPlace(world: IWorld, pos: TilePos): boolean {
		return this.tags.includes(features[decodeTile(world.tile(pos)!).featureIndex]);
	}
}