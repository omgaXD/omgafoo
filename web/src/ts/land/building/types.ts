import { IWorld } from "../world/types";
import { TilePos } from "../coreTypes";
import { Icon } from "../icon";

export interface IBuildingStrategy {
	readonly id: string;
	tick?(world: IWorld, pos: TilePos): void;
	canPlace?(world: IWorld, pos: TilePos): boolean;
	onPlace?(world: IWorld, pos: TilePos): void;
	onRemove?(world: IWorld, pos: TilePos): void;
	onNeighborChange?(world: IWorld, pos: TilePos): void;
}
export type BuildingBase = {
	icon: Icon;
	strategies: IBuildingStrategy[];
};
