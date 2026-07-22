import { CHUNK_SIZE } from "./const";
import { cwc2tile, i2wc, wc2i } from "./pos";
import { decodeTile, tileTypes } from "./tile";
import { ChunkPos, CrudeTilePos } from "./types/core";
import { Perimeter } from "./world/types";

export function calculatePerimeters(tiles: Uint8Array, chunkPos: ChunkPos): Perimeter[] {
	return tileTypes.map((_, tti) => {
		const rawPointGraph = new Map<string, [string, string][]>();
		function g(side: [string, string]): [string, string][] {
			return getDefault(key(side), rawPointGraph, []);
		}
		function addSide(undef: undefined | any, c1: [string, string], c2: [string, string]) {
			if (undef === undefined) {
				g(c1).push(c2);
			}
		}
		for (let i = 0; i < CHUNK_SIZE * CHUNK_SIZE; i++) {
			if (decodeTile(tiles[i]).typeIndex !== tti) continue;
			const n = neighbors(i, tti, tiles);
			const c = corners(i, chunkPos);
			addSide(n.l, tup(c.tl), tup(c.bl));
			addSide(n.tl, tup(c.t), tup(c.tl));
			addSide(n.tr, tup(c.tr), tup(c.t));
			addSide(n.r, tup(c.br), tup(c.tr));
			addSide(n.br, tup(c.b), tup(c.br));
			addSide(n.bl, tup(c.bl), tup(c.b));
		}

		const per: Perimeter = [];
		const visited = new Set<string>();
		for (const [xy] of rawPointGraph) {
			if (visited.has(xy)) continue;
			const [x, y] = xy.split(";");
			const result = dfs(x, y, [], visited, rawPointGraph);
			per.push(result);
		}
		return per;
	});
}

function dfs(
	x: string,
	y: string,
	result: CrudeTilePos[],
	visited: Set<string>,
	g: Map<string, [string, string][]>,
): CrudeTilePos[] {
	result.push({
		type: "crude",
		x: +x,
		y: +y,
	});
	visited.add(key([x, y]));
	let visits = 0;
	for (const n of g.get(key([x, y]))!) {
		if (visited.has(key(n))) continue;
		visits++;
		dfs(n[0], n[1], result, visited, g);
	}
	if (visits > 1) throw Error("what");
	return result;
}
function key(xy: [string, string]) {
	return `${xy[0]};${xy[1]}`;
}
function tup(xy: [number, number]): [string, string] {
	return [xy[0].toFixed(3), xy[1].toFixed(3)];
}

type Direction = "l" | "r" | "tl" | "tr" | "bl" | "br";
type Corner = "t" | "b" | "tl" | "bl" | "tr" | "br";
function neighbors(i: number, tt: number, tiles: Uint8Array): Partial<Record<Direction, number>> {
	const wc = i2wc(i);
	const n = (
		[
			["l", wc.x - 1, wc.y],
			["r", wc.x + 1, wc.y],
			["tl", wc.x - 1 + (wc.y % 2), wc.y - 1],
			["tr", wc.x + (wc.y % 2), wc.y - 1],
			["bl", wc.x - 1 + (wc.y % 2), wc.y + 1],
			["br", wc.x + (wc.y % 2), wc.y + 1],
		] as [Direction, number, number][]
	)
		.filter((p) => p[1] >= 0 && p[2] >= 0 && p[1] < CHUNK_SIZE && p[2] < CHUNK_SIZE)
		.map((a) => [a[0], wc2i({ type: "withinChunk", x: a[1], y: a[2] })] as [Direction, number])
		.filter((p) => decodeTile(tiles[p[1]]).typeIndex === tt);
	return Object.fromEntries(n);
}

function corners(i: number, c: ChunkPos): Record<Corner, [number, number]> {
	const { x, y } = cwc2tile(c, i2wc(i));
	return {
		t: [x, y - 2 / 3],
		b: [x, y + 2 / 3],
		tl: [x - 1, y - 1 / 3],
		bl: [x - 1, y + 1 / 3],
		tr: [x + 1, y - 1 / 3],
		br: [x + 1, y + 1 / 3],
	};
}

function getDefault<K, V>(key: K, map: Map<K, V>, def: V) {
	if (!map.has(key)) {
		map.set(key, def);
	}
	return map.get(key)!;
}
