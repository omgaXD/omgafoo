import { camera, interpolate } from "./camera";
import { canvas, ctx } from "./canvas";
import { TILE_W, TILE_H } from "./const";
import { type CanvasCameraInfo, tile2canvas, cwc2tile, getVisibleChunkPoses, i2wc } from "./pos";
import { decodeTile, features, tileHasTag, tileTypes, type Tile, type TileType } from "./tile";
import type { Icon, TilePos } from "./types";
import { components } from "./ui";
import { Component, DEFAULT_STYLE, Style } from "./ui/types";
import { chunks, type ChunkGen } from "./world";

export const highlightedTiles: TilePos[] = [];

export function startRenderLoop() {
	function loop() {
		interpolate();
		render();
		requestAnimationFrame(loop);
	}
	loop();
}

export function getCanvasCameraInfo(): CanvasCameraInfo {
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
	const [from, to] = getVisibleChunkPoses(getCanvasCameraInfo(), 2);
	drawTiles(() => chunks(from, to));

	drawFeatures(chunks(from, to));

	for (const c of components.asc()) {
		drawComponent(c);
	}

	ctx.fillStyle = '#ffffff22';
	for (const tp of highlightedTiles) {
		drawHexagon(...getHexagonBounds(tp))
	}

	drawFps();
}

function drawComponent(component: Component) {
	switch (component.drawInfo.type) {
		case "invisible":
			break;
		case "container":
		case "button":
			ctx.fillStyle = determineComponentBgColor(component, DEFAULT_STYLE);
			ctx.fillRect(component.pos.x, component.pos.y, component.w, component.h);
			if (component.drawInfo.type === "button") {
				if (component.drawInfo.icon) {
					drawIcon(component.drawInfo.icon, component.pos.x, component.pos.y, component.w, component.h);
				}
				if (component.drawInfo.text) {
					throw Error();
				}
			}
			break;
	}
}

function determineComponentBgColor(component: Component, style: Style = DEFAULT_STYLE) {
	if (component.drawInfo.pressable === true) {
		if (component.drawInfo.isPressed && style.bgColor.pressed) return style.bgColor.pressed;
	}
	if (component.drawInfo.selectable === true) {
		if (component.drawInfo.isSelected && style.bgColor.selected) return style.bgColor.selected;
	}
	return style.bgColor.normal;
}

function drawFps() {
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
	const tileTypeCounts = new Array({ length: tileTypes.length }).map((_) => 0);
	for (const [, chunk] of chunks()) {
		if (chunk === undefined) continue;
		chunk.tileTypeCounts.forEach((c, i) => (tileTypeCounts[i] += c));
	}
	const mostCommon = tileTypeCounts
		.map((c, i) => [c, i] as [number, number])
		.reduce((prev, cur) => {
			return cur[0] > prev[0] ? cur : prev;
		})[1];
	ctx.fillStyle = determineTileColor(tileTypes[mostCommon]);
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	tileTypes.forEach((tt, i) => {
		if (i === mostCommon) return;
		ctx.fillStyle = determineTileColor(tt);
		ctx.beginPath();
		for (const [pos, chunk] of chunks()) {
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
		case 'grass_alt':
			return "#33aa22"
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
			if (tileHasTag(type, "water")) break;
			if (tileHasTag(type, "desert")) drawIcon("palm", x, y, w, h);
			else drawIcon("tree", x, y, w, h);
			break;
		case "stone":
			if (tileHasTag(type, "water")) drawIcon("waterstone", x, y, w, h);
			else if (tileHasTag(type, "desert")) drawIcon("sandstone", x, y, w, h);
			else drawIcon("stone", x, y, w, h);
			break;
	}
}

function drawIcon(icon: Icon, x: number, y: number, w: number, h: number) {
	switch (icon) {
		case "palm":
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
			break;
		case "tree":
			ctx.fillStyle = "brown";
			ctx.fillRect(x + w * 0.4, y + h * 0.6, w * 0.2, h * 0.2);
			ctx.fillStyle = "green";
			ctx.fillRect(x + w * 0.3, y + h * 0.2, w * 0.4, h * 0.4);
			break;
		case "stone":
		case "sandstone":
		case "waterstone":
			if (icon === "stone") ctx.fillStyle = "#88aaaa";
			if (icon === "sandstone") ctx.fillStyle = "#aa8833";
			if (icon === "waterstone") ctx.fillStyle = "#4444bb11";
			ctx.beginPath();
			ctx.moveTo(x + w * 0.5, y + h * 0.3);
			ctx.lineTo(x + w * 0.8, y + h * 0.5);
			ctx.lineTo(x + w * 0.7, y + h * 0.8);
			ctx.lineTo(x + w * 0.3, y + h * 0.8);
			ctx.lineTo(x + w * 0.2, y + h * 0.5);
			ctx.fill();
			if (icon !== "waterstone") {
				ctx.fillStyle = "#ffffff22";
				ctx.beginPath();
				ctx.moveTo(x + w * 0.5, y + h * 0.3);
				ctx.lineTo(x + w * 0.3, y + h * 0.8);
				ctx.lineTo(x + w * 0.2, y + h * 0.5);
				ctx.fill();
			}
			break;
		case "x":
			ctx.fillStyle = "black";
			ctx.beginPath();
			ctx.moveTo(x + w * 0.2, y + h * 0.2);
			ctx.lineTo(x + w * 0.3, y + h * 0.2);
			ctx.lineTo(x + w * 0.5, y + h * 0.4);
			ctx.lineTo(x + w * 0.7, y + h * 0.2);
			ctx.lineTo(x + w * 0.8, y + h * 0.2);
			ctx.lineTo(x + w * 0.8, y + h * 0.3);
			ctx.lineTo(x + w * 0.6, y + h * 0.5);
			ctx.lineTo(x + w * 0.8, y + h * 0.7);
			ctx.lineTo(x + w * 0.8, y + h * 0.8);
			ctx.lineTo(x + w * 0.7, y + h * 0.8);
			ctx.lineTo(x + w * 0.5, y + h * 0.6);
			ctx.lineTo(x + w * 0.3, y + h * 0.8);
			ctx.lineTo(x + w * 0.2, y + h * 0.8);
			ctx.lineTo(x + w * 0.2, y + h * 0.7);
			ctx.lineTo(x + w * 0.4, y + h * 0.5);
			ctx.lineTo(x + w * 0.2, y + h * 0.3);
			ctx.fill();
			break;
	}
}

function drawHexagon(x: number, y: number, w: number, h: number) {
	ctx.beginPath();
	batchHexagon(x, y, w, h);
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

function getHexagonBounds(pos: TilePos): [number, number, number, number] {
	const c = tile2canvas({ type: "crude", x: pos.x - 1, y: pos.y - 2 / 3 }, getCanvasCameraInfo());
	return [c.x, c.y, TILE_W * camera.scale, TILE_H * camera.scale];
}
