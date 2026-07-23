import { splitCircle } from "../helpers";
import { Icon, StaticIcon, staticIcons } from "./icon";

const ICON_WIDTH = 256;
const ICON_HEIGHT = 256;
const bakedIcons = bakeIcons();
export function drawIcon(
	icon: Icon,
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
    frame: number
) {
	if (bakedIcons[icon as StaticIcon] !== undefined) ctx.drawImage(bakedIcons[icon as StaticIcon], x, y, w, h);
	else _drawIcon(icon, ctx, x, y, w, h, frame)
}

function bakeIcons(): Record<StaticIcon, ImageBitmap> {
	return Object.fromEntries(
		staticIcons.map((i) => {
			const canvas = new OffscreenCanvas(ICON_WIDTH, ICON_HEIGHT);
			const ctx = canvas.getContext("2d")!;
			bakeStaticIcon(i, ctx);
			return [i, canvas.transferToImageBitmap()];
		}),
	) as Record<StaticIcon, ImageBitmap>;
}
function bakeStaticIcon(icon: StaticIcon, ctx: OffscreenCanvasRenderingContext2D) {
	_drawIcon(icon, ctx, 0, 0, ICON_WIDTH, ICON_HEIGHT);
}

function _drawIcon(icon: Icon, ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number = 0) {
    switch (icon) {
		case "palm":
			ctx.fillStyle = "brown";
			ctx.fillRect(w * 0.4, h * 0.6, w * 0.2, h * 0.2);
			ctx.fillStyle = "lime";
			ctx.beginPath();
			ctx.moveTo(w * 0.7, h * 0.3);
			ctx.lineTo(w * 0.6, h * 0.5);
			ctx.lineTo(w * 0.8, h * 0.6);
			ctx.lineTo(w * 0.2, h * 0.6);
			ctx.lineTo(w * 0.4, h * 0.5);
			ctx.lineTo(w * 0.3, h * 0.3);
			ctx.lineTo(w * 0.5, h * 0.4);
			ctx.fill();
			break;
		case "tree-1":
		case "tree-2":
			const treeOffset = icon[5] === "1" ? 0 : 0.1;
			ctx.fillStyle = "brown";
			ctx.fillRect(w * 0.4, h * (0.6 + treeOffset), w * 0.2, h * 0.2);
			ctx.fillStyle = "green";
			ctx.fillRect(w * (0.3 + treeOffset / 2), h * 0.2, w * (0.4 - treeOffset), h * (0.4 + treeOffset));
			break;
		case "stone-1":
		case "stone-2":
		case "sandstone-1":
		case "sandstone-2":
		case "waterstone-1":
		case "waterstone-2":
			if (icon.startsWith("stone-")) ctx.fillStyle = "#88aaaa";
			if (icon.startsWith("sandstone-")) ctx.fillStyle = "#aa8833";
			if (icon.startsWith("waterstone-")) ctx.fillStyle = "#4444bb11";
			ctx.beginPath();
			const stoneOffset = icon[6] === "1" ? 0.1 : -0.1;
			ctx.moveTo(w * (0.5 + stoneOffset), h * 0.3);
			ctx.lineTo(w * 0.8, h * 0.5);
			ctx.lineTo(w * 0.7, h * 0.8);
			ctx.lineTo(w * 0.3, h * 0.8);
			ctx.lineTo(w * 0.2, h * 0.5);
			ctx.fill();
			if (!icon.startsWith("waterstone")) {
				ctx.fillStyle = "#ffffff22";
				ctx.beginPath();
				ctx.moveTo(w * (0.5 + stoneOffset), h * 0.3);
				ctx.lineTo(w * 0.3, h * 0.8);
				ctx.lineTo(w * 0.2, h * 0.5);
				ctx.fill();
			}
			break;
		case "x":
			ctx.fillStyle = "black";
			ctx.beginPath();
			ctx.moveTo(w * 0.2, h * 0.2);
			ctx.lineTo(w * 0.3, h * 0.2);
			ctx.lineTo(w * 0.5, h * 0.4);
			ctx.lineTo(w * 0.7, h * 0.2);
			ctx.lineTo(w * 0.8, h * 0.2);
			ctx.lineTo(w * 0.8, h * 0.3);
			ctx.lineTo(w * 0.6, h * 0.5);
			ctx.lineTo(w * 0.8, h * 0.7);
			ctx.lineTo(w * 0.8, h * 0.8);
			ctx.lineTo(w * 0.7, h * 0.8);
			ctx.lineTo(w * 0.5, h * 0.6);
			ctx.lineTo(w * 0.3, h * 0.8);
			ctx.lineTo(w * 0.2, h * 0.8);
			ctx.lineTo(w * 0.2, h * 0.7);
			ctx.lineTo(w * 0.4, h * 0.5);
			ctx.lineTo(w * 0.2, h * 0.3);
			ctx.fill();
			break;
		case "waterWheel":
			{
				ctx.fillStyle = "brown";
				ctx.beginPath();
				const [oX, oY] = [w * 0.5, h * 0.75];
				const wMod = 0.4,
					hMod = 0.1;

				const splits = splitCircle(6);
				ctx.moveTo(oX + w * wMod * splits[0].x, oY + h * hMod * splits[0].y);
				splits.forEach((i) => {
					ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y);
					ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y - h * 0.2);
					ctx.lineTo(oX, oY - h * 0.1);
					ctx.lineTo(oX, oY);
				});

				ctx.fill();
			}
			break;
		case "rockCutter":
			{
				ctx.fillStyle = "gray";
				ctx.beginPath();
				const [oX, oY] = [w * 0.5, h * 0.75];
				const wMod = 0.4,
					hMod = 0.1;

				const splits = splitCircle(8, 360/2);
				ctx.moveTo(oX + w * wMod * splits[0].x, oY + h * hMod * splits[0].y);
				splits.forEach((i) => {
					ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y);
					ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y - h * 0.2);
					ctx.lineTo(oX, oY - h * 0.1);
					ctx.lineTo(oX, oY);
				});

				ctx.fill();
			}
			break;
		case "waterWheel-animated":
			ctx.fillStyle = "brown";
			ctx.beginPath();
			const angle = frame * 1;
			const [oX, oY] = [x + w * 0.5, y + h * 0.75];
			const wMod = 0.4,
				hMod = 0.1;

			const splits = splitCircle(6, angle);
			ctx.moveTo(oX + w * wMod * splits[0].x, oY + h * hMod * splits[0].y);
			splits.forEach((i) => {
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y);
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y - h * 0.2);
				ctx.lineTo(oX, oY - h * 0.1);
				ctx.lineTo(oX, oY);
			});

			ctx.fill();
			break;
		case "rockCutter-animated": {
			ctx.fillStyle = "gray";
			ctx.beginPath();
			const angle = frame * 2;
			const [oX, oY] = [x + w * 0.5, y + h * 0.75];
			const wMod = 0.4,
				hMod = 0.1;

			const splits = splitCircle(8, angle);
			ctx.moveTo(oX + w * wMod * splits[0].x, oY + h * hMod * splits[0].y);
			splits.forEach((i) => {
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y);
				ctx.lineTo(oX + w * wMod * i.x, oY + h * hMod * i.y - h * 0.2);
				ctx.lineTo(oX, oY - h * 0.1);
				ctx.lineTo(oX, oY);
			});

			ctx.fill();
			break;
		}
		case 'connector': break;
		case 'big-0': break;
		case "big-180": break;
		default:
			throw new Error("cant draw icon: " + icon);
	}
}

