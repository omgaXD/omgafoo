import { perlin } from "./perlin";
import { encodeTile, Feature, features, tileTypes, type TileTypeBase } from "./tile";
import type { CrudeTilePos, TilePos, Vec2 } from "./types";

const offsetA: Vec2 = {x: 123, y: 456}
const offsetB: Vec2 = {x: 999, y: 999}

export function getType(pos: CrudeTilePos | TilePos): number {
	const n = 10 * (noise(pos, offsetA, 0.02) + noise(pos, offsetA, 0.04) / 2 + noise(pos, offsetA, 0.2) / 4 + noise(pos, offsetA, 0.4) / 8);
	const typeIndex = tileTypes
		.map((t, i) => [t, i] as [TileTypeBase, number])
		.reduce((prev, cur) => {
			return Math.abs(n - cur[0].level) < Math.abs(n - prev[0].level) ? cur : prev;
		})[1];

	const m = 8 * noise(pos, offsetB, 0.15);
	const featureIndex = features.indexOf((m > 3) ? 'tree' : 'none');

	return encodeTile({
		typeIndex,
		featureIndex
	})
}

function noise(pos: CrudeTilePos | TilePos, offset: Vec2, scale: number) {
	return perlin((pos.x + offset.x) * scale, (pos.y + offset.y) * scale);
}
