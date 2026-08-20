import { drawGrid, drawSquare, getColorFromIndex, ModelRepr } from "./dom";
import { ModelDefinition } from "./modelDefinition";
import { TransformationMapper } from "./parse";

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
		const element = drawGrid(2);
		for (const i of model) {
			const sq = drawSquare(i.toString(), getColorFromIndex(i));
			identifyMovableNode(sq, i);
			element.appendChild(sq);
		}
		return element;
	}
}

export class SimpleRLUDMapper implements TransformationMapper<4> {
	private map = ["r", "l", "u", "d"] as const;
	parseTransformationElement(_limit: 4, string: string): FixedNumber<4> | "none" | "error" {
		if (string === "" || string === " ") return "none";
		const index = this.map.findIndex((el) => el === string);
		if (index === -1) return "error";
		return index as FixedNumber<4>;
	}
	mapToStr(t: 0 | 1 | 2 | 3): string {
		return this.map[t];
	}
}
