import { buildings, PreviewBuildingData } from "./building";
import { camera, interpolate } from "./camera";
import { canvas, ctx } from "./canvas";
import { TILE_H, TILE_W } from "./const";
import { rnd4tile, splitCircle } from "./helpers";
import { Icon, icons } from "./icon";
import { cwc2tile, getVisibleChunkPoses, i2wc, tile2canvas, type CanvasCameraInfo } from "./pos";
import { State } from "./state";
import { decodeTile, features, tileHasTag, tileTypes, type Tile, type TileType } from "./tile";
import type { TilePos } from "./types";
import { components } from "./ui";
import { extractBounds } from "./ui/component";
import { Component, DEFAULT_STYLE, Style } from "./ui/types";
import { BuildingGen, buildingGen, chunkGen, type ChunkGen } from "./world";

export function startRenderLoop(state: State) {
	function loop() {
		interpolate();
		render(state);
		requestAnimationFrame(loop);
	}
	loop();
}

export const canvasCameraInfo: CanvasCameraInfo = {
	cameraPos: camera.pos,
	cameraScale: camera.scale,
	canvasHeight: canvas.height,
	canvasWidth: canvas.width,
};
export function updateCanvasCameraInfo() {
	canvasCameraInfo.cameraPos = camera.pos;
	canvasCameraInfo.cameraScale = camera.scale;
	canvasCameraInfo.canvasHeight = canvas.height;
	canvasCameraInfo.canvasWidth = canvas.width;
}

let prev = performance.now();
let fps: string;
let tick = 0;

function render(state: State) {
	updateCanvasCameraInfo();
	const [from, to] = getVisibleChunkPoses(canvasCameraInfo, 2);
	drawTiles(() => chunkGen(from, to));

	drawFeatures(chunkGen(from, to));

	drawBuildings(buildingGen(from, to));

	ctx.fillStyle = "#ffffff22";
	for (const tp of state.highlightedTiles.info) {
		drawHexagon(...getHexagonBounds(tp));
	}
	ctx.fillStyle = "#22ff2222";
	for (const tp of state.highlightedTiles.success) {
		drawHexagon(...getHexagonBounds(tp));
	}
	ctx.fillStyle = "#ff222222";
	for (const tp of state.highlightedTiles.danger) {
		drawHexagon(...getHexagonBounds(tp));
	}

	for (const preview of state.buildingPreviews) {
		drawBuildingPreview(...preview);
	}

	for (const c of components.asc()) {
		drawComponent(c);
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
			const bounds = extractBounds(component);
			ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
			if (component.drawInfo.type === "button") {
				if (component.drawInfo.icon) {
					drawIcon(component.drawInfo.icon, bounds.x, bounds.y, bounds.w, bounds.h);
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
			chunk.perimeters[i].forEach(arr => {
				if (arr.length === 0) throw 'whaat.';
				const p = tile2canvas(arr[0], canvasCameraInfo);
				ctx.moveTo(Math.round(p.x), Math.round(p.y));
				arr.forEach((p, i) => {
					if (i === 0) return;
					const p2 = tile2canvas(p, canvasCameraInfo);
					ctx.lineTo(Math.round(p2.x), Math.round(p2.y));
				})
			})
		}
		ctx.fill();
	});
}

function determineTileColor(t: TileType): string {
	switch (t.name) {
		case "grass":
			return "#44aa33";
		case "grass_alt":
			return "#33aa22";
		case "sand":
			return "#ddaa66";
		case "water":
			return "#aabbff";
		case "deep_water":
			return "#6699ff";
	}
}

function drawBuildings(buildingGen: BuildingGen) {
	for (const [pos, data] of buildingGen) {
		drawIcon(buildings[data.b].icon, ...getBuildingBounds(pos, buildings[data.b].shape));
	}
}

function drawFeatures(chunks: ChunkGen) {
	for (const [pos, chunk] of chunks) {
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
			const treeSubtype = rnd4tile(1, 2, pos.x, pos.y, 123) as 1 | 2;
			if (tileHasTag(type, "water")) break;
			if (tileHasTag(type, "desert")) drawIcon("palm", x, y, w, h);
			else drawIcon(`tree-${treeSubtype}`, x, y, w, h);
			break;
		case "stone":
			const stoneSubtype = rnd4tile(1, 2, pos.x, pos.y, 123) as 1 | 2;
			if (tileHasTag(type, "water")) drawIcon(`waterstone-${stoneSubtype}`, x, y, w, h);
			else if (tileHasTag(type, "desert")) drawIcon(`sandstone-${stoneSubtype}`, x, y, w, h);
			else drawIcon(`stone-${stoneSubtype}`, x, y, w, h);
			break;
	}
}

function drawIcon(icon: Icon, x: number, y: number, w: number, h: number) {
	switch (icon) {
		case "waterWheel-animated":
			ctx.fillStyle = "brown";
			ctx.beginPath();
			const angle = icon.endsWith("-animated") ? tick * 5 : 0;
			const [oX, oY] = [x + w * 0.5, y + h * 0.75];
			const wMod = 0.4,
				hMod = 0.1;

			const splits = splitCircle(6, angle);
			ctx.moveTo(oX + w * wMod * splits[0].x, oY + h * hMod * splits[0].y);
			splits.forEach((i) => {
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y);
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y - h * 0.2);
				ctx.lineTo(oX, oY - h * 0.1);
				ctx.lineTo(oX, oY);
			});

			ctx.fill();
			break;
		default:
			ctx.drawImage(bakedIcons[icon], x, y, w, h);
	}
}

const ICON_WIDTH = 256;
const ICON_HEIGHT = 256;
function bakeIcon(icon: Icon, ctx: OffscreenCanvasRenderingContext2D) {
	const w = ICON_WIDTH,
		h = ICON_HEIGHT;
	switch (icon) {
		case "palm":
			ctx.fillStyle = "brown";
			ctx.fillRect(w * 0.4, h * 0.6, w * 0.2, h * 0.2);
			ctx.fillStyle = "lime";
			ctx.beginPath();
			ctx.moveTo(w * 0.7, h * 0.3);
			ctx.lineTo(w * 0.6, h * 0.5);
			ctx.lineTo(w * 0.8, h * 0.6);
			ctx.lineTo(w * 0.2, h * 0.6);
			ctx.lineTo(w * 0.4, h * 0.5);
			ctx.lineTo(w * 0.3, h * 0.3);
			ctx.lineTo(w * 0.5, h * 0.4);
			ctx.fill();
			break;
		case "tree-1":
		case "tree-2":
			const treeOffset = icon[5] === "1" ? 0 : 0.1;
			ctx.fillStyle = "brown";
			ctx.fillRect(w * 0.4, h * (0.6 + treeOffset), w * 0.2, h * 0.2);
			ctx.fillStyle = "green";
			ctx.fillRect(w * (0.3 + treeOffset / 2), h * 0.2, w * (0.4 - treeOffset), h * (0.4 + treeOffset));
			break;
		case "stone-1":
		case "stone-2":
		case "sandstone-1":
		case "sandstone-2":
		case "waterstone-1":
		case "waterstone-2":
			if (icon.startsWith("stone-")) ctx.fillStyle = "#88aaaa";
			if (icon.startsWith("sandstone-")) ctx.fillStyle = "#aa8833";
			if (icon.startsWith("waterstone-")) ctx.fillStyle = "#4444bb11";
			ctx.beginPath();
			const stoneOffset = icon[6] === "1" ? 0.1 : -0.1;
			ctx.moveTo(w * (0.5 + stoneOffset), h * 0.3);
			ctx.lineTo(w * 0.8, h * 0.5);
			ctx.lineTo(w * 0.7, h * 0.8);
			ctx.lineTo(w * 0.3, h * 0.8);
			ctx.lineTo(w * 0.2, h * 0.5);
			ctx.fill();
			if (!icon.startsWith("waterstone")) {
				ctx.fillStyle = "#ffffff22";
				ctx.beginPath();
				ctx.moveTo(w * (0.5 + stoneOffset), h * 0.3);
				ctx.lineTo(w * 0.3, h * 0.8);
				ctx.lineTo(w * 0.2, h * 0.5);
				ctx.fill();
			}
			break;
		case "x":
			ctx.fillStyle = "black";
			ctx.beginPath();
			ctx.moveTo(w * 0.2, h * 0.2);
			ctx.lineTo(w * 0.3, h * 0.2);
			ctx.lineTo(w * 0.5, h * 0.4);
			ctx.lineTo(w * 0.7, h * 0.2);
			ctx.lineTo(w * 0.8, h * 0.2);
			ctx.lineTo(w * 0.8, h * 0.3);
			ctx.lineTo(w * 0.6, h * 0.5);
			ctx.lineTo(w * 0.8, h * 0.7);
			ctx.lineTo(w * 0.8, h * 0.8);
			ctx.lineTo(w * 0.7, h * 0.8);
			ctx.lineTo(w * 0.5, h * 0.6);
			ctx.lineTo(w * 0.3, h * 0.8);
			ctx.lineTo(w * 0.2, h * 0.8);
			ctx.lineTo(w * 0.2, h * 0.7);
			ctx.lineTo(w * 0.4, h * 0.5);
			ctx.lineTo(w * 0.2, h * 0.3);
			ctx.fill();
			break;
		case "waterWheel":
			ctx.fillStyle = "brown";
			ctx.beginPath();
			const [oX, oY] = [w * 0.5, h * 0.75];
			const wMod = 0.4,
				hMod = 0.1;

			const splits = splitCircle(6);
			ctx.moveTo(oX + w * wMod * splits[0].x, oY + h * hMod * splits[0].y);
			splits.forEach((i) => {
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y);
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y - h * 0.2);
				ctx.lineTo(oX, oY - h * 0.1);
				ctx.lineTo(oX, oY);
			});

			ctx.fill();
			break;
	}
}

const bakedIcons: Record<Icon, ImageBitmap> = bakeIcons();
function bakeIcons(): Record<Icon, ImageBitmap> {
	return Object.fromEntries(
		icons.map((i) => {
			const c = new OffscreenCanvas(ICON_WIDTH, ICON_HEIGHT);
			bakeIcon(i, c.getContext("2d")!);
			return [i, c.transferToImageBitmap()];
		})
	) as Record<Icon, ImageBitmap>;
}

function drawBuildingPreview(building: PreviewBuildingData, pos: TilePos) {
	ctx.filter =
		building.preview === "allowed"
			? "brightness(0) saturate(100%) invert(75%) sepia(62%) saturate(430%) hue-rotate(81deg) brightness(96%) contrast(85%)"
			: "brightness(0) saturate(100%) invert(55%) sepia(54%) saturate(4822%) hue-rotate(332deg) brightness(106%) contrast(93%)";

	drawIcon(buildings[building.b].icon, ...getBuildingBounds(pos, buildings[building.b].shape));

	ctx.filter = "none";
}

function drawHexagon(x: number, y: number, w: number, h: number) {
	ctx.beginPath();
	batchHexagon(x, y, w, h);
	ctx.fill();
}

function batchHexagon(x: number, y: number, w: number, h: number) {
	ctx.moveTo(Math.floor(x + w / 2), y);
	ctx.lineTo(x + w, Math.floor(y + h / 4));
	ctx.lineTo(x + w, Math.ceil(y + (3 * h) / 4));
	ctx.lineTo(Math.floor(x + w / 2), y + h);
	ctx.lineTo(x, Math.ceil(y + (3 * h) / 4));
	ctx.lineTo(x, Math.floor(y + h / 4));
}

function getHexagonBounds(pos: TilePos): [number, number, number, number] {
	const centerX = canvasCameraInfo.canvasWidth / 2;
	const centerY = canvasCameraInfo.canvasHeight / 2;

	return [
		Math.floor((pos.x - 1 - canvasCameraInfo.cameraPos.x) * canvasCameraInfo.cameraScale * TILE_W * 0.5 + centerX),
		Math.floor((pos.y - 2 / 3 - canvasCameraInfo.cameraPos.y) * canvasCameraInfo.cameraScale * TILE_H * 0.75 + centerY),
		Math.ceil(TILE_W * camera.scale),
		Math.ceil(TILE_H * camera.scale)
	];
}

function getBuildingBounds(pos: TilePos, _shape: 1 | 3 | 7): [number, number, number, number] {
	const c = tile2canvas({ type: "crude", x: pos.x - 1, y: pos.y - 4 / 3 }, canvasCameraInfo
	);
	return [Math.floor(c.x), Math.floor(c.y), Math.ceil(TILE_W * camera.scale), Math.ceil(TILE_H * camera.scale * 1.5)];
}
