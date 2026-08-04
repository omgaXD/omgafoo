import { IWorld } from "../world/types";
import { CrudeTilePos, TilePos } from "../coreTypes";

export interface IBuildingStrategy {
	readonly id: string;
	tick?(world: IWorld, pos: TilePos): void;
	canPlace?(world: IWorld, pos: TilePos): CanPlaceVerdict
	onPlace?(world: IWorld, pos: TilePos): void;
	onRemove?(world: IWorld, pos: TilePos): void;
	onNeighborChange?(world: IWorld, pos: TilePos): void;
}

type Intent = "info" | "success" | "danger" | "connection";
type LinePreviewInstruction = {
	type: "line";
	intentFrom: Intent;
	intentTo: Intent;
	from: CrudeTilePos;
	to: CrudeTilePos;
};
type TileHighlightInstruction = {
	type: "highlight";
	intent: Intent;
	pos: TilePos;
};
type RotationInstruction = {
	type: "rotation";
	intent: Intent;
	pos: TilePos;
	direction: "clock" | "counterclock" | "contradiction";
};

export type CanPlaceVerdict = {
	verdict: boolean;
	preview: PreviewInstruction[]
} | boolean;
export type PreviewInstruction = RotationInstruction | TileHighlightInstruction | LinePreviewInstruction;
export type BuildingBase = {
	strategies: IBuildingStrategy[];
};
