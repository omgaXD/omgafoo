import { fadeIn } from "../shared/helpers/animations";
import { randNext } from "./helpers";
import { Note } from "./note";
import { play } from "./synth";
import { initGame, showScoreAndActual } from "./ui/game";
import { hideSettings, initSettings as initSettingsAndWaitStart } from "./ui/settings";

export type GameMode = "notes" | "freq";
export type Flavor = "sine" | "piano";

export type BaseGameParams = {
	type: GameMode;
	flavor: Flavor;
};

export type NotesGameParams = BaseGameParams & {
	type: "notes";
	tuningA4Hz: number;
	notesOctavesMin: number;
	notesOctavesMax: number;
};

export type FreqGameParams = BaseGameParams & {
	type: "freq";
	freqHzMin: number;
	freqHzMax: number;
};

export type GameParams = NotesGameParams | FreqGameParams;

export type GuessHandler = (guess: string) => void;

initSettingsAndWaitStart().then((params) => {
	hideSettings().then(() => startGame(params));
});

function getRandomFreq(params: FreqGameParams): number {
	const { freqHzMin, freqHzMax } = params;
	return randNext(freqHzMin, freqHzMax);
}

function scoreFreq(guess: number, actual: number): number {
	// if (guess === actual) return 5000;
	const error = Math.abs(guess - actual);
	const relativeError = error / actual;
	const score = 5000 * Math.exp(-relativeError * relativeError * 10);
	return Math.round(score);
}

function startGame(params: GameParams) {
	if (params.type === "freq") {
		const gameFreq = document.getElementById("game-freq")!;

		let freq = getRandomFreq(params);
		play(freq, params.flavor);
		function guess(guess: string) {
			const guessNum = parseFloat(guess);
			if (isNaN(guessNum)) {
				throw new Error("Invalid guess: not a number");
			}
			const score = scoreFreq(guessNum, freq);
			showScoreAndActual(score, freq.toFixed(0));
			freq = getRandomFreq(params as FreqGameParams);
			play(freq, params.flavor);
		}

		initGame(params, guess);
		fadeIn({ element: gameFreq, display: "flex" });
	} else if (params.type === "notes") {
		const gameNotes = document.getElementById("game-notes")!;

		let note = Note.randomFromRange(params.notesOctavesMin, params.notesOctavesMax);
		play(note.getFreq(params.tuningA4Hz), params.flavor);
		function guess(guess: string) {
			if (params.type !== "notes") return;

			const guessNote = Note.fromString(guess);
			console.log(guessNote?.toString());
			if (guessNote === null) {
				throw new Error("Invalid guess: not a note");
			}
			const score = scoreFreq(note.getFreq(params.tuningA4Hz), guessNote.getFreq(params.tuningA4Hz));
			showScoreAndActual(score, note.toString());
			note = Note.randomFromRange(params.notesOctavesMin, params.notesOctavesMax);
			play(note.getFreq(params.tuningA4Hz), params.flavor);
		}

		initGame(params, guess);
		fadeIn({ element: gameNotes, display: "flex" });
	}
}
