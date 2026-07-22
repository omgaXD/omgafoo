import { SortedList } from "../helpers";
import { eventAppliesTo } from "./mouseEvent";
import { CMouseEvent, CMouseEventType, Component, ComponentDrawInfo } from "../types/ui";

export const components = new SortedList<Component>((a, b) => a.z - b.z);

export function addComponent<D extends ComponentDrawInfo>(component: Component<D>) {
	components.insert(component);
	return component;
}

export function fireEvent<const T extends CMouseEventType>(ev: CMouseEvent & { type: T }) {
	for (const c of components.desc()) {
		if (!c.handlers) continue;
		if (!c.handlers[ev.type]) continue;
		if (!eventAppliesTo(ev, c)) continue;
		c.handlers[ev.type]!.forEach((h) => {
			h(ev);
		});
		if (ev.cancelled) break;
	}
}
