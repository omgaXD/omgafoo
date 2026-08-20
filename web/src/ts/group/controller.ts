import { ModelRepr } from "./dom";
import { ModelDefinition } from "./modelDefinition";
import { TransformationMapper } from "./parse";
import { RubikModelDefinition, RubikRepr, RubikMapper } from "./rubik";
import { SimpleModelDefinition, SimpleModelRepr, SimpleRLUDMapper } from "./simple";

export type ModelController<M, T extends number> = {
	name: string;
	limit: T;
	modelDef: ModelDefinition<M, T>;
	repr: ModelRepr<M>;
	mapper: TransformationMapper<T>;
};

function buildController<M, T extends number>(
	name: string,
	limit: T,
	modelDef: ModelDefinition<M, T>,
	repr: ModelRepr<M>,
	mapper: TransformationMapper<T>,
) {
	return {
		name,
		limit,
		modelDef,
		repr,
		mapper,
	};
}
export const controllers = {
	simple: buildController(
		"Simple Group",
		4,
		new SimpleModelDefinition(),
		new SimpleModelRepr(),
		new SimpleRLUDMapper(),
	),
	rubik2: buildController("Rubik 2x2", 6, new RubikModelDefinition(2), new RubikRepr(2), new RubikMapper()),
	rubik3: buildController("Rubik 3x3", 6, new RubikModelDefinition(3), new RubikRepr(3), new RubikMapper()),
} as const;
