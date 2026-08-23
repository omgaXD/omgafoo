export type VisSnapshot = { uniqueId: string; top: number; left: number; width: number; height: number }[];

export function takeVisSnapshot(element: HTMLElement): VisSnapshot {
	return [...element.querySelectorAll<HTMLElement>("[data-unique-id]")].map((el) => {
		const rect = el.getBoundingClientRect();
		return {
			uniqueId: el.dataset.uniqueId!,
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
		} satisfies VisSnapshot[number];
	});
}
export function markSnapshotable(element: HTMLElement, uniqueId: string | number) {
	element.dataset.uniqueId = `${uniqueId}`;
}
