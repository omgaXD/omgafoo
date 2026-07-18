import { addComponent } from ".";
import { createBoundRadioGroup } from "./radio";
import { ButtonComponent } from "./types";
import { uiPos } from "./uiPos";

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

	const buildingIndex = {
		selectedIndex: 0,
	};
	createBoundRadioGroup("feature", buildingIndex, [noBuilding, waterWheel]);

    return buildingIndex;
}