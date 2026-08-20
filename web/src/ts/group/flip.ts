type FLIPSnapshot = { flipId: string; top: number; left: number; width: number; height: number }[];

export function snapshotFLIP(element: HTMLElement): FLIPSnapshot {
	return [...element.querySelectorAll<HTMLElement>("[data-flip-id]")].map((el) => {
		const rect = el.getBoundingClientRect();
		return {
			flipId: el.dataset.flipId!,
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
		} satisfies FLIPSnapshot[number];
	});
}

export function applyFLIP(newElement: HTMLElement, snapshot: FLIPSnapshot) {
	[...newElement.querySelectorAll<HTMLElement>("[data-flip-id]")].map((el) => {
		const rect = el.getBoundingClientRect();
		const oldRect = snapshot.find((old) => el.dataset.flipId! === old.flipId);
		if (oldRect === undefined) return;
		const diffX = oldRect.left - rect.left;
		const diffY = oldRect.top - rect.top;
		const diffW = oldRect.width / rect.width;
		const diffH = oldRect.height / rect.height;
		el.animate(
			[
				{
					transform: `translate(${diffX}px, ${diffY}px) scale(${diffW}, ${diffH})`,
					offset: 0,
				},
			],
			{ easing: "ease-in-out", duration: 200 },
		);
	});
}

export function markFlip(element: HTMLElement, uniqueId: string | number) {
	element.dataset.flipId = `${uniqueId}`;
}
