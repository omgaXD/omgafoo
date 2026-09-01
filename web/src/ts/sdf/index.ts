{
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d")!;
	function resize() {
		canvas.width = canvas.parentElement!.clientWidth;
		canvas.height = canvas.parentElement!.clientHeight;
	}
	resize();
	window.addEventListener("resize", resize);

	type DistanceObject = (x: number, y: number) => [number, number, number];

	let time = 0;
	function distToColorStripe(
		stripeWidth: number,
		inner1: [number, number, number],
		inner2: [number, number, number],
		outer1: [number, number, number],
		outer2: [number, number, number],
	) {
		return (dist: number) =>
			Math.floor((dist + time) / stripeWidth) % 2 === 0
				? dist > 0
					? inner1
					: outer2
				: dist > 0
					? inner2
					: outer1;
	}
	function distToBorder(borderWidth: number, fg: [number, number, number], bg: [number, number, number]) {
		return (dist: number) => (Math.abs(dist / 2) < borderWidth ? fg : bg);
	}

	function circle(centerX: number, centerY: number, radius: number): DistanceObject {
		return (x, y) => {
			const dist = Math.hypot(centerX - x, centerY - y);
			return [dist - radius, (centerX - x) / dist, (centerY - y) / dist];
		};
	}

	function identity(): DistanceObject {
		return () => [-Infinity, 0, 0];
	}

	function line(x1: number, y1: number, x2: number, y2: number): DistanceObject {
		const mag = Math.hypot(x2 - x1, y2 - y1);
		const nx = (x2 - x1) / mag;
		const ny = (y2 - y1) / mag;
		return (x, y) => [(x - x1) * ny - (y - y1) * nx, -ny, nx];
	}

	function _combine(obj1: DistanceObject, obj2: DistanceObject): DistanceObject {
		return (x, y) => {
			const r1 = obj1(x, y);
			const [d1, n1x, n1y] = r1;

			const r2 = obj2(x, y);
			const [d2, n2x, n2y] = r2;

			let scalar = n1x * n2x + n1y * n2y;

			const a = scalar * d2 - d1;
			const b = scalar * d1 - d2;

			if (a < 0 && b < 0) {
				const sinSq = 1 - scalar * scalar;
				if (sinSq > 1e-12) {
					const wx = a * n1x + b * n2x;
					const wy = a * n1y + b * n2y;
					const wlen = Math.sqrt(wx * wx + wy * wy);
					return [wlen / sinSq, -wx / wlen, -wy / wlen];
				}
			}
			return d1 > d2 ? r1 : r2;
		};
	}
	function combine(...obj: DistanceObject[]): DistanceObject {
		return obj.reduce((prev, cur) => _combine(prev, cur));
	}

	function render(obj: DistanceObject, distanceToColor: (dist: number) => [number, number, number]) {
		const w = canvas.width;
		const h = canvas.height;
		const imageData = ctx.createImageData(w, h);
		const data = imageData.data;
		const put = putter(data, w);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				put(x, y, distanceToColor(obj(x, y)[0]));
			}
		}
		ctx.putImageData(imageData, 0, 0);
	}

	function putter(data: ImageDataArray, w: number) {
		return (x: number, y: number, [r, g, b]: [number, number, number]) => {
			const idx = (y * w + x) * 4;
			data[idx] = r;
			data[idx + 1] = g;
			data[idx + 2] = b;
			data[idx + 3] = 255;
		};
	}

	type RegexParser = {
		regex: RegExp;
		match: (result: RegExpExecArray) => DistanceObject;
	};

	const lineParser: RegexParser = {
		regex: RegExp(/line\(([0-9]+),([0-9]+),([0-9]+),([0-9]+)\)/),
		match: (result) => line(+result[1], +result[2], +result[3], +result[4]),
	};
	const circleParser: RegexParser = {
		regex: RegExp(/circle\(([0-9]+),([0-9]+),([0-9]+)\)/),
		match: (result) => circle(+result[1], +result[2], +result[3]),
	};
	const sequenceEl = document.getElementById("sequence") as HTMLTextAreaElement;

	let objects: DistanceObject = identity();
	function react() {
		objects = sequenceEl.value
			.replace(/ /g, "")
			.split("\n")
			.map((s) => tryParse(lineParser, s) ?? tryParse(circleParser, s))
			.filter((x) => x !== null)
			.reduce(_combine, identity());
	}

	react();
	sequenceEl.addEventListener("input", react);

	function tryParse(parser: RegexParser, value: string): DistanceObject | null {
		const result = parser.regex.exec(value);
		if (result === null) return null;
		return parser.match(result);
	}

	function loop() {
		(render(objects, distToColorStripe(10, [255, 255, 128], [128, 128, 64], [128, 255, 255], [64, 128, 128])),
			requestAnimationFrame(loop));
		time++;
	}
	loop();
}
