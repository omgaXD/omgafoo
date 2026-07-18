import { PreviewBuildingData } from "./building";
import { TilePos } from "./types";

export type State = {
	buildingPreviews: [PreviewBuildingData, TilePos][];
	highlightedTiles: Record<'info' | 'danger' | 'success', TilePos[]>;
};
