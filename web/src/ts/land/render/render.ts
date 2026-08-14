import { interpolate } from "../camera";
import { CanvasCameraInfo } from "../coreTypes";
import { getVisibleChunkPoses } from "../pos";
import { State } from "../state";
import { components } from "../ui/ui";
import { drawBuildings } from "./building";
import { drawFeatures } from "./feature";
import { DisplayedPreviewInstruction, drawPreviewInstructions } from "./previewInstruction";
import { drawPreview } from "./preview";
import { drawTiles } from "./tile";
import { drawComponent, drawFps } from "./ui";

export class Renderer {
	private previewInstructions = new Map<string, DisplayedPreviewInstruction>();
	private canvasCameraInfo;
	constructor(
		private state: State,
		private canvas: HTMLCanvasElement,
		private ctx: CanvasRenderingContext2D,
	) {
		this.canvasCameraInfo = {
			cameraPos: { ...this.state.camera.pos },
			cameraScale: this.state.camera.scale,
			canvasHeight: this.canvas.height,
			canvasWidth: this.canvas.width,
			frame: 0,
		};
	}

	syncPreviewInstructions() {
		const frame = this.canvasCameraInfo.frame;
		const toRemove = new Set(this.previewInstructions.keys());
		for (const { id, ins } of this.state.preview?.instructions ?? []) {
			if (this.previewInstructions.has(id)) {
				toRemove.delete(id);
				continue;
			}
			this.previewInstructions.set(id, { addedAtFrame: frame, removedAtFrame: null, ...ins });
		}
		toRemove.forEach((k) => {
			const obj = this.previewInstructions.get(k)! 
			if (obj.removedAtFrame === null)
				obj.removedAtFrame = frame;
			else if (frame - obj.removedAtFrame! > 120) this.previewInstructions.delete(k);
		});
	}

	startRenderLoop() {
		function loop(r: Renderer) {
			r.syncPreviewInstructions();
			interpolate(r.state.camera, r.state.logicCamera);
			r.render();
			requestAnimationFrame(() => loop(r));
		}
		loop(this);
	}

	getCanvasCameraInfo(): CanvasCameraInfo {
		return this.canvasCameraInfo;
	}

	private updateCanvasCameraInfo() {
		this.canvasCameraInfo.cameraPos = this.state.camera.pos;
		this.canvasCameraInfo.cameraScale = this.state.camera.scale;
		this.canvasCameraInfo.canvasHeight = this.canvas.height;
		this.canvasCameraInfo.canvasWidth = this.canvas.width;
	}

	private render() {
		this.updateCanvasCameraInfo();
		const [from, to] = getVisibleChunkPoses(this.canvasCameraInfo, 2);
		drawTiles(() => this.state.world.chunkGen(from, to), this.ctx, this.canvasCameraInfo);

		drawFeatures(this.state.world.chunkGen(from, to), this.ctx, this.canvasCameraInfo);

		drawBuildings(this.state.world, this.ctx, this.canvasCameraInfo); // todo occuling

		drawPreviewInstructions(this.previewInstructions.values(), this.ctx, this.canvasCameraInfo);

		if (this.state.preview !== null)
			drawPreview(
				this.state.preview.building,
				this.previewInstructions.values(),
				this.ctx,
				this.canvasCameraInfo,
			);

		for (const c of components.asc()) {
			drawComponent(c, this.ctx);
		}

		drawFps(this.state.tick, this.ctx);
		this.canvasCameraInfo.frame++;
	}
}
