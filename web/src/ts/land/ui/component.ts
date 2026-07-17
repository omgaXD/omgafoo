import { CanvasPos } from "../types";
import { Component, CMouseEventType, CMouseEventHandler } from "./types";

export function extractBounds(component: Component) {
	return typeof component.bounds === 'function' ? component.bounds() : component.bounds;
}

export function posWithin(pos: CanvasPos, component: Component) {
	const bounds = extractBounds(component);
	return (
		bounds.x <= pos.x &&
		bounds.y <= pos.y &&
		pos.x <= bounds.x + bounds.w &&
		pos.y <= bounds.y + bounds.h
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
