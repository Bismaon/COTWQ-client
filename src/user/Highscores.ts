import { formatTime } from "../utils/utilities";

type highscores = { [gameName: string]: string };
export class Highscores {
	private _highscores: highscores;
	constructor(highscores: { game_name: string; score: string }[]) {
		this._highscores = this.formatHS(highscores);
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
		return entries.map(
			([gameName, score]: [string, string]): [string, string] => [
				gameName,
				formatTime(score),
			]
		);
	}

	private formatHS(highscores: { game_name: string; score: string }[]): {
		[p: string]: string;
	} {
		console.log("highscoresNF: ", highscores);

		const formattedHS: highscores = {};
		Array.from(highscores).forEach(
			(score: { game_name: string; score: string }): void => {
				console.log("Score: ", score);
				formattedHS[score.game_name] = score.score;
			}
		);
		console.log("highscoresF: ", formattedHS);
		return formattedHS;
	}
}
