import { BuildingKind, BuildingStates } from "./building/building";
import { Intent, PreviewInstruction } from "./building/types";
import { Camera, TilePos } from "./coreTypes";
import { IWorld } from "./world/types";

export type PreviewState = {
	building: BuildingPreview;
	instructions: { id: string; ins: PreviewInstruction }[];
};
export type BuildingPreview<T extends BuildingKind = BuildingKind> = {
	kind: T;
	state: Partial<BuildingStates[T]>;
	pos: TilePos;
	intent: Intent
};
export type State = {
	preview: PreviewState | null;
	world: IWorld;
	camera: Camera;
	logicCamera: Camera;
	tick: number;
};
