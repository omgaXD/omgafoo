import { calculateDifference, drawDifferenceOnCanvas } from "./compare";
import { controllers, ModelController } from "./controller";
import { drawMapper, drawRadioGroup, setupCanvas } from "./dom";
import { applyFLIP } from "./flip";
import { parseTransformation } from "./parse";
import { markSnapshotable, takeVisSnapshot } from "./snapshot";

const visualization = document.getElementById("visualization")!;
const seqEl = document.getElementById("sequence") as HTMLTextAreaElement;
const selectedGroupSummary = document.getElementById("selected-group")!;
const groupsList = document.getElementById("groups")!;

const compareVis = document.getElementById("visualization-compare")!;
const compareCanvas = document.getElementById("compare-canvas") as HTMLCanvasElement;
const compareCtx = compareCanvas.getContext("2d")!;
const compareCheckbox = document.getElementById("do-compare") as HTMLInputElement;
const compareSeqEl = document.getElementById("sequence-compare") as HTMLTextAreaElement;

const resizeCanvas = setupCanvas(compareCanvas, visualization);
function main() {
	let cleanup: null | (() => void) = null;

	groupsList.append(
		...drawRadioGroup<keyof typeof controllers>(
			"controllers",
			Object.entries(controllers).map(([k, v]) => ({
				name: v.name,
				value: k as keyof typeof controllers,
			})),
			(v) => {
				cleanup?.();
				cleanup = play(v);
			},
			true,
		),
	);
}

main();

function visualize<M, T extends number>({ modelDef, repr, mapper }: ModelController<M, T>): () => void {
	function rerender() {
		// re-parse transformation
		const result = parseTransformation(mapper, seqEl.value);
		if (result.success) {
			// re-render visualization with FLIP
			const visSnapshot = takeVisSnapshot(visualization);
			visualization.innerHTML = "";
			visualization.appendChild(
				repr.represent(
					modelDef.applyTransformation(modelDef.baseModel(), result.transformation),
					markSnapshotable,
				),
			);
			const newSnapshot = takeVisSnapshot(visualization);
			if (compareCheckbox.checked === false) {
				compareCtx.clearRect(0, 0, compareCanvas.width, compareCanvas.height);
			} else {
				const other = parseTransformation(mapper, compareSeqEl.value);

				if (other.success) {
					compareVis.innerHTML = "";
					compareVis.appendChild(
						repr.represent(
							modelDef.applyTransformation(modelDef.baseModel(), other.transformation),
							markSnapshotable,
						),
					);
					const otherSnapshot = takeVisSnapshot(compareVis);
					resizeCanvas();
					drawDifferenceOnCanvas(compareCanvas, compareCtx, calculateDifference(otherSnapshot, newSnapshot));
				} else {
					console.error(other.errors.map((e) => e[1]).join("\n"));
				}
			}

			applyFLIP(visualization, visSnapshot);
		} else {
			console.error(result.errors.map((e) => e[1]).join("\n"));
		}
	}
	rerender();

	seqEl.addEventListener("input", rerender);
	compareSeqEl.addEventListener("input", rerender);
	compareCheckbox.addEventListener("input", rerender);
	return () => seqEl.removeEventListener("input", rerender);
}

function play(key: keyof typeof controllers) {
	switch (key) {
		case "simple":
			return playConcrete(controllers[key]);

		case "rubik2":
			return playConcrete(controllers[key]);

		case "rubik3":
			return playConcrete(controllers[key]);
	}
}

function playConcrete<M, T extends number>(controller: ModelController<M, T>) {
	document.getElementById("selected-group-container")!.classList.remove("hidden");
	selectedGroupSummary.innerHTML = "";
	selectedGroupSummary.appendChild(drawMapper<T>(controller.mapper));
	return visualize(controller);
}
