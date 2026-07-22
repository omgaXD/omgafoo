import { $str } from "../pos";
import { StringVec2, TilePos } from "../types/core";
import { ISaveable, IWorld, IWorldDataService, JSONValue } from "./types";

export class WorldDataService implements IWorldDataService, ISaveable<[StringVec2, Record<string, JSONValue>][]> {
	private _data: Map<StringVec2, Record<string, JSONValue>> = new Map();
	constructor(private world: IWorld) {}
	save(): [StringVec2, Record<string, JSONValue>][] {
		return [...this._data.entries()];
	}
	load(data: [StringVec2, Record<string, JSONValue>][] | undefined): void {
		if (data !== undefined) {
			this._data = new Map(data);
		}
	}
	getData<T extends JSONValue>(pos: TilePos, key: string): T | undefined {
		if (!this._data.has($str(pos))) this._data.set($str(pos), {});
		return this._data.get($str(pos))![key] as T | undefined;
	}
	setData<T extends JSONValue>(pos: TilePos, key: string, value: T): void {
        if (!this._data.has($str(pos))) this._data.set($str(pos), {});
		this._data.get($str(pos))![key] = value;
	}
	data<T extends JSONValue>(pos: TilePos, key: string): { get: () => T | undefined; set: (t: T) => void } {
		return {
			get: () => this.getData(pos, key),
			set: (t: T) => this.setData(pos, key, t),
		};
	}
}