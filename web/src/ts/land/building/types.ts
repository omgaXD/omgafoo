import { IWorld, JSONValue } from "../world/types";
import { CrudeTilePos, StringVec2, TilePos } from "../coreTypes";
import { StrategyInstances, StrategyRegistry } from "./strategy/registry";

export type StateGetSet<T extends JSONValue> = (value?: Partial<T>) => T;
export type StrategyProps<T extends JSONValue = {}> = {
	world: IWorld;
	pos: TilePos;
	state: StateGetSet<T>;
};
export type StatelessStrategyProps<T extends JSONValue={}> = Omit<StrategyProps<T>, 'state'>

export type IBuildingStrategy<T extends JSONValue = {}> = {
	tick?(props: StrategyProps<T>): void;
	canPlace?(props: StatelessStrategyProps<T>): CanPlaceVerdict<T>;
	onPlace?(props: StrategyProps<T>): void;
	onRemove?(props: StrategyProps<T>): void;
	onNeighborChange?(props: StrategyProps<T>): void;
	defaultState(props: StatelessStrategyProps<T>): T;
};

export type Intent = "info" | "success" | "danger" | "connection";
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
export type BuildingBase = {
	strategies: Partial<StrategyInstances>;
};
