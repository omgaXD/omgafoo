import { BurnForGoods } from "./strategy/burnForGoods";
import { InventoryStrategy } from "./strategy/inventory";
import { StrategyStates, getStratState } from "./strategy/strategy";
import { StressNetworkElementStrategy } from "./strategy/stress";
import { TileTagWhitelistStrategy, FeatureWhitelistStrategy } from "./strategy/whitelist";
import { BuildingBase } from "./types";

export const buildings = {
	waterWheel: {
		strategies: {
			FeatureWhitelistStrategy: new FeatureWhitelistStrategy(["none"]),
			TileTagWhitelistStrategy: new TileTagWhitelistStrategy(["water"]),
			StressNetworkElementStrategy: new StressNetworkElementStrategy(100),
		},
	},
	rockCutter: (() => {
		const inventory = new InventoryStrategy({ stone: { accept: false, push: true, maxCount: 10 } });
		return {
			strategies: {
				InventoryStrategy: inventory,
				StressNetworkElementStrategy: new StressNetworkElementStrategy(-100),
				BurnForGoods: new BurnForGoods(
					20,
					() => true,
					() => {},
					(world, pos) =>
						inventory.untilMax(getStratState("InventoryStrategy", inventory, world, pos)(), "stone") > 0 &&
						inventory.addItem(getStratState("InventoryStrategy", inventory, world, pos)(), "stone", 1),
					() => {},
				),
				FeatureWhitelistStrategy: new FeatureWhitelistStrategy(["stone"]),
				TileTagWhitelistStrategy: new TileTagWhitelistStrategy(["land"]),
			},
		};
	})(),
} as const satisfies Record<string, BuildingBase>;

export type BuildingKind = keyof typeof buildings;
export type Building = (typeof buildings)[BuildingKind];
export type BuildingStates = {
	[B in BuildingKind]: {
		[K in keyof (typeof buildings)[B]["strategies"]]: K extends keyof StrategyStates ? StrategyStates[K] : never;
	};
};
