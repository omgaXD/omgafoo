import { Component, CMouseEvent } from "./types";
import { clickHandler } from "./uiLogic";

type RadioGroup = {
	entries: { component: Component; onSelected?: (ev: CMouseEvent | null) => void; onDeselected?: () => void }[];
	selectedIndex: number;
};

const radioGroups: Record<string, RadioGroup> = {};

export function addRadioButton(
	component: Component,
	group: string,
	onSelected: (ev: CMouseEvent | null) => void,
	onDeselected: () => void,
) {
	if (!radioGroups[group]) radioGroups[group] = { entries: [], selectedIndex: -1 };
	const g = radioGroups[group];
	const index = g.entries.push({ component, onSelected, onDeselected }) - 1;
	handler(g, index);
}

export function createRadioGroup(name: string, g: RadioGroup) {
	if (radioGroups[name]) throw Error("exists");
	radioGroups[name] = g;
	for (let i = 0; i < g.entries.length; i++) {
		handler(g, i);
	}
	if (g.selectedIndex !== -1 && di(g, g.selectedIndex).selectable) {
		di(g, g.selectedIndex).isSelected = true;
	}
}

export function createBoundRadioGroup(name: string, value: { selectedIndex: number }, components: Component[]) {
	(value as { selectedIndex: number, value: undefined }).value = undefined;
	createBoundRadioGroupWithValues<undefined>(
		name,
		value as { selectedIndex: number; value: undefined },
		components.map((c) => [c, undefined]),
	);
}


export function createBoundRadioGroupWithValues<T>(name: string, value: { selectedIndex: number, value: T | null }, componentsValues: [Component, T][]) {
	createRadioGroup(name, {
		selectedIndex: value.selectedIndex,
		entries: componentsValues.map(([c, v], i) => {
			return {
				component: c,
				onSelected() {
					value.selectedIndex = i;
					value.value = v;
				},
			};
		}),
	});
	Object.defineProperty(value, "selectedIndex", {
		set(v) {
			if (value.selectedIndex !== v) select(radioGroups[name], v);
		},
		get() {
			return radioGroups[name].selectedIndex;
		},
	});
}


function di(g: RadioGroup, i: number) {
	return g.entries[i].component.drawInfo;
}

function handler(g: RadioGroup, i: number) {
	clickHandler(g.entries[i].component, "left", (ev) => {
		select(g, i, ev);
	});
}

function select(g: RadioGroup, i: number, ev: CMouseEvent | null = null) {
	if (g.selectedIndex === i) return;
	if (g.selectedIndex !== -1) {
		g.entries[g.selectedIndex].onDeselected?.();
		if (di(g, g.selectedIndex).selectable) di(g, g.selectedIndex).isSelected = false;
	}
	g.selectedIndex = i;
	if (di(g, i).selectable) {
		di(g, i).isSelected = true;
	}
	g.entries[i].onSelected?.(ev);
}
