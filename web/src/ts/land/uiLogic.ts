import { CMouseEvent, Component, registerHandler } from "./ui";

export function clickHandler(
	component: Component,
	button: "left" | "middle" | "right",
	clickHandler: (ev: CMouseEvent) => void,
	toPressedHandler?: (ev: CMouseEvent) => void,
	pressCanceledHandler?: (ev: CMouseEvent) => void,
) {
	let state: "idle" | "downInside" | "leftDown" = "idle";
	registerHandler(component, "down", (ev) => {
		if (ev.button !== button) return;
		state = "downInside";
		toPressedHandler?.(ev);
        ev.cancelled = true;
	});
	registerHandler(component, "upElsewhere", (ev) => {
		if (ev.button !== button) return;
        if (state === 'idle') return;
		state = "idle";
        pressCanceledHandler?.(ev);
	});
	registerHandler(component, "up", (ev) => {
		if (ev.button !== button) return;
		if (state === "downInside") {
			clickHandler(ev);
		}
	});
	registerHandler(component, "leave", (ev) => {
		if (state === "downInside") state = "leftDown";
	});
	registerHandler(component, "enter", (ev) => {
		if (state === "leftDown") state = "downInside";
	});
}
