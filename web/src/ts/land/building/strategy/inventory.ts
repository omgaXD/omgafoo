import { Item } from "../../item";
import { IBuildingStrategy, StrategyProps } from "../types";

type InventoryConfig = Partial<Record<Item | "*", { maxCount: number; accept: boolean; push: boolean }>>;
type Inventory = Partial<Record<Item, number>>;

type State = Inventory;

export class InventoryStrategy implements IBuildingStrategy<State> {
	readonly id = "inventory";
	constructor(private config: InventoryConfig) {}

	getItem(inventory: Inventory, item: Item) {
		return inventory[item] ?? 0;
	}
	setItem(inventory: Inventory, item: Item, count: number) {
		inventory[item] = count;
	}
	canReduceItem(inventory: Inventory, item: Item, count: number) {
		return (inventory[item] ?? 0) >= count;
	}
	getMaxForItem(item: Item) {
		const conf = this.config;
		if (conf[item] !== undefined) return conf[item].maxCount;
		else if (conf["*"] !== undefined) return conf["*"].maxCount;
		else return 0;
	}
	untilMax(inventory: Inventory, item: Item) {
		return this.getMaxForItem(item) - (inventory[item] ?? 0);
	}

	addItem(inventory: Inventory, item: Item, count: number) {
		if (count < 0) throw Error();
		this.setItem(inventory, item, inventory[item] ?? 0 + count);
	}
	reduceItem(inventory: Inventory, item: Item, count: number) {
		if (count < 0) throw Error();
		if (!this.canReduceItem(inventory, item, count)) throw Error();
		this.setItem(inventory, item, (inventory[item] ?? 0) - count);
	}

	tick({  }: StrategyProps<State>): void {
		// some way to exchange items by reading/writing to dataService ig
	}
	onRemove({ state }: StrategyProps<State>): void {
		state(undefined);
	}
	defaultState(): State {
		return {}
	}
}
