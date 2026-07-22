import { FeatureWhitelistStrategy, StressProducerStrategy, TileTagWhitelistStrategy } from "./strategy";
import { BuildingBase } from "./types";

export const buildings = {
 	waterWheel: {
		icon: 'waterWheel-animated',
		strategies: [new StressProducerStrategy(100), new TileTagWhitelistStrategy(['water']), new FeatureWhitelistStrategy(['none'])]
	}
} as const satisfies Record<string, BuildingBase>;

export type BuildingKind = keyof typeof buildings;
export type Building = typeof buildings[BuildingKind];