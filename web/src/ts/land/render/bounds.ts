import { TILE_W, TILE_H } from "../const";
import { CanvasCameraInfo, TilePos } from "../coreTypes";
import { tile2canvas } from "../pos";

export function getHexagonBounds(pos: TilePos, info: CanvasCameraInfo): [number, number, number, number] {
	const c = tile2canvas({ type: "crude", x: pos.x - 1, y: pos.y - 2 / 3 }, info);
	return [Math.floor(c.x), Math.floor(c.y), Math.ceil(TILE_W * info.cameraScale), Math.ceil(TILE_H * info.cameraScale)];
}

export function getBuildingBounds(pos: TilePos, info: CanvasCameraInfo): [number, number, number, number] {
	const c = tile2canvas({ type: "crude", x: pos.x - 1, y: pos.y - 4 / 3 }, info);
	return [Math.floor(c.x), Math.floor(c.y), Math.ceil(TILE_W * info.cameraScale), Math.ceil(TILE_H * info.cameraScale * 1.5)];
}
