import { extractBounds } from "../ui/component";
import { Component, DEFAULT_STYLE, Style } from "../ui/types";
import { drawIcon } from "./drawIcon";

export function drawComponent(component: Component, ctx: CanvasRenderingContext2D) {
	switch (component.drawInfo.type) {
		case "invisible":
			break;
		case "container":
		case "button":
			ctx.fillStyle = determineComponentBgColor(component, DEFAULT_STYLE);
			const bounds = extractBounds(component);
			ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
			if (component.drawInfo.type === "button") {
				if (component.drawInfo.icon) {
					drawIcon(component.drawInfo.icon, ctx, bounds.x, bounds.y, bounds.w, bounds.h, 0);
				}
				if (component.drawInfo.text) {
					throw Error();
				}
			}
			break;
	}
}

export function determineComponentBgColor(component: Component, style: Style = DEFAULT_STYLE) {
	if (component.drawInfo.pressable === true) {
		if (component.drawInfo.isPressed && style.bgColor.pressed) return style.bgColor.pressed;
	}
	if (component.drawInfo.selectable === true) {
		if (component.drawInfo.isSelected && style.bgColor.selected) return style.bgColor.selected;
	}
	return style.bgColor.normal;
}

let fps = '...';
let prev = 0;
export function drawFps(tick: number, ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = "white";
	ctx.textBaseline = "top";
	ctx.font = "bold 40px mono";
	ctx.fillText(`${fps}fps`, 0, 10);
	const now = performance.now();
	if (tick % 20 === 0) {
		fps = (1000 / (now - prev)).toFixed();
	}
	prev = now;
}
