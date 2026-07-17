import { posWithin } from "./component";
import { CMouseEvent, Component } from "./types";

export function eventAppliesTo(ev: CMouseEvent, component: Component): boolean {
	switch (ev.type) {
		case "down":
		case "up":
			return posWithin(ev.pos, component);
		case "move":
			return posWithin(ev.pos, component) && posWithin(ev.oldPos, component);
		case "enter":
			return posWithin(ev.pos, component) && !posWithin(ev.oldPos, component);
		case "leave":
			return !posWithin(ev.pos, component) && posWithin(ev.oldPos, component);
		case "upElsewhere":
			return !posWithin(ev.pos, component);
	}
}


