import { CrudeTilePos, Vec2 } from "./coreTypes";

export function lerp(a: number, b: number, lambda: number) {
	return b * lambda + a * (1 - lambda);
}

export class SortedList<T> {
	private list: T[];
	private comparator: (a: T, b: T) => number;
	constructor(comparator: (a: T, b: T) => number, iterable: Iterable<T> | null = null) {
		this.comparator = comparator;
		if (iterable === null) {
			this.list = [];
		} else {
			this.list = [...iterable];
			this.list.sort(this.comparator);
		}
	}
	insert(item: T) {
		this.list.push(item);
		this.list.sort(this.comparator);
	}
	*asc() {
		for (const item of this.list) {
			yield item;
		}
	}
	*desc() {
		for (let i = this.list.length - 1; i >= 0; i--) {
			yield this.list[i];
		}
	}
}

export function rnd4tile(min: number, max: number, x: number, y: number, seed: number) {
	x %= 1000;
	y %= 1000;
	const r = rnd(x + 1000 * y + 1000000 * seed);
	return min + (r % (max - min + 1));
}

export function rnd(seed: number) {
	let m = 0x80000001,
		a = 1103515245,
		c = 12345;
	return (a * seed + c) % m;
}

export function splitCircle<T extends number>(pieces: T, offsetDeg: number = 0): Vec2[] & { length: T } {
	return Array.from({ length: pieces }).map((_, i) => {
		const angle = (i / pieces + offsetDeg / 360) * Math.PI * 2;
		return { x: Math.cos(angle), y: Math.sin(angle) };
	}) as Vec2[] & { length: T };
}

export function applyBrushlikeAction(
	mousePosThisTick: CrudeTilePos,
	mousePosLastTick: CrudeTilePos,
	action: (pos: CrudeTilePos) => void,
) {
	const curPos = { ...mousePosLastTick };
	const dir: Vec2 = { x: mousePosThisTick.x - curPos.x, y: mousePosThisTick.y - curPos.y };
	const dist = Math.sqrt(dir.x ** 2 + dir.y ** 2);
	if (dist > 1) {
		const normDir: Vec2 = { x: dir.x / dist, y: dir.y / dist };
		let prevDist = Infinity;
		let newDist = (curPos.x - mousePosThisTick.x) ** 2 + (curPos.y - mousePosThisTick.y) ** 2;
		while (prevDist > newDist) {
			action(curPos);
			curPos.x += normDir.x;
			curPos.y += normDir.y;
			prevDist = newDist;
			newDist = (curPos.x - mousePosThisTick.x) ** 2 + (curPos.y - mousePosThisTick.y) ** 2;
		}
	}
}