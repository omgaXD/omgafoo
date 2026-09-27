import { toLetterCoord } from "./letterCoords";
import { Field, MoveDir, Tile, Vec2 } from "./types";

export type FieldHTML = {
	p1score: HTMLElement;
	p2score: HTMLElement;

	turnOf: HTMLElement;

	fieldEl: HTMLElement;
};

export function createTileSpan(tile: Tile, pos: Vec2): HTMLSpanElement {
	const span = document.createElement("span");
	switch (tile.type) {
		case "player":
			const playerIcon = document.createElement("i");
			span.appendChild(playerIcon);
			playerIcon.classList.add("lar");
			if (tile.moveCount === 1) {
				playerIcon.classList.add("la-circle");
			} else {
				playerIcon.classList.add("la-dot-circle");
			}
			if (tile.side === "p1") {
				span.classList.add("text-blue-500");
			} else {
				span.classList.add("text-red-500");
			}
			break;
		case "neutral":
			span.textContent = "#";
			span.classList.add("text-stone-500");
			break;
		case "empty":
			span.textContent = "⋅";
			if (tile.collectedBy === "p1") {
				span.classList.add("text-blue-800");
			} else if (tile.collectedBy === "p2") {
				span.classList.add("text-red-900");
			} else {
				span.classList.add("text-stone-700");
			}
			break;
	}
	span.dataset.x = pos.x.toString();
	span.dataset.y = pos.y.toString();
	return span;
}

export function renderField(field: Field, { p1score, p2score, turnOf, fieldEl }: FieldHTML) {
	fieldEl.style.gridTemplateColumns = `repeat(${field.tiles[0].length + 1},1fr)`;
	fieldEl.style.border = "transparent 1px solid";
	p1score.textContent = field.players.p1.collected.toString();
	p2score.textContent = field.players.p2.collected.toString();
	if (field.players.p1.collected > field.players.p2.collected) {
		p1score.classList.add("text-4xl");
		p2score.classList.remove("text-4xl");
	} else if (field.players.p2.collected > field.players.p1.collected) {
		p2score.classList.add("text-4xl");
		p1score.classList.remove("text-4xl");
	} else {
		p1score.classList.remove("text-4xl");
		p2score.classList.remove("text-4xl");
	}
	if (field.state === "playing") {
		if (field.turnOf === "p1") {
			turnOf.textContent = "Player 1's turn";
			turnOf.classList.add("text-blue-500");
			turnOf.classList.remove("text-red-500");
		} else {
			turnOf.textContent = "Player 2's turn";
			turnOf.classList.add("text-red-500");
			turnOf.classList.remove("text-blue-500");
		}
	} else if (field.state === "p1-won") {
		turnOf.textContent = "Player 1 wins!";
		turnOf.classList.add("text-green-500");
		turnOf.classList.remove("text-blue-500");
		turnOf.classList.remove("text-red-500");
	} else if (field.state === "p2-won") {
		turnOf.textContent = "Player 2 wins!";
		turnOf.classList.add("text-green-500");
		turnOf.classList.remove("text-blue-500");
		turnOf.classList.remove("text-red-500");
	} else if (field.state === "tie") {
		turnOf.textContent = "It's a tie!";
		turnOf.classList.add("text-green-500");
		turnOf.classList.remove("text-blue-500");
		turnOf.classList.remove("text-red-500");
	}

	fieldEl.innerHTML = "";
	fieldEl.appendChild(document.createElement("span")); // Empty top-left corner
	field.tiles[0].forEach((_, i) => {
		const colHeader = document.createElement("span");
		colHeader.textContent = (i + 1).toString();
		fieldEl.appendChild(colHeader);
	});
	field.tiles.forEach((row, rowIndex) => {
		const rowHeader = document.createElement("span");
		rowHeader.textContent = toLetterCoord(rowIndex);
		fieldEl.appendChild(rowHeader);
		row.forEach((tile, colIndex) => {
			fieldEl.appendChild(createTileSpan(tile, { x: colIndex, y: rowIndex }));
		});
	});
}
export function highlightTilesAt({ fieldEl }: FieldHTML, vecs: [Vec2, "success" | "warning" | "danger"][] | null) {
	for (let i = 0; i < fieldEl.children.length; i++) {
		(fieldEl.children[i] as HTMLElement).classList.remove("text-yellow-300!", "text-green-500!", "text-orange-500!");
	}
	if (vecs) {
		vecs.forEach(([{ x, y }, kind]) => {
			const tileEl = fieldEl.querySelector(`[data-x="${x}"][data-y="${y}"]`)!;
			switch (kind) {
				case "success":
					tileEl.classList.add("text-green-500!");
					break;
				case "warning":
					tileEl.classList.add("text-yellow-300!");
					break;
				case "danger":
					tileEl.classList.add("text-orange-500!");
					break;
			}
		});
	}
}

export function brieflyHighlightBorder({ fieldEl }: FieldHTML, direction: MoveDir) {
	switch (direction) {
		case "u":
			return animateBorder(fieldEl, 'borderUpColor');
		case "d":
			return animateBorder(fieldEl, "borderDownColor");
		case "l":
			return animateBorder(fieldEl, "borderLeftColor");
		case "r":
			return animateBorder(fieldEl, "borderRightColor");
			
	}
}

function animateBorder(fieldEl: HTMLElement, property: string) {
	fieldEl.animate([{ [property]: "#ff0000ff" }, { [property]: "#00000000" }], {duration: 500});
}