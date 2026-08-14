import { BuildingKind, BuildingStates } from "../building/building";
import { StrategyStates } from "../building/strategy/strategy";
import { StrategyProps } from "../building/types";
import { Icon } from "./icon";

export type BuildingModel = {
	layers: [
		{
			icon: Icon;
			/**
			 * default: 1
			 */
			animationMultiplier?: number;
			// some examples of future functionality
			// opacity: number,
			// filterOverride: string
		},
	];
};

export const modelFactories = {
	rockCutter: (props) => ({
		layers: [
			{
				icon: props.StressNetworkElementStrategy?.active ? "rockCutter-animated" : "rockCutter",
				animationMultiplier: props.StressNetworkElementStrategy?.direction === "clock" ? 1 : -1,
			},
		],
	}),
	waterWheel: (props) => ({
		layers: [
			{
				icon: props.StressNetworkElementStrategy?.active ? "waterWheel-animated" : "waterWheel",
				animationMultiplier: props.StressNetworkElementStrategy?.direction === "clock" ? 1 : -1,
			},
		],
	}),
} as const satisfies {
	[K in BuildingKind]: (props: Partial<StrategyStates>) => BuildingModel;
};
