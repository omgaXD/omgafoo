import { PreviewInstruction, Intent } from "../building/types";
import { CanvasCameraInfo } from "../coreTypes";
import { tile2canvas } from "../pos";
import { getHexagonBounds } from "./bounds";
import { drawHexagon } from "./primitive";

const intentColorMap = {
	info: "#5539CC",
	connection: "#fff800",
    danger: '#ff4422',
    success: '#22ff66'
} as const satisfies Record<Intent, string>;
export function getIntentColor(intent: Intent): string {
	return intentColorMap[intent];
}

export type DisplayedPreviewInstruction = { addedAtFrame: number, removedAtFrame: number | null } & PreviewInstruction;

export function drawPreviewInstructions(
	instructions: Iterable<DisplayedPreviewInstruction>,
	ctx: CanvasRenderingContext2D,
	info: CanvasCameraInfo,
) {
	ctx.lineCap = "round";
	ctx.lineWidth = 10;
	for (const ins of instructions) {
		drawPreviewInstruction(ins, ctx, info);
	}
}

export function drawPreviewInstruction(
	ins: DisplayedPreviewInstruction,
	ctx: CanvasRenderingContext2D,
	info: CanvasCameraInfo,
) {
	const time = info.frame - ins.addedAtFrame;
	const timeSinceRemoved = info.frame - (ins.removedAtFrame ?? info.frame);
	switch (ins.type) {
		case "rotation":
			const rect = getHexagonBounds(ins.pos, info);
			ctx.strokeStyle = getIntentColor(ins.intent);
			let angleOffset = 0;
			let counterArrow = false;
			let clockArrow = false;
			switch (ins.direction) {
				case "clock":
					angleOffset = time;
					clockArrow = true;
					break;
				case "counterclock":
					angleOffset = -time;
					counterArrow = true;
					break;
				case "contradiction":
					angleOffset = time % 60 - 30;
					clockArrow = counterArrow = true;
					break;
			}
			ctx.fillStyle = getIntentColor(ins.intent);
			const offsetRad = 3 * (angleOffset * Math.PI / 180);
			const fullRad = Math.PI / 2;
			const clampedRad = (0.75 + 0.25 * Math.sin(time / 40)) * Math.min(time / 10, fullRad) * Math.max(0, (45 - timeSinceRemoved) / 45);
			ctx.beginPath();
			ctx.ellipse(rect[0] + rect[2]/2, rect[1] + rect[3]/2, rect[2] / 2, rect[3] / 2, 0, offsetRad, offsetRad + clampedRad);
			ctx.stroke();
			break;
		case "highlight":
			ctx.fillStyle = getIntentColor(ins.intent);
			drawHexagon(...getHexagonBounds(ins.pos, info), ctx);
			break;
		case "line":
			const { x: x0, y: y0 } = tile2canvas(ins.from, info);
			const { x: x1, y: y1 } = tile2canvas(ins.to, info);
			const grad = ctx.createLinearGradient(x0, y0, x1, y1);
			grad.addColorStop(0, getIntentColor(ins.intentFrom));
			grad.addColorStop(1, getIntentColor(ins.intentTo));
			ctx.strokeStyle = grad;
			ctx.beginPath();
			ctx.moveTo(x0, y0);
			ctx.lineTo(x1, y1);
			ctx.stroke();
			break;
	}
}
