import { drawGrid, drawSquare, getColorFromIndex, ModelRepr } from "./dom";
import { ModelDefinition } from "./modelDefinition";
import { FixedArray } from "./numberType";
import { FiniteTransformationMapper } from "./parse";

type Model = [number, number, number, number];

export class SimpleModelDefinition implements ModelDefinition<Model, 2> {
	baseModel(): Model {
		return [0, 1, 2, 3];
	}
	applyTransformation(model: Model, transformation: (0 | 1)[]): Model {
		return transformation.reduce((prev, t) => {
			switch (t) {
				case 0:
					return [prev[0], prev[3], prev[2], prev[1]];
				case 1:
					return [prev[2], prev[0], prev[3], prev[1]];
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

export class SimpleRLUDMapper implements FiniteTransformationMapper<2> {
	getValidTokens(): FixedArray<2, string> {
		return ['r', 'f'];
	}
	tokenSeparator(): " " | "" | "," {
		return ''
	}
}
