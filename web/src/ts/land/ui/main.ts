import { addComponent } from "./ui";
import { createBoundRadioGroup, createBoundRadioGroupWithValues } from "./radio";
import { ButtonComponent } from "./types";
import { uiPos } from "./uiPos";
import { BuildingKind } from "../building/building";

export function initMainScreen() {
	const noBuilding = addComponent<ButtonComponent>({
		bounds: uiPos({ type: "absolute", bottom: 10, left: 10, width: 100, height: 100 }),
		z: 1,
		drawInfo: { type: "button", icon: "x", pressable: true, selectable: true, isPressed: false, isSelected: false },
	});
	const waterWheel = addComponent<ButtonComponent>({
		bounds: uiPos({ type: "absolute", bottom: 10, left: 120, width: 100, height: 100 }),
		z: 1,
		drawInfo: {
			type: "button",
			icon: "waterWheel",
			pressable: true,
			selectable: true,
			isPressed: false,
			isSelected: false,
		},
	});
	const rockCutter = addComponent<ButtonComponent>({
		bounds: uiPos({ type: "absolute", bottom: 10, left: 230, width: 100, height: 100 }),
		z: 1,
		drawInfo: {
			type: "button",
			icon: "rockCutter",
			pressable: true,
			selectable: true,
			isPressed: false,
			isSelected: false,
		},
	});

	const buildingIndex = {
		selectedIndex: 0,
		value: null as BuildingKind | null
	};
	createBoundRadioGroupWithValues<BuildingKind | null>("feature", buildingIndex, [[noBuilding, null], [waterWheel, 'waterWheel'], [rockCutter, 'rockCutter']]);

	return buildingIndex;
}
