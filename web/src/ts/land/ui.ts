import { SortedList } from "./helpers";
import { CanvasPos, Icon } from "./types";

type CMouseEventBase = {
	readonly shift: boolean;
	readonly ctrl: boolean;
	readonly pos: CanvasPos;
	cancelled: boolean;
};

type CMouseUpEvent = CMouseEventBase & {
	type: "up";
	button: "left" | "middle" | "right";
};

type CMouseDownEvent = CMouseEventBase & {
	type: "down";
	button: "left" | "middle" | "right";
};

type CMouseMoveEvent = CMouseEventBase & {
	type: "move";
	oldPos: CanvasPos;
};
type CMouseEnterEvent = CMouseEventBase & {
	type: "enter";
	oldPos: CanvasPos;
};
type CMouseLeaveEvent = CMouseEventBase & {
	type: "leave";
	oldPos: CanvasPos;
};

type CMouseEvent = CMouseUpEvent | CMouseDownEvent | CMouseMoveEvent | CMouseEnterEvent | CMouseLeaveEvent;
type CMouseEventType = CMouseEvent["type"];
type CMouseEventHandler<T extends CMouseEventType> = (ev: CMouseEvent & { type: T }) => void;
type HandlersObject = Partial<{
	[T in CMouseEventType]: CMouseEventHandler<T>[];
}>;

export type Component<D extends ComponentDrawInfo=ComponentDrawInfo> = {
	pos: CanvasPos;
	w: number;
	h: number;
	z: number;
	drawInfo: D;
	handlers?: HandlersObject;
};

export type ComponentDrawInfo = { type: "invisible" } | { type: "container" } | ButtonComponent;

export type ButtonComponent = {
	type: "button";
	icon?: Icon;
	text?: string;
};

export function addComponent<D extends ComponentDrawInfo>(component: Component<D>) {
	components.insert(component);
	return component;
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

export const components = new SortedList<Component>((a, b) => b.z - a.z);
export function fireEvent<const T extends CMouseEventType>(ev: CMouseEvent & { type: T }) {
	for (const c of components) {
		if (!c.handlers) continue;
		if (!c.handlers[ev.type]) continue;
		if (!eventAppliesTo(ev, c)) continue;
		c.handlers[ev.type]!.forEach((h) => {
			h(ev);
		});
		if (ev.cancelled) break;
	}
}

function posWithin(pos: CanvasPos, component: Component) {
	return (
		component.pos.x <= pos.x &&
		component.pos.y <= pos.y &&
		pos.x <= component.pos.x + component.w &&
		pos.y <= component.pos.y + component.h
	);
}

function eventAppliesTo(ev: CMouseEvent, component: Component): boolean {
	switch (ev.type) {
		case "down":
		case "up":
			return posWithin(ev.pos, component);
		case "move":
			return posWithin(ev.pos, component) && posWithin(ev.oldPos, component);
		case "enter":
			return posWithin(ev.pos, component) && !posWithin(ev.oldPos, component);
		case "leave":
			return !posWithin(ev.pos, component) && posWithin(ev.oldPos, component);
	}
}
