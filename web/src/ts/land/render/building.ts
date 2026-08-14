import { BuildingKind } from "../building/building";
import { CanvasCameraInfo, TilePos } from "../coreTypes";
import { IWorld } from "../world/types";
import { getBuildingBounds } from "./bounds";
import { drawIcon } from "./drawIcon";
import { BuildingModel, modelFactories } from "./model";

export function drawBuildings(world: IWorld, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
	for (const [pos, kind] of world.buildingService.getBuildings()) {
		drawPlacedBuilding(world, kind, pos, ctx, info);
	}
}

export function drawPlacedBuilding(world: IWorld, kind: BuildingKind, pos: TilePos, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
	const model = modelFactories[kind](world.buildingService.getBuildingState(pos, kind) ?? {});
	drawBuildingModel(model, pos, ctx, info);
}

export function drawBuildingModel(model: BuildingModel, pos: TilePos, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
	for (const layer of model.layers) {
		drawIcon(layer.icon, ctx, ...getBuildingBounds(pos, info), info.frame * (layer.animationMultiplier ?? 1));
	}
}