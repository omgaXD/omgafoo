import { CanvasCameraInfo } from "../coreTypes";
import { tile2canvas } from "../pos";
import { TileType, tileTypes } from "../tile";
import { ChunkGen } from "../world/types";


export function drawTiles(chunks: () => ChunkGen, ctx:CanvasRenderingContext2D, info: CanvasCameraInfo) {
	const tileTypeCounts = new Array({ length: tileTypes.length }).map((_) => 0);
	for (const [, chunk] of chunks()) {
		if (chunk === undefined) continue;
		chunk.tileTypeCounts.forEach((c, i) => (tileTypeCounts[i] += c));
	}
	const mostCommon = tileTypeCounts
		.map((c, i) => [c, i] as [number, number])
		.reduce((prev, cur) => {
			return cur[0] > prev[0] ? cur : prev;
		})[1];
	ctx.fillStyle = determineTileColor(tileTypes[mostCommon]);
	ctx.fillRect(0, 0, info.canvasWidth, info.canvasHeight);

	tileTypes.forEach((tt, i) => {
		if (i === mostCommon) return;
		ctx.fillStyle = determineTileColor(tt);
		ctx.beginPath();
		for (const [, chunk] of chunks()) {
			if (chunk === undefined) continue;
			chunk.perimeters[i].forEach((arr) => {
				if (arr.length === 0) throw "whaat.";
				const p = tile2canvas(arr[0], info);
				ctx.moveTo(Math.round(p.x), Math.round(p.y));
				arr.forEach((p, i) => {
					if (i === 0) return;
					const p2 = tile2canvas(p, info);
					ctx.lineTo(Math.round(p2.x), Math.round(p2.y));
				});
			});
		}
		ctx.fill();
	});
}

function determineTileColor(t: TileType): string {
	switch (t.name) {
		case "grass":
			return "#44aa33";
		case "grass_alt":
			return "#33aa22";
		case "sand":
			return "#ddaa66";
		case "water":
			return "#aabbff";
		case "deep_water":
			return "#6699ff";
	}
}
