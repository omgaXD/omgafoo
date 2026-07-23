import { Feature, features } from "./feature";
import { perlin } from "./perlin";
import { encodeTile, tileHasTag, tileTypes, type TileTypeBase } from "./tile";
import type { CrudeTilePos, TilePos, Vec2 } from "./coreTypes";

const offsetA: Vec2 = { x: 123, y: 456 };
const offsetB: Vec2 = { x: 999, y: 999 };

export function getType(pos: CrudeTilePos | TilePos): number {
	const a = levelA(pos);
	const b = levelB(pos);

	const typeIndex = tileTypes
		.map((t, i) => [t, i] as [TileTypeBase, number])
		.reduce((prev, cur) => {
			return score(cur[0], a, b) < score(prev[0], a, b) ? cur : prev;
		})[1];

	const m = 8 * noise(pos, offsetB, 0.15);
	const r = 8 * noise(pos, offsetA, 0.15);

	let candidate: Feature;
	if (m > r && !tileHasTag(typeIndex, "water")) candidate = "tree";
	else candidate = "stone";

	const featureIndex = features.indexOf(Math.max(m, r) > 3 ? candidate : "none");

	return encodeTile({
		typeIndex,
		featureIndex,
	});
}

function score(t: TileTypeBase, levelA: number, levelB: number): number {
	return Math.abs(levelA - t.levelA) + Math.abs(levelB - t.levelB) / 10;
}

function levelA(pos: CrudeTilePos | TilePos): number {
	return (
		10 *
		(noise(pos, offsetA, 0.02) +
			noise(pos, offsetA, 0.04) / 2 +
			noise(pos, offsetA, 0.2) / 4 +
			noise(pos, offsetA, 0.4) / 8)
	);
}
function levelB(pos: CrudeTilePos | TilePos): number {
	return 10 * noise(pos, offsetA, 0.9) + 20 * noise(pos, offsetB, 0.15);
}

function noise(pos: CrudeTilePos | TilePos, offset: Vec2, scale: number) {
	return perlin((pos.x + offset.x) * scale, (pos.y + offset.y) * scale);
}
