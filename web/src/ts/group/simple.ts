import { drawGrid, drawSquare, getColorFromIndex, ModelRepr } from "./dom";
import { ModelDefinition } from "./modelDefinition";
import { FiniteTransformationMapper } from "./parse";

type Model = [number, number, number, number];

export class SimpleModelDefinition implements ModelDefinition<Model, 4> {
	baseModel(): Model {
		return [0, 1, 2, 3];
	}
	applyTransformation(model: Model, transformation: (0 | 1 | 2 | 3)[]): Model {
		return transformation.reduce((prev, t) => {
			switch (t) {
				case 0:
					return [prev[0], prev[3], prev[2], prev[1]];
				case 1:
					return [prev[2], prev[1], prev[0], prev[3]];
				case 2:
					return [prev[1], prev[0], prev[2], prev[3]];
				case 3:
					return [prev[0], prev[1], prev[3], prev[2]];
				default:
					throw new Error(`Invalid transformation: ${transformation}`);
			}
		}, model);
	}
	equals(model1: Model, model2: Model): boolean {
		return model1.every((x, i) => x === model2[i]);
	}
}

export class SimpleModelRepr implements ModelRepr<Model> {
	represent(model: Model, identifyMovableNode: (el: HTMLElement, uniqueId: number) => void): HTMLElement {
		const element = drawGrid(6);
		for (const i of model) {
			const sq = drawSquare(i.toString(), getColorFromIndex(i), 3, 2);
			identifyMovableNode(sq, i);
			element.appendChild(sq);
		}
		return element;
	}
}

export class SimpleRLUDMapper implements FiniteTransformationMapper<4> {
	getValidTokens(): FixedArray<4, string> {
		return ['r', 'l', 'u', 'd'];
	}
	tokenSeparator(): " " | "" | "," {
		return ''
	}
}
