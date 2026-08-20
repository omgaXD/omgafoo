export interface ModelDefinition<M, T extends number> {
	baseModel(): M;
	applyTransformation(model: M, transformation: FixedNumber<T>[]): M;
	equals(model1: M, model2: M): boolean;
}

