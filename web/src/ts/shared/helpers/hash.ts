export type Hashed<T> = T & { hash: string };

// thanks https://stackoverflow.com/a/52171480
export function cyrb53<T>(obj: T, seed: number = 0): Hashed<T> {
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	const str = JSON.stringify(obj);
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return { ...obj, hash: (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString() };
}
