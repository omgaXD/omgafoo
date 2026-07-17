import { controlCamera, moveCamera, setAnchor, zoom } from "./camera";
import { attachMouseController, controls, registerZoom, type Mouse } from "./controls";
import { xy2c, getVisibleChunkPoses, crude2tile, canvas2crude, canvasCanvas2worldDiff } from "./pos";
import { getCanvasCameraInfo, startRenderLoop } from "./render";
import { decodeTile, Feature, features } from "./tile";
import type { CrudeTilePos, Vec2 } from "./types";
import { addComponent, ButtonComponent, Component, registerHandler } from "./ui";
import { clickHandler } from "./uiLogic";
import { createChunk, hasChunk, tile } from "./world";

registerZoom(zoom);

startRenderLoop();

const screen = addComponent({
	pos: { type: "canvas", x: 0, y: 0 },
	w: 9999,
	h: 9999,
	z: 0,
	drawInfo: { type: "invisible" },
});

let tick = 0;
const mouse = attachMouseController(screen);
let mouseLastTick: Mouse = { ...mouse };
let mouseWorldPosLastTick: CrudeTilePos = { type: "crude", x: 0, y: 0 };

const feature1 = addComponent<ButtonComponent>({
	pos: { type: "canvas", x: 10, y: 100 },
	w: 100,
	h: 100,
	z: 1,
	drawInfo: { type: "button", icon: "x", color: "#888888" },
});
let featureIndex = 0;
clickHandler(feature1, 'left', () => {
	featureIndex = (featureIndex + 1) % features.length;
	switch (features[featureIndex]) {
		case "none":
			feature1.drawInfo.icon = "x";
			break;
		case "tree":
			feature1.drawInfo.icon = "tree";
			break;
		case "stone":
			feature1.drawInfo.icon = "stone";
			break;
	}
	feature1.drawInfo.color = '#888888'
}, () => {feature1.drawInfo.color = '#444444'}, () => {feature1.drawInfo.color = '#888888'})

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
		const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, getCanvasCameraInfo());
		moveCamera(diff);
	} else {
		controlCamera(controls);
		if (mouseLastTick.r) {
			const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, getCanvasCameraInfo());
			const abrupt = 10 < diff.x ** 2 + diff.y ** 2;
			if (abrupt) {
				moveCamera({ x: diff.x * 2, y: diff.y * 2 });
			}
		}
	}

	if (mouse.l) {
		setFeature(mousePosThisTick, features[featureIndex]);
		if (mouseLastTick.l) {
			applyBrushlikeAction(mousePosThisTick, mousePosLastTick, (pos) => setFeature(pos, features[featureIndex]));
		}
	}

	const [from, to] = getVisibleChunkPoses(getCanvasCameraInfo(), 10);

	for (let x = from.x; x <= to.x; x++) {
		for (let y = from.y; y <= to.y; y++) {
			if (((x + y) & 1) === (tick & 1)) continue;
			if (!hasChunk(xy2c(x, y))) createChunk(xy2c(x, y));
		}
	}

	mouseLastTick = { ...mouse, pos: { ...mouse.pos } };
	mouseWorldPosLastTick = mousePosThisTick;
	tick++;
}

setInterval(logic, 50);
function applyBrushlikeAction(
	mousePosThisTick: CrudeTilePos,
	mousePosLastTick: CrudeTilePos,
	action: (pos: CrudeTilePos) => void,
) {
	const curPos = { ...mousePosLastTick };
	const dir: Vec2 = { x: mousePosThisTick.x - curPos.x, y: mousePosThisTick.y - curPos.y };
	const dist = Math.sqrt(dir.x ** 2 + dir.y ** 2);
	if (dist > 1) {
		const normDir: Vec2 = { x: dir.x / dist, y: dir.y / dist };
		let prevDist = Infinity;
		let newDist = (curPos.x - mousePosThisTick.x) ** 2 + (curPos.y - mousePosThisTick.y) ** 2;
		while (prevDist > newDist) {
			action(curPos);
			curPos.x += normDir.x;
			curPos.y += normDir.y;
			prevDist = newDist;
			newDist = (curPos.x - mousePosThisTick.x) ** 2 + (curPos.y - mousePosThisTick.y) ** 2;
		}
	}
}
