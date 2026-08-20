import { controllers, ModelController } from "./controller";
import { drawMapper, drawRadioGroup } from "./dom";
import { applyFLIP, markFlip, snapshotFLIP } from "./flip";
import { parseTransformation } from "./parse";

function main() {
	let cleanup: null | (() => void) = null;

	document.getElementById("groups")!.append(
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
			true
		),
	);
}

main();

function visualize<M, T extends number>({ modelDef, repr, mapper }: ModelController<M, T>): () => void {
	const visualization = document.getElementById("visualization")!;
	
	const seqEl = document.getElementById("sequence")! as HTMLTextAreaElement;
	function rerender() {
		// re-parse transformation
		const result = parseTransformation(mapper, seqEl.value);
		if (result.success) {
			// re-render visualization
			const visSnapshot = snapshotFLIP(visualization);
			visualization.innerHTML = "";
			visualization.appendChild(
				repr.represent(modelDef.applyTransformation(modelDef.baseModel(), result.transformation), markFlip),
			);
			if (visSnapshot.length > 0) applyFLIP(visualization, visSnapshot);
		} else {
			console.error(result.errors.map((e) => e[1]).join("\n"));
		}
	}
	rerender();

	seqEl.addEventListener("input", rerender);
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
	document.getElementById('selected-group-container')!.classList.remove('hidden');
	const selGroup = document.getElementById('selected-group')!;
	selGroup.innerHTML = '';
	selGroup.appendChild(drawMapper<T>(controller.mapper));
	return visualize(controller);
}
