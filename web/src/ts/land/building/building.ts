import {
	BurnForGoods,
	FeatureWhitelistStrategy,
	InventoryStrategy,
	StressProducerStrategy,
	TileTagWhitelistStrategy,
} from "./strategy";
import { BuildingBase } from "./types";

export const buildings = {
	waterWheel: {
		strategies: [
			new StressProducerStrategy(100),
			new TileTagWhitelistStrategy(["water"]),
			new FeatureWhitelistStrategy(["none"]),
		],
	},
	rockCutter: (() => {
		const inventory = new InventoryStrategy({ stone: { accept: false, push: true, maxCount: 10 } });
		return {
			strategies: [
				inventory,
				new BurnForGoods(
					20,
					() => true,
					() => {},
					(world, pos) =>
						inventory.untilMax(world, pos, "stone") > 0 && inventory.addItem(world, pos, "stone", 1),
					() => {},
				),
				new FeatureWhitelistStrategy(["stone"]),
				new TileTagWhitelistStrategy(["land"]),
			],
		};
	})(),
} as const satisfies Record<string, BuildingBase>;

export type BuildingKind = keyof typeof buildings;
export type Building = (typeof buildings)[BuildingKind];
