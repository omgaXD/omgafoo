export function parseTransformation<T extends number>(
	limit: T,
	mapper: TransformationMapper<T>,
	text: string,
): { success: true; transformation: FixedNumber<T>[] } | { success: false; errors: [number, string][] } {
	const errors: [number, string][] = [];
	const transformation: FixedNumber<T>[] = [];
	text.split("").forEach((char, i) => {
		if (char === "" || char === "\n" || char === " ") return;
		const tel = mapper.parseTransformationElement(limit, char);
		if (tel === "error") errors.push([i, `Invalid character ${char} at ${i}`]);
		else if (tel === "none") return;
		else transformation.push(tel);
	});
	if (errors.length) return { success: false, errors };
	else return { success: true, transformation };
}

export interface TransformationMapper<T extends number> {
	parseTransformationElement(limit: T, string: string): FixedNumber<T> | "none" | "error";
	mapToStr(t: FixedNumber<T>): string;
}
