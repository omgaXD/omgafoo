import { CanPlaceVerdict, IBuildingStrategy, StatelessStrategyProps, StrategyProps } from "../types";

export class StressNetworkElementStrategy implements IBuildingStrategy<{}> {
	readonly id = "stressNetworkElement";
	constructor(public su: number) {}

	onPlace({ world, pos }: StrategyProps<{}>): void {
		world.stressNetworkService.track(pos, this);
	}

	onRemove({ world, pos }: StrategyProps<{}>): void {
		world.stressNetworkService.untrack(pos);
	}

	canPlace(props: StatelessStrategyProps<{}>): CanPlaceVerdict<{}> {
		return {
			verdict: true,
			preview: [{
				type: 'rotation',
				direction: 'clock',
				intent: 'info',
				pos: props.pos
			}]
		}
	}

	defaultState() {return{}}
}
