import { TilePos } from "../../coreTypes";
import { Item } from "../../item";
import { IWorld } from "../../world/types";
import { propertyWithDefault } from "../buildingProperty";
import { IBuildingStrategy } from "../types";

type InventoryConfig = Partial<Record<Item | "*", { maxCount: number; accept: boolean; push: boolean }>>;
type Inventory = Partial<Record<Item, number>>;

export class InventoryStrategy implements IBuildingStrategy {
	readonly id = "inventory";
	inventoryConfig: (world: IWorld, pos: TilePos, value?: InventoryConfig) => InventoryConfig;
	inventory: (world: IWorld, pos: TilePos, value?: Inventory) => Inventory;
	constructor(private config: InventoryConfig) {
		this.inventoryConfig = propertyWithDefault(this, "inventoryConfig", this.config);
		this.inventory = propertyWithDefault(this, "inventory", {});
	}

	getItem(world: IWorld, pos: TilePos, item: Item) {
		return this.inventory(world, pos)[item] ?? 0;
	}
	setItem(world: IWorld, pos: TilePos, item: Item, count: number) {
		this.inventory(world, pos)[item] = count;
	}
	canReduceItem(world: IWorld, pos: TilePos, item: Item, count: number) {
		return (this.inventory(world, pos)[item] ?? 0) >= count;
	}
	getMaxForItem(world: IWorld, pos: TilePos, item: Item) {
		const conf = this.inventoryConfig(world, pos);
		if (conf[item] !== undefined) return conf[item].maxCount;
		else if (conf["*"] !== undefined) return conf["*"].maxCount;
		else return 0;
	}
	untilMax(world: IWorld, pos: TilePos, item: Item) {
		return this.getMaxForItem(world, pos, item) - (this.inventory(world, pos)[item] ?? 0);
	}

	addItem(world: IWorld, pos: TilePos, item: Item, count: number) {
		if (count < 0) throw Error();
		const inv = this.inventory(world, pos);
		this.setItem(world, pos, item, (inv[item] ?? 0) + count);
	}
	reduceItem(world: IWorld, pos: TilePos, item: Item, count: number) {
		if (count < 0) throw Error();
		if (!this.canReduceItem(world, pos, item, count)) throw Error();
		const inv = this.inventory(world, pos);
		this.setItem(world, pos, item, (inv[item] ?? 0) - count);
	}

	tick(world: IWorld, pos: TilePos): void {
		// some way to exchange items by reading/writing to dataService ig
	}
	onRemove(world: IWorld, pos: TilePos): void {
		this.inventoryConfig(world, pos, undefined);
		this.inventory(world, pos, undefined);
	}
}
