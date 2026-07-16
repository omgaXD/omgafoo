import type { Controls } from "./controls";
import { lerp } from "./helpers";
import type { Camera } from "./types";



export const logicCamera: Camera = {
	pos: {
		x: 0,
		y: 0,
		type: "crude",
	},
	scale: 1,
};

export const camera: Camera = {
	pos: { ...logicCamera.pos },
	scale: 1,
};

export function zoom({deltaY}: {deltaY: number}) {
	logicCamera.scale *= (-deltaY * 0.002 + 1);
	logicCamera.scale = Math.min(10, logicCamera.scale);
	logicCamera.scale = Math.max(0.05, logicCamera.scale);
}

export function interpolate() {
	const lambda = 0.1;
	camera.pos.x = lerp(camera.pos.x, logicCamera.pos.x, lambda);
	camera.pos.y = lerp(camera.pos.y, logicCamera.pos.y, lambda);
	camera.scale = lerp(camera.scale, logicCamera.scale, lambda);
}

export function moveCamera(controls: Controls) {
	const speed = (1 / camera.scale) * 0.25 * (controls.sprint ? 2 : 1);
	if (controls.right) logicCamera.pos.x += speed;
	if (controls.left) logicCamera.pos.x -= speed;
	if (controls.down) logicCamera.pos.y += speed;
	if (controls.up) logicCamera.pos.y -= speed;
}

