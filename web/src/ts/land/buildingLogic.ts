import { Building, BuildingKind, buildings } from "./building";
import { decodeTile, features, tileHasTag } from "./tile";
import { TilePos } from "./types";
import { tile } from "./world";

export function canPlaceBuilding(b: Building | BuildingKind, pos: TilePos): boolean {
	if (typeof b === 'string') b = buildings[b];
	const data = tile(pos);
	if (data === undefined) return false;
	const t = decodeTile(data);
	if (b.allowedTileFeatures) {
		if (!b.allowedTileFeatures.includes(features[t.featureIndex])) return false;
	}
	if (b.allowedTileTags) {
		if (
			!b.allowedTileTags.some((tag) => {
				return tileHasTag(t.typeIndex, tag);
			})
		) {
			return false;
		}
	}
	return true;
}
