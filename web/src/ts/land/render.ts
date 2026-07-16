import { camera, interpolate } from "./camera";
import { canvas, ctx } from "./canvas";
import { TILE_W, TILE_H } from "./const";
import { mouse } from "./controls";
import {
	type CanvasCameraInfo,
	tile2canvas as $canvas,
	canvas2tile,
	cwc2tile,
	getVisibleChunkPoses,
	i2wc,
} from "./pos";
import { decodeTile, features, tileTypeHasTag as tileHasTag, tileTypes, type Tile, type TileType } from "./tile";
import type { TilePos } from "./types";
import { chunks, type ChunkGen } from "./world";

export function startRenderLoop() {
	function loop() {
		interpolate();
		render();
		requestAnimationFrame(loop);
	}
	loop();
}

export function getInfo(): CanvasCameraInfo {
	return {
		cameraPos: camera.pos,
		cameraScale: camera.scale,
		canvasHeight: canvas.height,
		canvasWidth: canvas.width,
	};
}

let prev = performance.now();
let fps: string;
let tick = 0;

function render() {
	clear();

	const [from, to] = getVisibleChunkPoses(getInfo(), 2);
	drawTiles(() => chunks(from, to));

	drawFeatures(chunks(from, to));

	const tp = canvas2tile(mouse.pos, getInfo());
	ctx.fillStyle = "#ffff0088";
	drawHexagon(...getHexagonBounds(tp));

	ctx.fillStyle = "white";
	ctx.textBaseline = "top";
	ctx.font = "bold 40px mono";
	ctx.fillText(`${fps}fps`, 0, 10);
	tick++;
	const now = performance.now();
	if (tick % 20 === 0) {
		fps = (1000 / (now - prev)).toFixed();
	}
	prev = now;
}

function drawTiles(chunks: () => ChunkGen) {
	tileTypes.forEach((tt, i) => {
		ctx.fillStyle = determineTileColor(tt);
		ctx.beginPath();
		for (let [pos, chunk] of chunks()) {
			if (chunk === undefined) continue;
			chunk.tiles.forEach((t, j) => {
				if (decodeTile(t).typeIndex === i) {
					const tilePos = cwc2tile(pos, i2wc(j));
					batchHexagon(...getHexagonBounds(tilePos));
				}
			});
		}
		ctx.fill();
	});
}

function determineTileColor(t: TileType): string {
	switch (t.name) {
		case "grass":
			return "#44aa33";
		case "sand":
			return "#ddaa66";
		case "water":
			return "#aabbff";
		case "deep_water":
			return "#6699ff";
	}
}

function drawFeatures(chunks: ChunkGen) {
	for (let [pos, chunk] of chunks) {
		if (chunk === undefined) continue;
		chunk.tiles.forEach((t, j) => {
			const tilePos = cwc2tile(pos, i2wc(j));
			drawFeature(tilePos, decodeTile(t));
		});
	}
}

function drawFeature(pos: TilePos, tile: Tile) {
	const [x, y, w, h] = getHexagonBounds(pos);

	const type = tileTypes[tile.typeIndex];
	const feature = features[tile.featureIndex];

	switch (feature) {
		case "none":
			break;
		case "tree":
			if (tileHasTag(type, 'water')) break;
			if (tileHasTag(type, 'desert')) {
				ctx.fillStyle = "brown";
				ctx.fillRect(x + w * 0.4, y + h * 0.6, w * 0.2, h * 0.2);
				ctx.fillStyle = "lime";
				ctx.beginPath();
				ctx.moveTo(x + w * 0.7, y + h * 0.3);
				ctx.lineTo(x + w * 0.6, y + h * 0.5);
				ctx.lineTo(x + w * 0.8, y + h * 0.6);
				ctx.lineTo(x + w * 0.2, y + h * 0.6);
				ctx.lineTo(x + w * 0.4, y + h * 0.5);
				ctx.lineTo(x + w * 0.3, y + h * 0.3);
				ctx.lineTo(x + w * 0.5, y + h * 0.4);
				ctx.fill();
			} else {
				ctx.fillStyle = "brown";
				ctx.fillRect(x + w * 0.4, y + h * 0.6, w * 0.2, h * 0.2);
				ctx.fillStyle = "green";
				ctx.fillRect(x + w * 0.3, y + h * 0.2, w * 0.4, h * 0.4);
			}
			break;
		case "stone":
			break;
	}
}

function drawHexagon(x: number, y: number, w: number, h: number) {
	ctx.beginPath();
	ctx.moveTo(x + w / 2, y);
	ctx.lineTo(x + w, y + h / 4);
	ctx.lineTo(x + w, y + (3 * h) / 4);
	ctx.lineTo(x + w / 2, y + h);
	ctx.lineTo(x, y + (3 * h) / 4);
	ctx.lineTo(x, y + h / 4);
	ctx.fill();
}

function batchHexagon(x: number, y: number, w: number, h: number) {
	ctx.moveTo(x + w / 2, y);
	ctx.lineTo(x + w, y + h / 4);
	ctx.lineTo(x + w, y + (3 * h) / 4);
	ctx.lineTo(x + w / 2, y + h);
	ctx.lineTo(x, y + (3 * h) / 4);
	ctx.lineTo(x, y + h / 4);
}

function clear() {
	ctx.fillStyle = "purple";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getHexagonBounds(pos: TilePos): [number, number, number, number] {
	const c = $canvas({ type: "crude", x: pos.x - 1, y: pos.y - 2 / 3 }, getInfo());
	return [c.x, c.y, TILE_W * camera.scale, TILE_H * camera.scale];
}
