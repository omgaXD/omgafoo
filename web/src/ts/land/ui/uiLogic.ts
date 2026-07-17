import { registerHandler } from "./component";
import { Component, CMouseEvent } from "./types";


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
		if (component.drawInfo.pressable) component.drawInfo.isPressed = true;
		ev.cancelled = true;
	});
	registerHandler(component, "upElsewhere", (ev) => {
		if (ev.button !== button) return;
		if (state === "idle") return;
		state = "idle";
		if (component.drawInfo.pressable) component.drawInfo.isPressed = false;
		pressCanceledHandler?.(ev);
	});
	registerHandler(component, "up", (ev) => {
		if (ev.button !== button) return;
		if (state === "downInside") {
			if (component.drawInfo.pressable) component.drawInfo.isPressed = false;
			clickHandler(ev);
		}
	});
	registerHandler(component, "leave", () => {
		if (state === "downInside") state = "leftDown";
	});
	registerHandler(component, "enter", () => {
		if (state === "leftDown") state = "downInside";
	});
}

