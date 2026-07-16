import { perlin } from "./perlin";
import { tileTypes, type TileTypeBase } from "./tile";
import type { CrudeTilePos, TilePos } from "./types";

export function getType(pos: CrudeTilePos | TilePos): number {
	const n = 10 * (noise(pos, 0.02) + noise(pos, 0.04) / 2 + noise(pos, 0.2) / 4 + noise(pos, 0.4) / 8);
	return tileTypes
		.map((t, i) => [t, i] as [TileTypeBase, number])
		.reduce((prev, cur) => {
			return Math.abs(n - cur[0].level) < Math.abs(n - prev[0].level) ? cur : prev;
		})[1];
}

function noise(pos: CrudeTilePos | TilePos, scale: number) {
	return perlin(pos.x * scale, pos.y * scale);
}
