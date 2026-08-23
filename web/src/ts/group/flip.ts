import { VisSnapshot } from "./snapshot";

const easing: KeyframeAnimationOptions = { easing: "cubic-bezier(.36,1.02,.62,1.09)", duration: 300 };
export function applyFLIP(newElement: HTMLElement, snapshot: VisSnapshot) {
	[...newElement.querySelectorAll<HTMLElement>("[data-unique-id]")].map((el) => {
		el.style.transformOrigin = 'top left';
		const rect = el.getBoundingClientRect();
		const oldRect = snapshot.find((old) => el.dataset.uniqueId! === old.uniqueId);
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
			easing,
		);
		for (const child of el.children) {
			child.animate(
				[
					{
						transform: `scale(${1 / diffW}, ${1 / diffH})`,
						offset: 0,
					},
				],
				easing,
			);
		}
	});
}
