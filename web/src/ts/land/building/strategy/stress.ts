import { IBuildingStrategy, StrategyProps } from "../types";

export class StressNetworkElementStrategy implements IBuildingStrategy<{}> {
	readonly id = "stressNetworkElement";
	constructor(public su: number) {}

	onPlace({ world, pos }: StrategyProps<{}>): void {
		world.stressNetworkService.track(pos, this);
	}

	onRemove({ world, pos }: StrategyProps<{}>): void {
		world.stressNetworkService.untrack(pos);
	}

	defaultState() {return{}}
}
