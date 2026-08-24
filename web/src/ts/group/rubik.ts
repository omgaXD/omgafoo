import { drawEmptySquare, drawGrid, drawSquare, getColorFromIndex, ModelRepr } from "./dom";
import { ModelDefinition } from "./modelDefinition";
import { FixedArray, FixedNumber } from "./numberType";
import { FiniteTransformationMapper } from "./parse";

type Side<N extends 2 | 3> = FixedArray<N, FixedArray<N, number>>;
type Model<N extends 2 | 3> = [Side<N>, Side<N>, Side<N>, Side<N>, Side<N>, Side<N>];
export class RubikModelDefinition<N extends 2 | 3> implements ModelDefinition<Model<N>, 6> {
	constructor(private size: N) {}
	baseModel(): Model<N> {
		return Array.from({ length: 6 }).map((_, i) => {
			return Array.from({ length: this.size }).map((_, y) => {
				return Array.from({ length: this.size }).map((_, x) => {
					// for a fancy FLIP, prefer corners for index
					if (x === 0 && y === 0) return i;
					if (x === this.size - 1 && y === 0) return i+6;
					if (x === this.size - 1 && y === this.size-1) return i+12;
					if (x === 0 && y === this.size - 1) return i+18;
					x -= 1;
					if (y > 0) x -= 4;
					if (y === this.size - 1) x -= 4;
					return i + x*6 + y*36 + 24;
				});
			});
		}) as Model<N>;
	}
	applyTransformation(model: Model<N>, transformation: FixedNumber<6>[]): Model<N> {
		const copy = JSON.parse(JSON.stringify(model)) as number[][][];
		for (const t of transformation) {
			this.rotateFace(copy, t);
		}
		return copy as Model<N>;
	}
	private rotateFace(inPlace: number[][][], which: FixedNumber<6>) {
		for (let i = 0; i < this.size; i++) {
			const order = [
				[
					// R
					[4, 3, 5, 2],
					[i, i, this.size - i - 1, i],
					[this.size - 1, this.size - 1, 0, this.size - 1],
				],
				[
					// L
					[4, 2, 5, 3],
					[i, i, this.size - i - 1, i],
					[0, 0, this.size - 1, 0],
				],
				[
					// U
					[4, 0, 5, 1],
					[0, 0, 0, 0],
					[i, i, i, i],
				],
				[
					// D
					[4, 1, 5, 0],
					[this.size - 1, this.size - 1, this.size - 1, this.size - 1],
					[i, i, i, i],
				],
				[
					// F
					[0, 2, 1, 3],
					[i, this.size - 1, this.size - i - 1, 0],
					[0, i, this.size - 1, this.size - i - 1],
				],
				[
					// B
					[0, 3, 1, 2],
					[i, this.size - 1, this.size - i - 1, 0],
					[this.size - 1, this.size - i - 1, 0, i],
				],
			];
			for (let j = 0; j < 3; j++) {
				const face1 = order[which][0][j];
				const y1 = order[which][1][j];
				const x1 = order[which][2][j];

				const face2 = order[which][0][j + 1];
				const y2 = order[which][1][j + 1];
				const x2 = order[which][2][j + 1];

				const temp = inPlace[face1][y1][x1];
				inPlace[face1][y1][x1] = inPlace[face2][y2][x2];
				inPlace[face2][y2][x2] = temp;
			}
		}

		for (let i = 0; i < this.size - 1; i++) {
			const temp = inPlace[which][0][i];
			inPlace[which][0][i] = inPlace[which][this.size - i - 1][0];
			inPlace[which][this.size - i - 1][0] = inPlace[which][this.size - 1][this.size - i - 1];
			inPlace[which][this.size - 1][this.size - i - 1] = inPlace[which][i][this.size - 1];
			inPlace[which][i][this.size - 1] = temp;
		}
	}
	equals(model1: number[][][], model2: number[][][]): boolean {
		const flat1 = model1.flat(3);
		return model2.flat(3).every((e, i) => flat1[i] === e);
	}
}

export class RubikRepr<N extends 2 | 3> implements ModelRepr<Model<N>> {
	constructor(private size: N) {}

	represent(model: Model<N>, identifyMovableNode: (el: HTMLElement, uniqueId: number | string) => void): HTMLElement {
		const m: number[][][] = model;
		const element = drawGrid(this.size * 4);

		{
			const e1 = drawEmptySquare(this.size, this.size, 0, 0);
			const e2 = drawEmptySquare(this.size * 2, this.size, this.size * 2, 0);
			const e3 = drawEmptySquare(this.size, this.size, 0, this.size * 2);
			const e4 = drawEmptySquare(this.size * 2, this.size, this.size * 2, this.size * 2);
			element.append(e1, e2, e3, e4);
		}

		this.drawFace(2, this.size, 0, m, element, identifyMovableNode);
		this.drawFace(1, 0, this.size, m, element, identifyMovableNode);
		this.drawFace(4, this.size, this.size, m, element, identifyMovableNode);
		this.drawFace(0, this.size * 2, this.size, m, element, identifyMovableNode);
		this.drawFace(5, this.size * 3, this.size, m, element, identifyMovableNode);
		this.drawFace(3, this.size, this.size * 2, m, element, identifyMovableNode);

		return element;
	}
	private drawFace(
		face: number,
		offsetX: number,
		offsetY: number,
		m: number[][][],
		into: HTMLElement,
		identifyMovableNode: (el: HTMLElement, uniqueId: number | string) => void,
	) {
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const el = drawSquare(
					m[face][y][x].toString(),
					getColorFromIndex(m[face][y][x]),
					1,
					1,
					x + offsetX,
					y + offsetY,
				);
				identifyMovableNode(el, m[face][y][x]);
				into.appendChild(el);
			}
		}
	}
}

export class RubikMapper implements FiniteTransformationMapper<6> {
	tokenSeparator(): " " | "" | "," {
		return "";
	}
	getValidTokens(): FixedArray<6, string> {
		return ["r", "l", "u", "d", "f", "b"];
	}
}
