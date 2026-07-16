import type { CanvasPos } from "./types";

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

export function registerZoom(zoom: (i : {deltaY: number}) => void) {
    window.addEventListener("wheel", zoom);
}

canvas.addEventListener('mousedown', (e) => {
	mouse.l ||= e.button === 0;	
	mouse.r ||= e.button === 2;
})

canvas.addEventListener('contextmenu', (e) => e.preventDefault())

canvas.addEventListener('mouseup', (e) => {
	mouse.l &&= e.button !== 0;
	mouse.r &&= e.button !== 2;
})

canvas.addEventListener("mousemove", (e) => {
	mouse.pos.x = e.offsetX;
	mouse.pos.y = e.offsetY;
});

export type Mouse = {
    pos: CanvasPos;
	l: boolean;
	r: boolean;
};
export const mouse: Mouse = {
    pos: { type: "canvas", x: 0, y: 0 },
	l: false,
	r: false
};

