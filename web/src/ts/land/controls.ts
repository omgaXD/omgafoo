import type { CanvasPos } from "./types";
import { Component, fireEvent, registerHandler } from "./ui";

export type Controls = {
	right: boolean;
	left: boolean;
	up: boolean;
	down: boolean;
	sprint: boolean;
};

export const controls: Controls = {
	right: false,
	left: false,
	up: false,
	down: false,
	sprint: false,
};

window.addEventListener("keydown", (e) => {
	controls.sprint = e.shiftKey;
	controls.down ||= e.key.toLowerCase() === "s";
	controls.up ||= e.key.toLowerCase() === "w";
	controls.left ||= e.key.toLowerCase() === "a";
	controls.right ||= e.key.toLowerCase() === "d";
});
window.addEventListener("keyup", (e) => {
	controls.sprint = e.shiftKey;
	controls.down &&= e.key.toLowerCase() !== "s";
	controls.up &&= e.key.toLowerCase() !== "w";
	controls.left &&= e.key.toLowerCase() !== "a";
	controls.right &&= e.key.toLowerCase() !== "d";
});

export function registerZoom(zoom: (i: { deltaY: number }) => void) {
	window.addEventListener("wheel", zoom);
}

function getButton(ev: MouseEvent) {
	let button: "left" | "right" | "middle" | undefined = undefined;
	switch (ev.button) {
		case 0:
			button = "left";
			break;
		case 1:
			button = "middle";
			break;
		case 2:
			button = "right";
			break;
	}
	return button;
}

canvas.addEventListener("mousedown", (e) => {
	mouse.l ||= e.button === 0;
	mouse.r ||= e.button === 2;

	const button = getButton(e);
	if (!button) return;

	fireEvent<"down">({
		type: "down",
		button,
		cancelled: false,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		pos: mouse.pos,
	});
});

export function attachMouseController(component: Component): Mouse {
	const mouseController: Mouse = {
		l: mouse.l,
		r: mouse.r,
		pos: { ...mouse.pos },
		oldPos: { ...mouse.oldPos },
	};
	registerHandler(component, "down", (ev) => {
		mouseController.l ||= ev.button === "left";
		mouseController.r ||= ev.button === "right";
	});
	registerHandler(component, "up", (ev) => {
		mouseController.l &&= ev.button !== "left";
		mouseController.r &&= ev.button !== "right";
	});
	registerHandler(component, "leave", () => {
		mouseController.l = false;
		mouseController.r = false;
	});
	registerHandler(component, "enter", () => {
		mouseController.l = mouse.l;
		mouseController.r = mouse.r;
	});
	registerHandler(component, "move", (ev) => {
		mouseController.oldPos = { ...mouseController.pos };
		mouseController.pos = ev.pos;
	});

	return mouseController;
}

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

canvas.addEventListener("mouseup", (e) => {
	mouse.l &&= e.button !== 0;
	mouse.r &&= e.button !== 2;

	const button = getButton(e);
	if (!button) return;
	
	fireEvent<"upElsewhere">({
		type: "upElsewhere",
		button,
		cancelled: false,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		pos: mouse.pos,
	});
	fireEvent<"up">({
		type: "up",
		button,
		cancelled: false,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		pos: mouse.pos,
	});
});

canvas.addEventListener("mousemove", (e) => {
	mouse.oldPos = { ...mouse.pos };
	mouse.pos.x = e.offsetX;
	mouse.pos.y = e.offsetY;

	fireEvent<"move">({
		type: "move",
		cancelled: false,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		pos: mouse.pos,
		oldPos: mouse.oldPos,
	});
	fireEvent<"leave">({
		type: "leave",
		cancelled: false,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		pos: mouse.pos,
		oldPos: mouse.oldPos,
	});
	fireEvent<"enter">({
		type: "enter",
		cancelled: false,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		pos: mouse.pos,
		oldPos: mouse.oldPos,
	});
});

export type Mouse = {
	oldPos: CanvasPos;
	pos: CanvasPos;
	l: boolean;
	r: boolean;
};
const mouse: Mouse = {
	oldPos: { type: "canvas", x: 0, y: 0 },
	pos: { type: "canvas", x: 0, y: 0 },
	l: false,
	r: false,
};
