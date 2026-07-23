import { TilePos } from "../../coreTypes";
import { IWorld } from "../../world/types";
import { propertyWithDefault } from "../buildingProperty";
import { IBuildingStrategy } from "../types";

export class BurnForGoods implements IBuildingStrategy {
	readonly id = "burnForGoods";
	burnTime: (world: IWorld, pos: TilePos, value?: number) => number;
	burns: (world: IWorld, pos: TilePos, value?: boolean) => boolean;

	constructor(
		private burnMaxTime: number,
		private canBurn: (world: IWorld, pos: TilePos) => boolean,
		private startBurn: (world: IWorld, pos: TilePos) => void,
		private continueBurn: (world: IWorld, pos: TilePos) => void,
		private stopBurn: (world: IWorld, pos: TilePos) => void,
	) {
		this.burnTime = propertyWithDefault<number>(this, "burnTime", 0);
		this.burns = propertyWithDefault<boolean>(this, "burns", false);
	}

	tick(world: IWorld, pos: TilePos): void {
		if (this.burns(world, pos)) {
			const bt = this.burnTime(world, pos);
			if (bt === 0) {
				if (this.canBurn(world, pos)) {
					this.continueBurn(world, pos);
					this.burnTime(world, pos, this.burnMaxTime);
				} else {
					this.stopBurn(world, pos);
					this.burns(world, pos, false);
				}
			} else {
				this.burnTime(world, pos, bt - 1);
			}
		} else {
			if (this.canBurn(world, pos)) {
				this.startBurn(world, pos);
				this.continueBurn(world, pos);
				this.burns(world, pos, true);
				this.burnTime(world, pos, this.burnMaxTime);
			}
		}
	}
}
