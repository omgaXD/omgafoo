import { IWorld, JSONValue } from "../world/types";
import { CrudeTilePos, TilePos } from "../coreTypes";
import { StrategyInstances } from "./strategy/registry";

export type StateGetSet<T extends JSONValue> = (value?: Partial<T>) => T;
export type StrategyProps<T extends JSONValue = {}> = {
	world: IWorld;
	pos: TilePos;
	state: StateGetSet<T>;
};

export type IBuildingStrategy<T extends JSONValue = {}> = {
	tick?(props: StrategyProps<T>): void;
	canPlace?(props: Omit<StrategyProps<T>, "state">): CanPlaceVerdict<T>;
	onPlace?(props: StrategyProps<T>): void;
	onRemove?(props: StrategyProps<T>): void;
	onNeighborChange?(props: StrategyProps<T>): void;
	defaultState(props: Omit<StrategyProps<T>, "state">): T;
};

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

export type CanPlaceVerdict<T extends JSONValue> =
	| {
			verdict: boolean;
			previewState?: T;
			preview: PreviewInstruction[];
	  }
	| boolean;
export type PreviewInstruction = RotationInstruction | TileHighlightInstruction | LinePreviewInstruction;
export type DisplayedPreviewInstruction = { addedAtTick: number } & PreviewInstruction;
export type BuildingBase = {
	strategies: Partial<StrategyInstances>;
};
