import { CanPlaceVerdict, IBuildingStrategy, StatelessStrategyProps, StrategyProps } from "../types";

type State = { active: boolean, direction: 'clock' | 'counterclock' };
export class StressNetworkElementStrategy implements IBuildingStrategy<State> {
	readonly id = "stressNetworkElement";
	constructor(public su: number) {}

	onPlace({ world, pos }: StrategyProps<State>): void {
		world.stressNetworkService.track(pos, this);
	}

	onRemove({ world, pos }: StrategyProps<State>): void {
		world.stressNetworkService.untrack(pos);
	}

	canPlace(props: StatelessStrategyProps<State>): CanPlaceVerdict<State> {
		return {
			verdict: true,
			previewState: {
				active: true,
				direction: 'counterclock'
			},
			preview: [
				{
					type: "rotation",
					direction: "clock",
					intent: "info",
					pos: props.pos,
				},
			],
		};
	}

	defaultState() {
		return { active: false, direction: 'clock' } satisfies State;
	}
}
