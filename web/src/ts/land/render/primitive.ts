export function drawHexagon(x: number, y: number, w: number, h: number, ctx:CanvasRenderingContext2D) {
	ctx.beginPath();
	batchHexagon(x, y, w, h, ctx);
	ctx.fill();
}

export function batchHexagon(x: number, y: number, w: number, h: number, ctx: CanvasRenderingContext2D) {
	ctx.moveTo(Math.floor(x + w / 2), y);
	ctx.lineTo(x + w, Math.floor(y + h / 4));
	ctx.lineTo(x + w, Math.ceil(y + (3 * h) / 4));
	ctx.lineTo(Math.floor(x + w / 2), y + h);
	ctx.lineTo(x, Math.ceil(y + (3 * h) / 4));
	ctx.lineTo(x, Math.floor(y + h / 4));
}
