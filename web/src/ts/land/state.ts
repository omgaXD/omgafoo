import { BuildingKind } from "./building/building";
import { TilePos } from "./types/core";
import { World } from "./world/world";

export type BuildingPreview = {
	pos: TilePos;
	building: BuildingKind;
	preview: "allowed" | "disallowed";
};

export type State = {
	previews: BuildingPreview[];
	highlightedTiles: Record<"info" | "danger" | "success", TilePos[]>;
	world: World;
};
