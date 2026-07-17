import { CanvasPos } from "../types";
import { Component, CMouseEventType, CMouseEventHandler } from "./types";

export function posWithin(pos: CanvasPos, component: Component) {
	return (
		component.pos.x <= pos.x &&
		component.pos.y <= pos.y &&
		pos.x <= component.pos.x + component.w &&
		pos.y <= component.pos.y + component.h
	);
}

export function registerHandler<const T extends CMouseEventType>(
	component: Component,
	type: T,
	handler: CMouseEventHandler<T>,
) {
	if (component.handlers === undefined) {
		component.handlers = {};
	}
	if (component.handlers[type] === undefined) {
		component.handlers[type] = [];
	}
	component.handlers[type].push(handler);
}
