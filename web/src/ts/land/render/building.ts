import { BuildingKind } from "../building/building";
import { CanvasCameraInfo, TilePos } from "../coreTypes";
import { IWorld } from "../world/types";
import { getBuildingBounds } from "./bounds";
import { drawIcon } from "./drawIcon";
import { Icon } from "./icon";

export function drawBuildings(world: IWorld, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
	for (const [pos, kind] of world.buildingService.getBuildings()) {
		drawIcon(getIconForBuidling(pos, kind, world), ctx, ...getBuildingBounds(pos, info), info.frame);
	}
}

export function getIconForBuidling(pos: TilePos, kind: BuildingKind, world: IWorld): Icon {
	switch (kind) {
		case 'rockCutter':
			return 'rockCutter-animated'
		case 'waterWheel':
			return 'waterWheel-animated'
		default:
			return 'x'
	}
}