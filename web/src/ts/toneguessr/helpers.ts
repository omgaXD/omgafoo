export function randNext(from: number, toInclusive: number): number {
	return Math.floor(Math.random() * (toInclusive - from + 1) + from);
}
