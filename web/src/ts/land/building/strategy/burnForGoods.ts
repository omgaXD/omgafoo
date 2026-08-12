import { TilePos } from "../../coreTypes";
import { IWorld } from "../../world/types";
import { IBuildingStrategy, StrategyProps } from "../types";

type BurnForGoodsState = {burns: boolean, burnTime: number};
export class BurnForGoods implements IBuildingStrategy<BurnForGoodsState> {
	readonly id = "burnForGoods";

	constructor(
		private burnMaxTime: number,
		private canBurn: (world: IWorld, pos: TilePos) => boolean,
		private startBurn: (world: IWorld, pos: TilePos) => void,
		private continueBurn: (world: IWorld, pos: TilePos) => void,
		private stopBurn: (world: IWorld, pos: TilePos) => void,
	) {
	}

	tick({world, pos, state}: StrategyProps<BurnForGoodsState>): void {
		let {burns, burnTime} = state();
		if (burns) {
			if (burnTime === 0) {
				if (this.canBurn(world, pos)) {
					this.continueBurn(world, pos);
					burnTime = this.burnMaxTime
				} else {
					this.stopBurn(world, pos);
					burns = false;
				}
			} else {
				burnTime--;
			}
		} else {
			if (this.canBurn(world, pos)) {
				this.startBurn(world, pos);
				this.continueBurn(world, pos);
				burns = true;
				burnTime = this.burnMaxTime
			}
		}
		state({burns, burnTime});
	}
	defaultState(): BurnForGoodsState {
		return {
			burns: false,
			burnTime: 0
		}
	}
}
