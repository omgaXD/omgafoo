import { Intent } from "../building/types";
import { CanvasCameraInfo } from "../coreTypes";
import { BuildingPreview } from "../state";
import { IWorld } from "../world/types";
import { getBuildingBounds } from "./bounds";
import { getIconForBuidling } from "./building";
import { drawIcon } from "./drawIcon";
import { DisplayedPreviewInstruction, drawPreviewInstructions } from "./previewInstruction";

export function drawPreview(buildingPreview: BuildingPreview, previewInstructions: Iterable<DisplayedPreviewInstruction>, world: IWorld, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
    drawBuildingPreview(buildingPreview, world, ctx, info);
    drawPreviewInstructions(previewInstructions, ctx, info);
}

function getIntentFilter(intent: Intent) {
    return ({
        success: "brightness(0) saturate(100%) invert(75%) sepia(62%) saturate(430%) hue-rotate(81deg) brightness(96%) contrast(85%)",
        danger: "brightness(0) saturate(100%) invert(55%) sepia(54%) saturate(4822%) hue-rotate(332deg) brightness(106%) contrast(93%)",
        connection: "",
        info: ""
    } satisfies Record<Intent, string>)[intent];
}

export function drawBuildingPreview(preview: BuildingPreview, world: IWorld, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
    ctx.filter = getIntentFilter(preview.intent);
    drawIcon(getIconForBuidling(preview.pos, preview.kind, world), ctx, ...getBuildingBounds(preview.pos, info), info.frame);

    ctx.filter = "none";
}
