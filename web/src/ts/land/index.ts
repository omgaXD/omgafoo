import { controlCamera, moveCamera, setAnchor, zoom } from "./camera";
import { attachMouseController, controls, registerZoom, type Mouse } from "./controls";
import { xy2c, getVisibleChunkPoses, crude2tile, canvas2crude, canvasCanvas2worldDiff, canvas2tile } from "./pos";
import { getCanvasCameraInfo, highlightedTiles, startRenderLoop } from "./render";
import { decodeTile, Feature, features } from "./tile";
import type { CrudeTilePos, Vec2 } from "./types";
import { addComponent } from "./ui";
import { createRadioGroup } from "./ui/radio";
import { ButtonComponent } from "./ui/types";
import { uiPos } from "./ui/uiPos";
import { createChunk, hasChunk, tile } from "./world";

registerZoom(zoom);

startRenderLoop();

const screen = addComponent({
	bounds: uiPos({ type: "lurdwh", left: 0, right: 0, top: 0, bottom: 0 }),
	z: 0,
	drawInfo: { type: "invisible", pressable: false, selectable: false },
});

let tick = 0;
const mouse = attachMouseController(screen);
let mouseLastTick: Mouse = { ...mouse };
let mouseWorldPosLastTick: CrudeTilePos = { type: "crude", x: 0, y: 0 };

const feature1 = addComponent<ButtonComponent>({
	bounds: uiPos({ type: "lurdwh", bottom: 10, left: 10, width: 100, height: 100 }),
	z: 1,
	drawInfo: { type: "button", icon: "x", pressable: true, selectable: true, isPressed: false, isSelected: false },
});
const feature2 = addComponent<ButtonComponent>({
	bounds: uiPos({ type: "lurdwh", bottom: 10, left: 120, width: 100, height: 100 }),

	z: 1,
	drawInfo: { type: "button", icon: "tree-1", pressable: true, selectable: true, isPressed: false, isSelected: false },
});
const feature3 = addComponent<ButtonComponent>({
	bounds: uiPos({ type: "lurdwh", bottom: 10, left: 230, width: 100, height: 100 }),

	z: 1,
	drawInfo: { type: "button", icon: "stone-1", pressable: true, selectable: true, isPressed: false, isSelected: false },
});

createRadioGroup("features", {
	entries: [
		{
			component: feature1,
			onSelected: () => {
				featureIndex = 0;
			},
			onDeselected: () => {},
		},
		{
			component: feature2,
			onSelected: () => {
				featureIndex = 1;
			},
			onDeselected: () => {},
		},
		{
			component: feature3,
			onSelected: () => {
				featureIndex = 2;
			},
			onDeselected: () => {},
		},
	],
	selectedIndex: 0,
});

let featureIndex = 0;

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

	highlightedTiles.length = 0;
	const pos = canvas2tile(mouse.pos, getCanvasCameraInfo());
	highlightedTiles.push({ ...pos });
	highlightedTiles.push({ ...pos });
	pos.x += 2;
	highlightedTiles.push({ ...pos });
	pos.x -= 1;
	pos.y += 1;
	highlightedTiles.push({ ...pos });
	pos.x -= 2;
	highlightedTiles.push({ ...pos });
	pos.x -= 1;
	pos.y -= 1;
	highlightedTiles.push({ ...pos });
	pos.x += 1;
	pos.y -= 1;
	highlightedTiles.push({ ...pos });
	pos.x += 2;
	highlightedTiles.push({ ...pos });

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
