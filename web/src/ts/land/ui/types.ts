import { CanvasPos, Icon } from "../types";

export type Component<D extends ComponentDrawInfo = ComponentDrawInfo> = {
    pos: CanvasPos;
    w: number;
    h: number;
    z: number;
    drawInfo: D;
    handlers?: HandlersObject;
};

export type ComponentDrawInfo = { type: "invisible" } | { type: "container"; color?: string } | ButtonComponent;

export type ButtonComponent = {
	type: "button";
	icon?: Icon;
	text?: string;
	color?: string;
};

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
