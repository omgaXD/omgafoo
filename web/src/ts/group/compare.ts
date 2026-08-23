import { getColorFromIndex } from "./dom";
import { VisSnapshot } from "./snapshot";

/**
 * Class with responsibility of visually comparing models of same model representation and describing their differences
 */
type Difference = {
	uniqueId: string;
	oldX: number;
	oldY: number;
	newX: number;
	newY: number;
};

export function calculateDifference(oldSnapshot: VisSnapshot, newSnapshot: VisSnapshot): Difference[] {
	return oldSnapshot
		.filter((oS) =>
			newSnapshot.some(
				(nS) =>
					oS.uniqueId === nS.uniqueId &&
					(0.1 < Math.abs(oS.top - nS.top + oS.height / 2 - nS.height / 2) ||
						0.1 < Math.abs(oS.left - nS.left + nS.width / 2 - oS.width / 2)),
			),
		)
		.map((oS) => {
			const nS = newSnapshot.find((nS) => nS.uniqueId === oS.uniqueId)!;
			return {
				newX: nS.left + nS.width / 2,
				newY: nS.top + nS.height / 2,
				oldX: oS.left + oS.width / 2,
				oldY: oS.top + oS.height / 2,
				uniqueId: oS.uniqueId,
			};
		});
}

export function drawDifferenceOnCanvas(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	differences: Difference[],
) {
	const { top: offsetY, left: offsetX } = canvas.getBoundingClientRect();
	ctx.lineCap = "round";
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (const diff of differences) {
		ctx.beginPath();
		ctx.lineWidth = 8;
		ctx.strokeStyle = 'black';
		drawArrow(diff, ctx, offsetX, offsetY);
		ctx.stroke();
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = getColorFromIndex(+diff.uniqueId).bg;
		drawArrow(diff, ctx, offsetX, offsetY);
		ctx.stroke();
	}
}

function drawArrow(diff: Difference, ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
	const arcAngle = (60 * Math.PI) / 180;
	const { diffX, diffY } = { diffX: diff.newX - diff.oldX, diffY: diff.newY - diff.oldY };
	const radius = Math.hypot(diffX, diffY) / 2 / Math.sin(arcAngle / 2);
	const angle = Math.atan2(diffX, -diffY);
	const { centerX, centerY } = {
		centerX: diff.oldX + diffX / 2 + diffY / 2 / Math.tan(arcAngle / 2),
		centerY: diff.oldY + diffY / 2 - diffX / 2 / Math.tan(arcAngle / 2),
	};
	ctx.arc(centerX - offsetX, centerY - offsetY, radius, angle + arcAngle / 2, angle - arcAngle / 2, true);
	// ctx.moveTo(diff.oldX - offsetX, diff.oldY - offsetY);
	// ctx.lineTo(centerX - offsetX, centerY - offsetY);
	// ctx.lineTo(diff.newX - offsetX, diff.newY - offsetY)
	ctx.moveTo(
		diff.newX - offsetX - 3 * Math.sin(-angle + arcAngle / 2),
		diff.newY - offsetY - 3 * Math.cos(-angle + arcAngle / 2),
	);
	ctx.lineTo(
		diff.newX - offsetX + 6 * Math.sin(-angle + Math.PI / 4 + arcAngle / 2),
		diff.newY - offsetY + 6 * Math.cos(-angle + Math.PI / 4 + arcAngle / 2),
	);
	ctx.lineTo(
		diff.newX - offsetX + 6 * Math.sin(-angle - Math.PI / 4 + arcAngle / 2),
		diff.newY - offsetY + 6 * Math.cos(-angle - Math.PI / 4 + arcAngle / 2),
	);
	ctx.lineTo(
		diff.newX - offsetX - 3 * Math.sin(-angle + arcAngle / 2),
		diff.newY - offsetY - 3 * Math.cos(-angle + arcAngle / 2),
	);
}
