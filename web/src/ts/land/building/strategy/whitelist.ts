import { Feature, features } from "../../feature";
import { TileTag, tileHasTag, decodeTile } from "../../tile";
import { IBuildingStrategy, StrategyProps } from "../types";

export class TileTagWhitelistStrategy implements IBuildingStrategy {
	id = "tileTagWhitelist";
	constructor(private tags: TileTag[]) {}
	canPlace({ world, pos }: StrategyProps<{}>): boolean {
		return this.tags.some((t) => tileHasTag(decodeTile(world.tile(pos)!).typeIndex, t));
	}
	defaultState() {
		return {};
	}
}
export class FeatureWhitelistStrategy implements IBuildingStrategy {
	id = "featureWhitelist";
	constructor(private tags: Feature[]) {}
	canPlace({ world, pos }: StrategyProps<{}>): boolean {
		return this.tags.includes(features[decodeTile(world.tile(pos)!).featureIndex]);
	}
	defaultState() {
		return {};
	}
}
