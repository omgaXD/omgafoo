import { randNext } from "./helpers";

export const sharps = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"] as const;
export const flats = ["A", "BB", "B", "C", "DB", "D", "EB", "E", "F", "GB", "G", "AB"] as const;
export class Note {
	constructor(public semiFromA4: number) {}
	static fromString(str: string): Note | null {
		if (str.length < 2) return null;
		const semi = Note.letterToSemi(str.substring(0, 2)) ?? Note.letterToSemi(str[0]);
		if (semi === null) return null;
		const parsedOctave = Number.parseInt(str.slice(sharps[(semi + 12) % 12].length));
		if (Number.isNaN(parsedOctave)) return null;
		return new Note(semi + (parsedOctave - 4) * 12);
	}
	static randomFromRange(minOctave: number, maxOctave: number) {
		return new Note(randNext(-9, 2) + (randNext(minOctave, maxOctave) - 4) * 12);
	}
	private static letterToSemi(letter: string): number | null {
		const semi = Math.max(
			(sharps as readonly string[]).indexOf(letter.toUpperCase()),
			(flats as readonly string[]).indexOf(letter.toUpperCase()),
		);
		if (semi === -1) return null;
		return semi >= 3 ? semi - 12 : semi;
	}

	getFreq(tuningA4: number): number {
		return tuningA4 * Math.pow(2, this.semiFromA4 / 12);
	}
	toString(preferSharps: boolean = true) {
		const letters = preferSharps ? sharps : flats;

		return letters[(this.semiFromA4 + 12) % 12] + Math.floor((this.semiFromA4 + 57) / 12);
	}
}

console.assert(Note.fromString("A4")!.toString() === "A4", "a4 = a4");
console.assert(Note.fromString("C4")!.toString() === "C4", "c4 = c4");
console.assert(Note.fromString("A4")!.semiFromA4 === 0, "a4 = 0");
console.assert(Note.fromString("A#4")!.semiFromA4 === 1, "a#4 = 1");
console.assert(Note.fromString("Bb4")!.semiFromA4 === 1, "bb = 1");
console.assert(Note.fromString("C4")!.semiFromA4 === -9, "c = -9");
console.assert(Note.fromString("A4")!.getFreq(440) < Note.fromString("B4")!.getFreq(440), "a4 < b4");
console.assert(Note.fromString("C4")!.getFreq(440) < Note.fromString("A4")!.getFreq(440), "c4 < a4");
