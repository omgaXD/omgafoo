export interface ModelRepr<M> {
	represent(model: M, identifyMovableNode: (el: HTMLElement, uniqueId: number | string) => void): HTMLElement;
}

export function drawGrid(cols: number): HTMLElement {
	const element = document.createElement("div");
	element.style.display = "grid";
	element.style.gridTemplateColumns = `repeat(${cols},1fr)`;
	element.style.gap = "10px";

	return element;
}

export type Color = {
	bg: string;
	fg: string;
};

export function drawSquare(
	content: string,
	color: Color,
	colSpan: number = 1,
	rowSpan: number = 1,
	x: number | undefined = undefined,
	y: number | undefined = undefined,
): HTMLElement {
	const element = document.createElement("div");
	const { bg, fg } = color;
	element.style.display = "flex";
	element.style.backgroundColor = bg;
	element.style.color = fg;
	element.style.width = "100%";
	element.style.aspectRatio = `${colSpan / rowSpan}`;
	if (x !== undefined) element.style.gridColumnStart = (x + 1).toString();
	if (y !== undefined) element.style.gridRowStart = (y + 1).toString();
	element.style.gridColumnEnd = `span ${colSpan}`;
	element.style.gridRowEnd = `span ${rowSpan}`;
	element.style.borderRadius = "10px";
	element.style.fontSize = "40px";
	const p = document.createElement("p")!;
	p.style.margin = "auto";
	p.textContent = `${content}`;
	element.append(p);
	return element;
}

export function drawEmptySquare(
	colSpan: number = 1,
	rowSpan: number = 1,
	x: number | undefined = undefined,
	y: number | undefined = undefined,
) {
	const element = document.createElement("div");
	element.style.width = "100%";
	element.style.aspectRatio = `${colSpan / rowSpan}`;
	if (x) element.style.gridColumnStart = (x + 1).toString();
	if (y) element.style.gridRowStart = (y + 1).toString();
	element.style.gridColumnEnd = `span ${colSpan}`;
	element.style.gridRowEnd = `span ${rowSpan}`;
	element.classList.add("round", "rect");
	return element;
}

/**
 *
 * @returns tuple with background and text color
 */
export function getColorFromIndex(index: number): Color {
	return (
		[
			{ bg: "red", fg: "black" },
			{ bg: "orange", fg: "black" },
			{ bg: "white", fg: "black" },
			{ bg: "yellow", fg: "black" },
			{ bg: "lime", fg: "black" },
			{ bg: "blue", fg: "white" },
		] satisfies Color[]
	)[index % 6];
}

export function drawRadioGroup<T>(
	groupName: string,
	options: { value: T; name: string }[],
	choice: (value: T) => void,
): HTMLElement[] {
	const elements: HTMLElement[] = [];
	for (const { value, name } of options) {
		const label = document.createElement("label");
		label.textContent = name;
		label.classList.add("rect", "hover-highlight", "checked-highlight", "padded", "w-full");

		const input = document.createElement("input");
		input.type = "radio";
		input.name = groupName;
		input.classList.add("sr-only");
		label.appendChild(input);

		input.addEventListener("change", () => {
			choice(value);
		});

		elements.push(label);
	}

	return elements;
}
