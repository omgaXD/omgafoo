import type { Controls } from "./controls";
import { lerp } from "./helpers";
import type { Camera, CrudeTilePos, Vec2 } from "./coreTypes";

export function zoom({ deltaY }: { deltaY: number }, logicCamera: Camera) {
	const oldScale = logicCamera.scale;

	logicCamera.scale *= -deltaY * 0.002 + 1;
	logicCamera.scale = Math.min(10, logicCamera.scale);
	logicCamera.scale = Math.max(0.02, logicCamera.scale);

	if (logicCamera.anchor) {
		logicCamera.pos.x = lerp(logicCamera.pos.x, logicCamera.anchor.x, 1 - oldScale / logicCamera.scale);
		logicCamera.pos.y = lerp(logicCamera.pos.y, logicCamera.anchor.y, 1 - oldScale / logicCamera.scale);
	}
}

export function interpolate(camera: Camera, logicCamera: Camera) {
	const lambda = 0.15;
	camera.pos.x = lerp(camera.pos.x, logicCamera.pos.x, lambda);
	camera.pos.y = lerp(camera.pos.y, logicCamera.pos.y, lambda);
	if (camera.scale / logicCamera.scale < 1) camera.scale = lerp(camera.scale, logicCamera.scale, 0.1);
	else camera.scale = lerp(camera.scale, logicCamera.scale, 0.225);
}

export function controlCamera(controls: Controls, camera: Camera, logicCamera: Camera) {
	const speed = (1 / camera.scale) * 0.25 * (controls.sprint ? 2 : 1);
	if (controls.right) logicCamera.pos.x += speed;
	if (controls.left) logicCamera.pos.x -= speed;
	if (controls.down) logicCamera.pos.y += speed;
	if (controls.up) logicCamera.pos.y -= speed;
}

export function moveCamera(by: Vec2, logicCamera: Camera) {
	logicCamera.pos.x += by.x;
	logicCamera.pos.y += by.y;
}

export function setAnchor(pos: CrudeTilePos | null, logicCamera: Camera) {
	if (pos === null) logicCamera.anchor = undefined;
	else logicCamera.anchor = { ...pos };
}
