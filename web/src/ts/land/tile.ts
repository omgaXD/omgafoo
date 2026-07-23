export const tileTypes = [
	{
		name: "grass",
		levelA: 0,
		levelB: 0,
		tileTags: ["land"],
	},
	{
		name: "grass_alt",
		levelA: 0,
		levelB: 1,
		tileTags: ["land"],
	},
	{
		name: "sand",
		levelA: 3,
		levelB: 0,
		tileTags: ["desert", "land"],
	},
	{
		name: "water",
		levelA: 4,
		levelB: 0,
		tileTags: ["water"],
	},
	{
		name: "deep_water",
		levelA: 5,
		levelB: 0,
		tileTags: ["water"],
	},
] as const satisfies TileTypeBase[];
export type TileType = (typeof tileTypes)[number];
export type TileTypeBase = {
	name: string;
	levelA: number;
	levelB: number;
	tileTags: TileTag[];
};
export type TileTag = "desert" | "water" | "land";

export type Tile = {
	typeIndex: number;
	featureIndex: number;
};

export function tileHasTag(tt: TileTypeBase | number, tag: TileTag) {
	if (typeof tt === "number") tt = tileTypes[tt];
	return tt.tileTags.includes(tag);
}

export function encodeTile(tile: Tile): number {
	return tile.typeIndex | (tile.featureIndex << 3);
}

export function decodeTile(tile: number): Tile {
	return {
		typeIndex: tile & 7,
		featureIndex: (tile >> 3) & 3,
	};
}
