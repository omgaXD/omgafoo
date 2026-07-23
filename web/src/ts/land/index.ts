import { controlCamera, moveCamera, setAnchor, zoom } from "./camera";
import { attachMouseController, Controls, controls, registerZoom, type Mouse } from "./controls";
import { xy2c, getVisibleChunkPoses, canvas2crude, canvasCanvas2worldDiff, canvas2tile } from "./pos";
import { canvasCameraInfo, startRenderLoop } from "./render";
import { State } from "./state";
import type { CrudeTilePos, Vec2 } from "./types/core";
import { addComponent } from "./ui/ui";
import { initMainScreen } from "./ui/main";
import { uiPos } from "./ui/uiPos";
import { World } from "./world/world";

registerZoom(zoom);
const world = new World();
const state: State = {
	previews: [],
	highlightedTiles: { danger: [], info: [], success: [] },
	world,
};
startRenderLoop(state);

const screen = addComponent({
	bounds: uiPos({ type: "absolute", left: 0, right: 0, top: 0, bottom: 0 }),
	z: 0,
	drawInfo: { type: "invisible", pressable: false, selectable: false },
});

let tick = 0;
const mouse = attachMouseController(screen);
let mouseLastTick: Mouse = { ...mouse };
let mouseWorldPosLastTick: CrudeTilePos = { type: "crude", x: 0, y: 0 };
let controlsLastTick: Controls = { ...controls };

const building = initMainScreen();

function logic() {
	const mousePosThisTick = canvas2crude(mouse.pos, canvasCameraInfo);

	setAnchor(mousePosThisTick);
	if (mouse.r) {
		const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, canvasCameraInfo);
		moveCamera(diff);
	} else {
		controlCamera(controls);
		if (mouseLastTick.r) {
			const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, canvasCameraInfo);
			const abrupt = 10 < diff.x ** 2 + diff.y ** 2;
			if (abrupt) {
				moveCamera({ x: diff.x * 2, y: diff.y * 2 });
			}
		}
	}

	if (mouse.l) {
		if (state.previews) {
			if (!state.previews.some((bp) => !world.buildingService.canPlaceBuilding(bp.pos, bp.building))) {
				state.previews.forEach((bp) => {
					world.buildingService.setBuilding(bp.pos, bp.building);
				});
				state.previews.length = 0;
				building.selectedIndex = 0;
			}
		}
	}

	state.highlightedTiles.danger.length = 0;
	state.highlightedTiles.info.length = 0;
	state.highlightedTiles.success.length = 0;

	const pos = canvas2tile(mouse.pos, canvasCameraInfo);

	if (building.selectedIndex === 1) {
		const canPlace = world.buildingService.canPlaceBuilding(pos, "waterWheel");
		state.previews = [{ building: "waterWheel", pos, preview: canPlace ? "allowed" : "disallowed" }];
		state.highlightedTiles[canPlace ? "success" : "danger"] = [{ ...pos }];
	} else if (building.selectedIndex === 2) {
		const canPlace = world.buildingService.canPlaceBuilding(pos, "rockCutter");
		state.previews = [{ building: "rockCutter", pos, preview: canPlace ? "allowed" : "disallowed" }];
		state.highlightedTiles[canPlace ? "success" : "danger"] = [{ ...pos }];
	} else {
		state.previews.length = 0;
		state.highlightedTiles.info = [{ ...pos }];
	}

	const [from, to] = getVisibleChunkPoses(canvasCameraInfo, 10);

	for (let x = from.x; x <= to.x; x++) {
		for (let y = from.y; y <= to.y; y++) {
			if (((x + y) & 1) === (tick & 1)) continue;
			if (!world.hasChunk(xy2c(x, y))) world.createChunk(xy2c(x, y));
		}
	}

	mouseLastTick = { ...mouse, pos: { ...mouse.pos } };
	mouseWorldPosLastTick = mousePosThisTick;
	controlsLastTick = { ...controls };
	tick++;
}

setInterval(logic, 50);
