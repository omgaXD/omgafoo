import { Icon } from "../render/icon";
import { CanvasPos, OptionalProps } from "../coreTypes";
import { ComponentBounds } from "./uiPos";

export type Style = {
	textColor: string;
	bgColor: {
		normal: string;
		pressed?: string;
		selected?: string;
	};
};

export const DEFAULT_STYLE: Style = {
	textColor: "white",
	bgColor: {
		normal: "#888888",
		pressed: "#444444",
		selected: "#666666",
	},
};

export type Component<D extends ComponentDrawInfo = ComponentDrawInfo> = {
	bounds: ComponentBounds | (() => ComponentBounds);
	z: number;
	drawInfo: D;
	handlers?: HandlersObject;
};

export type Pressable = OptionalProps<"pressable", { isPressed: boolean }>;
export type Selectable = OptionalProps<"selectable", { isSelected: boolean }>;

export type ButtonComponent = Pressable["yes"] &
	Selectable["yes"] & {
		type: "button";
		icon?: Icon;
		text?: string;
	};
export type ComponentDrawInfo = ({ type: "invisible" } | { type: "container" } | ButtonComponent) &
	Pressable["common"] &
	Selectable["common"];

export type MouseButton = "left" | "middle" | "right";

export type CMouseEventBase = {
	readonly shift: boolean;
	readonly ctrl: boolean;
	readonly pos: CanvasPos;
	cancelled: boolean;
};

export type CMouseUpEvent = CMouseEventBase & {
	type: "up";
	button: MouseButton;
};

export type CMouseUpGlobalEvent = CMouseEventBase & {
	type: "upElsewhere";
	button: MouseButton;
};

export type CMouseDownEvent = CMouseEventBase & {
	type: "down";
	button: MouseButton;
};

export type CMouseMoveEvent = CMouseEventBase & {
	type: "move";
	oldPos: CanvasPos;
};
export type CMouseEnterEvent = CMouseEventBase & {
	type: "enter";
	oldPos: CanvasPos;
};
export type CMouseLeaveEvent = CMouseEventBase & {
	type: "leave";
	oldPos: CanvasPos;
};

export type CMouseEvent =
	| CMouseUpEvent
	| CMouseDownEvent
	| CMouseMoveEvent
	| CMouseEnterEvent
	| CMouseLeaveEvent
	| CMouseUpGlobalEvent;

export type CMouseEventType = CMouseEvent["type"];
export type CMouseEventHandler<T extends CMouseEventType> = (ev: CMouseEvent & { type: T }) => void;

export type HandlersObject = Partial<{
	[T in CMouseEventType]: CMouseEventHandler<T>[];
}>;
