export function lerp(a: number, b: number, lambda: number) {
    return b * lambda + a * (1-lambda);
}