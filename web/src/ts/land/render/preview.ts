import { CanvasCameraInfo, TilePos } from "../coreTypes";
import { BuildingPreview } from "../state";
import { IWorld } from "../world/types";
import { getBuildingBounds } from "./bounds";
import { getIconForBuidling } from "./building";
import { drawIcon } from "./drawIcon";

function drawBuildingPreview(preview: BuildingPreview, world: IWorld, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
    ctx.filter =
        preview.preview === "allowed"
            ? "brightness(0) saturate(100%) invert(75%) sepia(62%) saturate(430%) hue-rotate(81deg) brightness(96%) contrast(85%)"
            : "brightness(0) saturate(100%) invert(55%) sepia(54%) saturate(4822%) hue-rotate(332deg) brightness(106%) contrast(93%)";

    drawIcon(getIconForBuidling(preview.pos, preview.building, world), ctx, ...getBuildingBounds(preview.pos, info), info.frame);

    ctx.filter = "none";
}

export function drawBuildingPreviews(
	previews: BuildingPreview[],
	world: IWorld,
	ctx: CanvasRenderingContext2D,
	info: CanvasCameraInfo,
) {
    for (const p of previews) {
        drawBuildingPreview(p, world, ctx, info);
    }
}