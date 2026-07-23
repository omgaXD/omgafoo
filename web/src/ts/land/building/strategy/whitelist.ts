import { TilePos } from "../../coreTypes";
import { Feature, features } from "../../feature";
import { TileTag, tileHasTag, decodeTile } from "../../tile";
import { IWorld } from "../../world/types";
import { IBuildingStrategy } from "../types";

export class TileTagWhitelistStrategy implements IBuildingStrategy {
	id = "tileTagWhitelist";
	constructor(private tags: TileTag[]) {}
	canPlace(world: IWorld, pos: TilePos): boolean {
		return this.tags.some((t) => tileHasTag(decodeTile(world.tile(pos)!).typeIndex, t));
	}
}
export class FeatureWhitelistStrategy implements IBuildingStrategy {
	id = "featureWhitelist";
	constructor(private tags: Feature[]) {}
	canPlace(world: IWorld, pos: TilePos): boolean {
		return this.tags.includes(features[decodeTile(world.tile(pos)!).featureIndex]);
	}
}
