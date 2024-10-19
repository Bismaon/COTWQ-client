import { Highscores } from "./Highscores";

export class User {
	constructor(
		id: number,
		username: string,
		highscores: { game_name: string; score: string }[] | Highscores
	) {
		this._id = id;
		this._username = username;
		if (highscores instanceof Highscores) {
			this._highscores = highscores;
		} else {
			this._highscores = new Highscores(highscores);
		}
	}

	private _id: number;

	public get id(): number {
		return this._id;
	}

	public set id(id: number) {
		this._id = id;
	}

	private _username: string;

	public get username(): string {
		return this._username;
	}

	public set username(name: string) {
		this._username = name;
	}

	private _highscores: Highscores;

	public get highscores(): Highscores {
		return this._highscores;
	}

	public set highscores(highscores: Highscores) {
		this._highscores = highscores;
	}

	public async updateHighscore(
		gameName: string,
		score: string
	): Promise<void> {
		try {
			// Fetch game ID or create new game if it doesn't exist
			const gameId: number = await this.getOrCreateGameId(gameName);

			// Update highscore
			const response: Response = await fetch("/highscores", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user_id: this._id,
					game_id: gameId,
					score,
				}),
			});

			if (response.ok) {
				this._highscores.setHighscores(gameName, score);
			} else {
				console.error(
					"Failed to update highscore:",
					response.statusText
				);
			}
		} catch (error) {
			console.error("Error updating highscore:", error);
		}
	}

	public toString(): string {
		const HS = this._highscores.getEntries().reduce(
			(acc, [game, score]) => {
				acc[game] = score; // Convert entries back to object format
				return acc;
			},
			{} as { [gameName: string]: string }
		);
		return JSON.stringify({
			id: this._id,
			username: this._username,
			highscores: HS,
		});
	}

	private async getOrCreateGameId(gameName: string): Promise<number> {
		try {
			const gameResponse: Response = await fetch(
				`/games?name=${encodeURIComponent(gameName)}`
			);
			if (gameResponse.ok) {
				const gameData = await gameResponse.json();
				return gameData.id;
			} else {
				const newGameResponse: Response = await fetch("/games", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ game_name: gameName }),
				});
				const newGameData = await newGameResponse.json();
				return newGameData.id;
			}
		} catch (error) {
			console.error("Error fetching or creating game:", error);
			throw error; // Propagate the error for higher level handling
		}
	}
}
