export type TileTypeBase = {
	name: string;
	level: number;
	tileTags: TileTag[];
};
export type TileTag = "desert" | "water";
export const tileTypes = [
	{
		name: "grass",
		level: 0,
		tileTags: [],
	},
	{
		name: "sand",
		level: 3,
		tileTags: ["desert"],
	},
	{
		name: "water",
		level: 4,
		tileTags: ["water"],
	},
	{
		name: "deep_water",
		level: 5,
		tileTags: ["water"],
	},
] as const satisfies TileTypeBase[];
export type TileType = (typeof tileTypes)[number];

export function tileHasTag(tt: TileTypeBase | number, tag: TileTag) {
	if (typeof tt === "number") tt = tileTypes[tt];
	return tt.tileTags.includes(tag);
}

export const features = ["none", "tree", "stone"] as const;
export type Feature = (typeof features)[number];
export type Tile = {
	typeIndex: number;
	featureIndex: number;
};

export function encodeTile(tile: Tile): number {
	return tile.typeIndex | (tile.featureIndex << 3);
}

export function decodeTile(tile: number): Tile {
	return {
		typeIndex: tile & 7,
		featureIndex: (tile >> 3) & 3,
	};
}
