export class UserModel {
	_id: string;
	_username: string;
	_highscores: { [gameName: string]: number };

	constructor(
		id: string,
		username: string,
		highscores: { [gameName: string]: number } = {}
	) {
		this._id = id;
		this._username = username;
		this._highscores = highscores;
	}

	public getUsername(): string {
		return this._username;
	}

	public setUsername(name: string): void {
		this._username = name;
	}

	public getID(): string {
		return this._id;
	}

	public setID(id: string): void {
		this._id = id;
	}

	public getHighscores(): { [gameName: string]: number } {
		return this._highscores;
	}

	public getHighscoreFor(gameName: string): number {
		return this._highscores[gameName];
	}

	public setHighscores(highscores: { [gameName: string]: number }): void {
		this._highscores = highscores;
	}

	// New methods to interact with the backend
	public async fetchUserData(): Promise<void> {
		try {
			const response: Response = await fetch(`/users/${this._id}`);
			if (response.ok) {
				const data = await response.json();
				this._username = data.username;
				this._highscores = data.highscores;
			} else {
				console.error(
					"Failed to fetch user data:",
					response.statusText
				);
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	}

	public async updateHighscore(
		gameName: string,
		score: number
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
				this._highscores[gameName] = score;
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
