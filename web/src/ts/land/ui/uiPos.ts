import { canvas } from "../canvas";

export type UIPosSource = {
	type: "lurdwh";
	left?: number;
	right?: number;
	top?: number;
	bottom?: number;
	width?: number;
	height?: number;
};

export type ComponentBounds = {
	x: number;
	y: number;
	w: number;
	h: number;
};

export function uiPos(pos: UIPosSource): () => ComponentBounds {
	return () => {
		const canvasW = canvas.width;
		const canvasH = canvas.height;

		switch (pos.type) {
			case "lurdwh":
				const xC = def3(pos.left, pos.right, pos.width);
				if (xC < 2) {
					throw Error("x axis not enough");
				} else if (xC > 2) {
					throw Error("x axis too much");
				}
				const yC = def3(pos.top, pos.bottom, pos.height);
				if (yC < 2) {
					throw Error("y axis not enough");
				} else if (yC > 2) {
					throw Error("y axis too much");
				}
				const x = calcAxis(pos.left, pos.right, pos.width, canvasW);
				const y = calcAxis(pos.top, pos.bottom, pos.height, canvasH);
				return {
					x: x[0],
					y: y[0],
					w: x[1],
					h: y[1],
				};
		}
	};
}

function calcAxis(
	start: number | undefined,
	end: number | undefined,
	span: number | undefined,
	total: number,
): [number, number] {
	if (start === undefined) {
		return [total - end! - span!, span!];
	} else if (end === undefined) {
		return [start, span!];
	} else {
		return [start, total - end - start];
	}
}
function def3(a: any, b: any, c: any): number {
	return def1(a) + def1(b) + def1(c);
}
function def1(a: any): number {
	return a === undefined ? 0 : 1;
}
