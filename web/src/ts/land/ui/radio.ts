import { Component, CMouseEvent } from "./types";
import { clickHandler } from "./uiLogic";

type RadioGroup = {
	entries: { component: Component; onSelected: (ev: CMouseEvent) => void; onDeselected: () => void }[];
	selectedIndex: number;
};

const radioGroups: Record<string, RadioGroup> = {};


export function addRadioButton(
	component: Component,
	group: string,
	onSelected: (ev: CMouseEvent) => void,
	onDeselected: () => void,
) {
	if (!radioGroups[group]) radioGroups[group] = { entries: [], selectedIndex: -1 };
	const g = radioGroups[group];
	const index = g.entries.push({ component, onSelected, onDeselected }) - 1;
	handler(g, index);
}

export function createRadioGroup(name: string, g: RadioGroup) {
    if (radioGroups[name]) throw Error('exists');
    radioGroups[name] = g;
    for (let i = 0; i < g.entries.length; i++) {
        handler(g, i)
    }
}

function handler(g: RadioGroup, i: number) {
    clickHandler(g.entries[i].component, "left", (ev) => {
		if (g.selectedIndex === i) return;
		if (g.selectedIndex !== -1) g.entries[g.selectedIndex].onDeselected();
		g.selectedIndex = i;
		g.entries[i].onSelected(ev);
	});
}
