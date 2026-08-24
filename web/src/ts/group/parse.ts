import { FixedArray, FixedNumber } from "./numberType";

export function parseTransformation<T extends number>(
	mapper: FiniteTransformationMapper<T>,
	text: string,
): { success: true; transformation: FixedNumber<T>[] } | { success: false; errors: [number, string][] } {
	const errors: [number, string][] = [];
	const transformation: FixedNumber<T>[] = [];
	const validTokens = mapper.getValidTokens() as string[];
	text.split(mapper.tokenSeparator()).forEach((char, i) => {
		if (char === "" || char === "\n" || char === " ") return;
		const tel = validTokens.findIndex(v => v === char);
		if (tel === -1) errors.push([i, `Invalid character ${char} at ${i}`]);
		else transformation.push(tel as FixedNumber<T>);
	});
	if (errors.length) return { success: false, errors };
	else return { success: true, transformation };
}

export interface FiniteTransformationMapper<T extends number> {
	tokenSeparator(): " " | "" | ",";
	getValidTokens(): FixedArray<T, string>
}
