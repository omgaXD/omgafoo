import { BuildingKind } from "./building/building";
import { Intent, PreviewInstruction } from "./building/types";
import { Camera, TilePos } from "./coreTypes";
import { IWorld, JSONValue } from "./world/types";

export type PreviewState = {
	building: BuildingPreview;
	instructions: { id: string; ins: PreviewInstruction }[];
};
export type BuildingPreview = {
	kind: BuildingKind;
	state: JSONValue;
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
