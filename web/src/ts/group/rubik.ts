import { drawEmptySquare, drawGrid, drawSquare, getColorFromIndex, ModelRepr } from "./dom";
import { ModelDefinition } from "./math";
import { TransformationMapper } from "./parse";

type Side<N extends 2 | 3> = FixedArray<N, FixedArray<N, number>>;
type Model<N extends 2 | 3> = [Side<N>, Side<N>, Side<N>, Side<N>, Side<N>, Side<N>];
export class RubikModelDefinition<N extends 2 | 3> implements ModelDefinition<Model<N>, 6> {
	constructor(private size: N) {}
	baseModel(): Model<N> {
		return Array.from({ length: 6 }).map((_, i) => {
			return Array.from({ length: this.size }).map((_, y) => {
				return Array.from({ length: this.size }).map((_, x) => i + x * 6 + y * this.size * 6);
			});
		}) as Model<N>;
	}
	applyTransformation(model: Model<N>, transformation: FixedNumber<6>[]): Model<N> {
		const copy = JSON.parse(JSON.stringify(model)) as number[][][];
		for (const t of transformation) {
			this.rotateFace(copy, t);
			continue;
			switch (t) {
				case 0: {
					// R
					this.rotateFace(copy, 0);
					break;
				}
				case 1: {
					// L
					for (let i = 0; i < this.size; i++) {
						const temp = copy[0][i][0];
						copy[0][i][0] = copy[4][i][0];
						copy[4][i][0] = copy[2][this.size - i - 1][this.size - 1];
						copy[2][this.size - i - 1][this.size - 1] = copy[5][i][0];
						copy[5][i][0] = temp;
					}
					this.rotateFace(copy, 3);
					break;
				}
				case 2: {
					// U
					this.rotateFace(copy, 4);
					break;
				}
				case 3: {
					// D
					this.rotateFace(copy, 5);
					break;
				}
				case 4: {
					// F
					this.rotateFace(copy, 0);
					break;
				}
				case 5: {
					// B
					this.rotateFace(copy, 2);
					break;
				}
			}
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
					[this.size-1, this.size-i-1, 0, i]
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
	equals(model1: Model<N>, model2: Model<N>): boolean {
		throw new Error("Method not implemented.");
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

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const el = drawSquare(m[2][y][x].toString(), getColorFromIndex(m[2][y][x]), 1, 1, x + this.size, y);
				identifyMovableNode(el, m[2][y][x]);
				element.appendChild(el);
			}
		}

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const el = drawSquare(m[1][y][x].toString(), getColorFromIndex(m[1][y][x]));
				identifyMovableNode(el, m[1][y][x]);
				element.appendChild(el);
			}
			for (let x = 0; x < this.size; x++) {
				const el = drawSquare(m[4][y][x].toString(), getColorFromIndex(m[4][y][x]));
				identifyMovableNode(el, m[4][y][x]);
				element.appendChild(el);
			}
			for (let x = 0; x < this.size; x++) {
				const el = drawSquare(m[0][y][x].toString(), getColorFromIndex(m[0][y][x]));
				identifyMovableNode(el, m[0][y][x]);
				element.appendChild(el);
			}
			for (let x = 0; x < this.size; x++) {
				const el = drawSquare(m[5][y][x].toString(), getColorFromIndex(m[5][y][x]));
				identifyMovableNode(el, m[5][y][x]);
				element.appendChild(el);
			}
		}

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const el = drawSquare(m[3][y][x].toString(), getColorFromIndex(m[3][y][x]));
				identifyMovableNode(el, m[3][y][x]);
				element.appendChild(el);
			}
		}
		return element;
	}
}

export class RubikMapper implements TransformationMapper<6> {
	private map = ["r", "l", "u", "d", "f", "b"] as const;
	parseTransformationElement(_limit: 6, string: string): FixedNumber<6> | "none" | "error" {
		if (string === "" || string === " ") return "none";
		const index = this.map.findIndex((el) => el === string);
		if (index === -1) return "error";
		return index as FixedNumber<6>;
	}
	mapToStr(t: FixedNumber<6>): string {
		return this.map[t];
	}
}
