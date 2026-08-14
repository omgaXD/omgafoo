import { TilePos } from "../../coreTypes";
import { IWorld } from "../../world/types";
import { IBuildingStrategy, StateGetSet } from "../types";
import { BurnForGoods } from "./burnForGoods";
import { InventoryStrategy } from "./inventory";
import { StressNetworkElementStrategy } from "./stress";
import { FeatureWhitelistStrategy, TileTagWhitelistStrategy } from "./whitelist";

export const strategyConstructors = {
	BurnForGoods,
	FeatureWhitelistStrategy,
	TileTagWhitelistStrategy,
	StressNetworkElementStrategy,
	InventoryStrategy,
} as const satisfies Record<string, { new (...args: any[]): IBuildingStrategy<any> }>;

export function getStratState<T extends keyof StrategyRegistry>(
	key: T,
	strat: IBuildingStrategy<StrategyStates[T]>,
	world: IWorld,
	pos: TilePos,
): StateGetSet<StrategyStates[T]> {
	const getset = (value?: Partial<StrategyStates[T]>) => {
		let obj = world.dataService.getData<StrategyStates[T]>(pos, key);
		if (obj === undefined) {
			const complete = Object.assign(obj ?? strat.defaultState({ world, pos }), value ?? {});
			world.dataService.setData<StrategyStates[T]>(pos, key, complete);
			return complete;
		}
		return obj;
	};

	return getset;
}

export type StrategyRegistry = typeof strategyConstructors;
export type StrategyInstances = { [K in keyof StrategyRegistry]: InstanceType<StrategyRegistry[K]> };
export type StrategyStates = {
	[K in keyof StrategyRegistry]: StrategyInstances[K] extends IBuildingStrategy<infer U> ? U : never;
};
export type Strategy = StrategyInstances[keyof StrategyRegistry];
