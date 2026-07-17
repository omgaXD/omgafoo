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
	*[Symbol.iterator]() {
		for (const item of this.list) {
			yield item;
		}
	}
	*reversed() {
		for (let i = this.list.length - 1; i >= 0; i--) {
			yield this.list[i];
		}
	}
}
