import { controlCamera, moveCamera, setAnchor, zoom } from "./camera";
import { controls, mouse, registerZoom, type Mouse } from "./controls";
import { xy2c, getVisibleChunkPoses, crude2tile, canvas2crude, canvasCanvas2worldDiff } from "./pos";
import { getCanvasCameraInfo, startRenderLoop } from "./render";
import { decodeTile, Feature, features } from "./tile";
import type { CanvasPos, CrudeTilePos, Vec2 } from "./types";
import { createChunk, hasChunk, tile } from "./world";

registerZoom(zoom);

startRenderLoop();

let tick = 0;
let mouseLastTick: Mouse = { ...mouse };
let mouseWorldPosLastTick: CrudeTilePos = {type: 'crude', x: 0, y: 0} 

function setFeature(pos: CrudeTilePos, feature: Feature) {
	const tilePos = crude2tile(pos);
	const t = tile(tilePos);
	if (t !== undefined) {
		const d = decodeTile(t);
		d.featureIndex = features.indexOf(feature);
		tile(tilePos, d);
	}
}

function logic() {
	const mousePosThisTick = canvas2crude(mouse.pos, getCanvasCameraInfo());
	const mousePosLastTick = mouseWorldPosLastTick;

	setAnchor(mousePosThisTick);
	if (mouse.r) {
		const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, getCanvasCameraInfo())
		moveCamera(diff);
	} else {
		if (mouseLastTick.r) {
			const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, getCanvasCameraInfo());
			const abrupt = 10 < (diff.x ** 2 + diff.y ** 2)
			if (abrupt) {
				moveCamera({x: diff.x * 2, y: diff.y * 2});
			}
		}
		controlCamera(controls);
	}

	if (mouse.l) {
		setFeature(mousePosThisTick, 'tree')
		if (mouseLastTick.l) {
			applyBrushlikeAction(mousePosThisTick, mousePosLastTick, (pos) => setFeature(pos, 'tree'));
		}
	}

	const [from, to] = getVisibleChunkPoses(getCanvasCameraInfo(), 10);

	for (let x = from.x; x <= to.x; x++) {
		for (let y = from.y; y <= to.y; y++) {
			if (((x + y) & 1) === (tick & 1)) continue;
			if (!hasChunk(xy2c(x, y))) createChunk(xy2c(x, y));
		}
	}

	mouseLastTick = { ...mouse, pos: {...mouse.pos} };
	mouseWorldPosLastTick = mousePosThisTick;
	tick++;
}

setInterval(logic, 50);
function applyBrushlikeAction(mousePosThisTick: CrudeTilePos, mousePosLastTick: CrudeTilePos, action: (pos: CrudeTilePos) => void) {
	const curPos = { ...mousePosLastTick };
	const dir: Vec2 = { x: mousePosThisTick.x - curPos.x, y: mousePosThisTick.y - curPos.y };
	const dist = Math.sqrt(dir.x ** 2 + dir.y ** 2);
	if (dist > 1) {
		const normDir: Vec2 = { x: dir.x / dist, y: dir.y / dist };
		let depth = 100;
		while (mousePosThisTick.x - curPos.x > 0 === normDir.x > 0 && depth > 0) {
			curPos.x += normDir.x;
			curPos.y += normDir.y;
			action(curPos);
			depth--;
		}
	}
}
