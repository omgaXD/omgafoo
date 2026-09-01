import { FiniteTransformationMapper } from "./parse";

export interface ModelRepr<M> {
	represent(model: M, identifyMovableNode: (el: HTMLElement, uniqueId: number | string) => void): HTMLElement;
}

export function drawGrid(cols: number): HTMLElement {
	const element = document.createElement("div");
	element.style.display = "grid";
	element.style.gridTemplateColumns = `repeat(${cols},1fr)`;
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
	element.style.aspectRatio = `${colSpan / rowSpan}`;
	if (x !== undefined) element.style.gridColumnStart = (x + 1).toString();
	if (y !== undefined) element.style.gridRowStart = (y + 1).toString();
	element.style.gridColumnEnd = `span ${colSpan}`;
	element.style.gridRowEnd = `span ${rowSpan}`;
	element.style.borderRadius = "10px";
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
			{ bg: "#ff2211", fg: "black" },
			{ bg: "#ff8811", fg: "black" },
			{ bg: "#ffffee", fg: "black" },
			{ bg: "#fff811", fg: "black" },
			{ bg: "#44ff11", fg: "black" },
			{ bg: "#1122ff", fg: "white" },
		] satisfies Color[]
	)[index % 6];
}

export function drawRadioGroup<T>(
	groupName: string,
	options: { value: T; name: string }[],
	choice: (value: T) => void,
	remember: boolean = false,
): HTMLElement[] {
	const elements: HTMLElement[] = [];
	const memory = localStorage.getItem(`radioGroup-${groupName}-memory`);

	options.forEach(({ value, name }, i) => {
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
			if (remember) {
				localStorage.setItem(`radioGroup-${groupName}-memory`, i.toString());
			}
		});

		if (memory !== null && parseInt(memory) === i) {
			input.checked = true;
			choice(value);
		}

		elements.push(label);
	});

	return elements;
}

export function drawMapper<T extends number>(mapper: FiniteTransformationMapper<T> | null, appendToTextarea?: (token: string) => void): HTMLElement {
	const element = document.createElement("div");
	if (mapper === null) return element;
	const separator = mapper.tokenSeparator();
	const separatorStr = separator === "" ? "None" : `"${separator}"`;
	element.innerHTML = /*html*/ `
		Separator: ${separatorStr}<br />
		Valid tokens: <div class="valid-tokens mt-1 flex gap-3"></div>
	`;
	element.querySelector(".valid-tokens")!.append(
		...(mapper.getValidTokens() as string[]).map((t, i) => {
			const b = document.createElement("button");
			b.textContent = t;
			b.classList.add("text-4xl", "p-0.5", "font-mono", "cursor-pointer");
			const color = getColorFromIndex(i);
			b.style.color = color.bg;
			b.style.backgroundColor = color.fg;
			b.style.borderRadius = "9999px";
			b.addEventListener('click', () => appendToTextarea?.(t + mapper.tokenSeparator()));
			return b;
		}),
	);
	return element;
}

export function setupCanvas(canvas: HTMLCanvasElement, fitTo: HTMLElement): () => void {
	function resize() {
		const { width, height } = fitTo.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
	}
	resize();
	return resize;
}
