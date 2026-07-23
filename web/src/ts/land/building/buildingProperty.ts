import { IWorld, JSONValue } from "../world/types";
import { TilePos } from "../types/core";
import { IBuildingStrategy } from "./types";

export function property<T extends JSONValue>(
	strategy: IBuildingStrategy,
	key: string,
): (world: IWorld, pos: TilePos, value?: T) => T | undefined {
	const fullKey = strategy.id + "--" + key;
	return (world, pos, value) => {
		if (value !== undefined) {
			world.dataService.setData(pos, fullKey, value);
			return value;
		}
		return world.dataService.getData<T>(pos, fullKey);
	};
}
export function propertyWithDefault<T extends JSONValue>(
	strategy: IBuildingStrategy,
	key: string,
	defaultValue: T,
): (world: IWorld, pos: TilePos, value?: T | undefined) => T {
	const fullKey = strategy.id + "--" + key;
	return (world, pos, value) => {
		if (value !== undefined) {
			world.dataService.setData(pos, fullKey, value);
			return value;
		}
		const data = world.dataService.getData<T>(pos, fullKey);
		if (data !== undefined) {
			return data;
		}
		world.dataService.setData(pos, fullKey, defaultValue);
		return defaultValue;
	};
}
