import { controlCamera, moveCamera, setAnchor, zoom } from "./camera";
import { attachMouseController, Controls, controls, registerZoom, type Mouse } from "./controls";
import { xy2c, getVisibleChunkPoses, canvas2crude, canvasCanvas2worldDiff, canvas2tile, posEquals } from "./pos";
import { State } from "./state";
import type { Camera, CanvasCameraInfo, CrudeTilePos, TilePos, Vec2 } from "./coreTypes";
import { addComponent } from "./ui/ui";
import { initMainScreen } from "./ui/main";
import { uiPos } from "./ui/uiPos";
import { World } from "./world/world";
import { canvas, ctx } from "./canvas";
import { Renderer } from "./render/render";
import { buildings } from "./building/building";
import { getStratState, StrategyStates } from "./building/strategy/strategy";
import { Entries } from "./helpers";

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
	preview: null,
	world,
	camera,
	logicCamera,
	tick: 0,
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

	const pos = canvas2tile(mouse.pos, info);
	processPreviews(pos);
	
	processChunkGen(info);

	mouseLastTick = { ...mouse, pos: { ...mouse.pos } };
	mouseWorldPosLastTick = mousePosThisTick;
	controlsLastTick = { ...controls };
	state.tick++;
}

setInterval(logic, 50);
function processChunkGen(info: CanvasCameraInfo) {
	const [from, to] = getVisibleChunkPoses(info, 10);

	for (let x = from.x; x <= to.x; x++) {
		for (let y = from.y; y <= to.y; y++) {
			if (((x + y) & 1) === (state.tick & 1)) continue;
			if (!world.hasChunk(xy2c(x, y))) world.createChunk(xy2c(x, y));
		}
	}
}

function processPreviews(pos: TilePos) {
	if (building.value !== null) {
		const canPlace = world.buildingService.canPlaceBuilding(pos, building.value);
		if (mouse.l) {
			if (canPlace.verdict === true){
				world.buildingService.setBuilding(pos, building.value);
				const strats = buildings[building.value].strategies;
				(Object.entries(strats) as Entries<typeof strats>).forEach(([key, s]) => {if ('onPlace' in s) s.onPlace({world, pos, state: getStratState(key, s, world, pos) as any})})
				state.preview = null;
				building.selectedIndex = 0;
			}
			return;
		}

		if (canPlace.preview.length === state.preview?.instructions.length &&
			state.preview.instructions.every(
				({ ins }, i) => ins.type === canPlace.preview[i].type
			) && posEquals(state.preview.building.pos, pos)) return;

		state.preview = {
			instructions: canPlace.preview.map((p) => ({ id: crypto.randomUUID(), ins: p })),
			building: {
				kind: building.value,
				pos,
				state: canPlace.previewState,
				intent: canPlace.verdict ? "success" : "danger",
			},
		};
	} else {
		state.preview = null;
	}
}

