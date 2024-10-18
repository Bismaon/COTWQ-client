export class Highscores {
	private _highscores: { [gameName: string]: string };
	constructor(highscores: { [gameName: string]: string }) {
		this._highscores = highscores;
	}

	public toString(): string {
		return JSON.stringify(this._highscores);
	}

	public setHighscores(gameName: string, score: string): void {
		this._highscores[gameName] = score;
	}

	public getEntries(): [string, string][] {
		return Object.entries(this._highscores);
	}

	public getFormattedEntries(): [string, string][] {
		const entries: [string, string][] = this.getEntries();
		return entries.map(([gameName, score]) => [
			gameName,
			this.scoreToShow(score),
		]);
	}

	private scoreToShow(score: string): string {
		let hours: string = score.slice(0, 2);
		hours = hours === "00" ? "" : `${hours}:`;

		let minutes: string = score.slice(2, 4);
		minutes = minutes === "00" ? "" : `${minutes}:`;

		const seconds: string = score.slice(4, 6);
		return `${hours}${minutes}${seconds}`;
	}
}
