const alphabet = 10;

export function parseLetterCoord(coord: string): number {
    let result = 0;
	let base = 1;
	for (const c of coord.split("").reverse()) {
		result += base * (c.charCodeAt(0) - "a".charCodeAt(0) + 1);
		base *= alphabet;
	}
	return result;
}

export function toLetterCoord(coord: number): string {
    if (coord === 0) return 'a';
    let result = "";
    while (coord > 0) {
        const rem = coord % alphabet;
        coord = Math.floor(coord / alphabet);
        result = String.fromCharCode(rem + 'a'.charCodeAt(0)) + result;
    }
    return result;
}