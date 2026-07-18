import { Feature, TileTag } from "./tile";
import { Icon } from "./types";

export type Building = {
	readonly shape: 1 | 3 | 7;
	readonly stressConnector?: { reach: number };
	readonly stressConsumer?: { su: number };
	readonly stressProducer?: { su: number };
	readonly allowedTileTags?: TileTag[];
	readonly allowedTileFeatures?: Feature[];
	readonly icon: Icon;
};

export type BuildingKind = keyof typeof buildings;

export type BuildingData<B extends BuildingKind = BuildingKind> = {
	b: B;
	rotation: (typeof buildings)[BuildingKind]["shape"] extends 3 ? 0 | 180 : 0;
};

export type PreviewBuildingData<B extends BuildingKind = BuildingKind> = BuildingData<B> & {preview: 'allowed' | 'disallowed'};

export const buildings = {
	waterWheel: {
		shape: 1,
		stressProducer: { su: 100 },
		allowedTileTags: ["water"],
		allowedTileFeatures: ["none"],
		icon: 'waterWheel-animated'
	},
	connector: { shape: 1, stressConnector: { reach: 4 }, allowedTileFeatures: ["none"], icon: 'connector' },
	rockCutter: { shape: 1, stressConsumer: { su: 20 }, allowedTileFeatures: ["stone"], icon: 'rockCutter' },
	big: { shape: 3, allowedTileFeatures: ["none"], icon: 'big-0' },
} as const satisfies Record<string, Building>;
