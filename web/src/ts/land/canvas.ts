export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
export const ctx = canvas.getContext("2d", {alpha: false})!;

window.addEventListener("resize", resize);
resize();

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - canvas.getBoundingClientRect().top;
}