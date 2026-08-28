import { brieflyHighlightBorder, FieldHTML, highlightTilesAt, renderField } from "./dom";
import { createField, defaultRules, doMove } from "./game";
import { parseMove } from "./move";

const field = createField(defaultRules());
const fieldHTML: FieldHTML = {
	fieldEl: document.getElementById("field")!,
	p1score: document.getElementById("p1-score")!,
	p2score: document.getElementById("p2-score")!,
	turnOf: document.getElementById("turn-of")!,
};
renderField(field, fieldHTML);

const input = document.getElementById("input") as HTMLInputElement;
input.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		const command = input.value.trim().toLowerCase();

		const result = parseMove(field, command, true);
		if (result.valid) {
			doMove(result);
			renderField(field, fieldHTML);
			input.placeholder = command;
		} else {
			console.log(result.reason);
			shakeInput();
		}
		input.value = "";
		highlightTilesAt(fieldHTML, null);
	}
});
input.addEventListener("input", () => {
	const command = input.value.trim().toLowerCase();

	const result = parseMove(field, command, true);
	console.log(result);
	if ('coords' in result) {
		highlightTilesAt(fieldHTML, result.coords.map((el) => [el, result.valid ? 'success' : result.reason === 'cant-move-this' ? 'danger' : 'warning']))
	} else {
		highlightTilesAt(fieldHTML, []);
	}
	if (result.valid === false) {
		switch (result.reason) {
			case "overflow-u": brieflyHighlightBorder(fieldHTML, 'u'); break;
			case "overflow-d":brieflyHighlightBorder(fieldHTML, 'd'); break;
			case "overflow-l":brieflyHighlightBorder(fieldHTML, 'l'); break;
			case "overflow-r":brieflyHighlightBorder(fieldHTML, 'r'); break;
			case "cant-move-this":
		}
	}
});
input.focus();

function shakeInput() {
	input.animate(
		[
			{ transform: "translateX(0)" },
			{ transform: "translateX(-10px)" },
			{ transform: "translateX(10px)" },
			{ transform: "translateX(-10px)" },
			{ transform: "translateX(10px)" },
			{ transform: "translateX(0)" },
		],
		{
			duration: 100,
			easing: "ease-in-out",
		},
	);
}
