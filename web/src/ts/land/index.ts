import { controlCamera, moveCamera, setAnchor, zoom } from "./camera";
import { attachMouseController, Controls, controls, registerZoom, type Mouse } from "./controls";
import { xy2c, getVisibleChunkPoses, canvas2crude, canvasCanvas2worldDiff, canvas2tile } from "./pos";
import { State } from "./state";
import type { Camera, CrudeTilePos, Vec2 } from "./coreTypes";
import { addComponent } from "./ui/ui";
import { initMainScreen } from "./ui/main";
import { uiPos } from "./ui/uiPos";
import { World } from "./world/world";
import { canvas, ctx } from "./canvas";
import { Renderer } from "./render/render";

const camera: Camera = {
		pos: { type: "crude", x: 0, y: 0 },
		scale: 0.5,
	},
	logicCamera: Camera = {
		pos: { type: "crude", x: 0, y: 0 },
		scale: 0.5,
	};


registerZoom((v) => zoom(v, logicCamera));
const world = new World();
const state: State = {
	previews: [],
	highlightedTiles: { danger: [], info: [], success: [] },
	world,
	camera, 
	logicCamera,
	tick: 0
};
const renderer = new Renderer(state, canvas, ctx);
renderer.startRenderLoop();

const screen = addComponent({
	bounds: uiPos({ type: "absolute", left: 0, right: 0, top: 0, bottom: 0 }),
	z: 0,
	drawInfo: { type: "invisible", pressable: false, selectable: false },
});

const mouse = attachMouseController(screen);
let mouseLastTick: Mouse = { ...mouse };
let mouseWorldPosLastTick: CrudeTilePos = { type: "crude", x: 0, y: 0 };
let controlsLastTick: Controls = { ...controls };

const building = initMainScreen();

function logic() {
	const info = renderer.getCanvasCameraInfo();
	const mousePosThisTick = canvas2crude(mouse.pos, info);

	setAnchor(mousePosThisTick, logicCamera);
	if (mouse.r) {
		const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, info);
		moveCamera(diff, logicCamera);
	} else {
		controlCamera(controls, camera, logicCamera);
		if (mouseLastTick.r) {
			const diff: Vec2 = canvasCanvas2worldDiff(mouseLastTick.pos, mouse.pos, info);
			const abrupt = 10 < diff.x ** 2 + diff.y ** 2;
			if (abrupt) {
				moveCamera({ x: diff.x * 2, y: diff.y * 2 }, logicCamera);
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

	const pos = canvas2tile(mouse.pos, info);

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

	const [from, to] = getVisibleChunkPoses(info, 10);

	for (let x = from.x; x <= to.x; x++) {
		for (let y = from.y; y <= to.y; y++) {
			if (((x + y) & 1) === (state.tick & 1)) continue;
			if (!world.hasChunk(xy2c(x, y))) world.createChunk(xy2c(x, y));
		}
	}

	mouseLastTick = { ...mouse, pos: { ...mouse.pos } };
	mouseWorldPosLastTick = mousePosThisTick;
	controlsLastTick = { ...controls };
	state.tick++;
}

setInterval(logic, 50);
