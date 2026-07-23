import { interpolate } from "../camera";
import { CanvasCameraInfo } from "../coreTypes";
import { getVisibleChunkPoses } from "../pos";
import { State } from "../state";
import { components } from "../ui/ui";
import { getHexagonBounds } from "./bounds";
import { drawBuildings } from "./building";
import { drawFeatures } from "./feature";
import { drawBuildingPreviews } from "./preview";
import { drawHexagon } from "./primitive";
import { drawTiles } from "./tile";
import { drawComponent, drawFps } from "./ui";

export class Renderer {
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

	startRenderLoop() {
		function loop(r: Renderer) {
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

		this.ctx.fillStyle = "#ffffff22";
		for (const tp of this.state.highlightedTiles.info) {
			drawHexagon(...getHexagonBounds(tp, this.canvasCameraInfo), this.ctx);
		}
		this.ctx.fillStyle = "#22ff2244";
		for (const tp of this.state.highlightedTiles.success) {
			drawHexagon(...getHexagonBounds(tp, this.canvasCameraInfo), this.ctx);
		}
		this.ctx.fillStyle = "#ff222222";
		for (const tp of this.state.highlightedTiles.danger) {
			drawHexagon(...getHexagonBounds(tp, this.canvasCameraInfo), this.ctx);
		}

		drawBuildingPreviews(this.state.previews, this.state.world, this.ctx, this.canvasCameraInfo);

		for (const c of components.asc()) {
			drawComponent(c, this.ctx);
		}

		drawFps(this.state.tick, this.ctx);
		this.canvasCameraInfo.frame++;
	}
}
