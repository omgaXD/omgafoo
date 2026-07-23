import { CanvasCameraInfo, TilePos } from "../coreTypes";
import { rnd4tile } from "../helpers";
import { cwc2tile, i2wc } from "../pos";
import { decodeTile, Tile, tileHasTag, tileTypes } from "../tile";
import { ChunkGen } from "../world/types";
import { drawIcon } from "./drawIcon";
import { getHexagonBounds } from "./bounds";
import { features } from "../feature";

export function drawFeatures(chunks: ChunkGen, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
	for (const [pos, chunk] of chunks) {
		if (chunk === undefined) continue;
		chunk.tiles.forEach((t, j) => {
			const tilePos = cwc2tile(pos, i2wc(j));
			drawFeature(tilePos, decodeTile(t), ctx, info);
		});
	}
}

function drawFeature(pos: TilePos, tile: Tile, ctx: CanvasRenderingContext2D, info: CanvasCameraInfo) {
	const [x, y, w, h] = getHexagonBounds(pos, info);

	const type = tileTypes[tile.typeIndex];
	const feature = features[tile.featureIndex];

	switch (feature) {
		case "none":
			break;
		case "tree":
			const treeSubtype = rnd4tile(1, 2, pos.x, pos.y, 123) as 1 | 2;
			if (tileHasTag(type, "water")) break;
			if (tileHasTag(type, "desert")) drawIcon("palm", ctx, x, y, w, h, info.frame);
			else drawIcon(`tree-${treeSubtype}`, ctx, x, y, w, h, info.frame);
			break;
		case "stone":
			const stoneSubtype = rnd4tile(1, 2, pos.x, pos.y, 123) as 1 | 2;
			if (tileHasTag(type, "water")) drawIcon(`waterstone-${stoneSubtype}`, ctx, x, y, w, h, info.frame);
			else if (tileHasTag(type, "desert")) drawIcon(`sandstone-${stoneSubtype}`, ctx, x, y, w, h, info.frame);
			else drawIcon(`stone-${stoneSubtype}`, ctx, x, y, w, h, info.frame);
			break;
	}
}
