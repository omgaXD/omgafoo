import { moveCamera, zoom } from "./camera";
import { controls, mouse, registerZoom, type Mouse } from "./controls";
import { xy2c, getVisibleChunkPoses, crude2tile, canvas2crude } from "./pos";
import { getInfo as getCanvasCameraInfo, startRenderLoop } from "./render";
import { decodeTile, features } from "./tile";
import type { CrudeTilePos, Vec2 } from "./types";
import { createChunk, hasChunk, tile } from "./world";

registerZoom(zoom);

startRenderLoop();

let tick = 0;
let mouseLastTick: Omit<Mouse, 'pos'> = {...mouse};
let mouseLastTickWorldPos: CrudeTilePos = {type: 'crude', x: 0, y: 0}

function forest(pos: CrudeTilePos) {
	const tilePos = crude2tile(pos);
	const t = tile(tilePos);
	if (t !== undefined) {
		const d = decodeTile(t);
		d.featureIndex = features.indexOf('tree');
		tile(tilePos, d);
	}
}

function logic() {
	moveCamera(controls);
	const mousePosThisTick = canvas2crude(mouse.pos, getCanvasCameraInfo());
	if (mouse.l) {
		forest(mousePosThisTick);
		if (mouseLastTick.l) {
			const curPos = {...mouseLastTickWorldPos}
			const dir: Vec2 = {x: mousePosThisTick.x - curPos.x, y: mousePosThisTick.y - curPos.y};
			const normDir: Vec2 = {x: dir.x / 50, y: dir.y / 50};
			let depth = 50;
			while ((mousePosThisTick.x - curPos.x > 0) === (normDir.x > 0) && depth > 0) {
				curPos.x += normDir.x;
				curPos.y += normDir.y;
				forest(curPos);
				depth --;
			}
		}
	}
	
	const [from, to] = getVisibleChunkPoses(getCanvasCameraInfo(), 10);

	for (let x = from.x; x <= to.x; x++) {
		for (let y = from.y; y <= to.y; y++) {
			if ((x + y & 1) === (tick & 1)) continue;
			if (!hasChunk(xy2c(x, y))) createChunk(xy2c(x, y));
		}
	}

	mouseLastTick = {...mouse};
	mouseLastTickWorldPos = {...mousePosThisTick}
	tick++;
}

setInterval(logic, 50);
