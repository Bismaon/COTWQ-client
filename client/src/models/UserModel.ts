export class UserModel {
	id: string;
	username: string;
	highscores: { [gameName: string]: number };

	constructor(id: string, username: string, highscores: { [gameName: string]: number } = {}) {
		this.id = id;
		this.username = username;
		this.highscores = highscores;
	}

	public getUsername(): string {
		return this.username;
	}

	public setUsername(name: string): void {
		this.username = name;
	}

	public getID(): string {
		return this.id;
	}

	public setID(id: string): void {
		this.id = id;
	}

	public getHighscores(): { [gameName: string]: number } {
		return this.highscores;
	}

	public getHighscoreFor(gameName: string): number {
		return this.highscores[gameName];
	}

	public setHighscores(highscores: { [gameName: string]: number }): void {
		this.highscores = highscores;
	}

	// New methods to interact with the backend
	public async fetchUserData(): Promise<void> {
		try {
			const response = await fetch(`/users/${this.id}`);
			if (response.ok) {
				const data = await response.json();
				this.username = data.username;
				this.highscores = data.highscores;
			} else {
				console.error('Failed to fetch user data:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	}

	public async updateHighscore(gameName: string, score: number): Promise<void> {
		try {
		  // Fetch game ID or create new game if it doesn't exist
		  const gameId = await this.getOrCreateGameId(gameName);
	
		  // Update highscore
		  const response = await fetch('/highscores', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id: this.id, game_id: gameId, score })
		  });
	
		  if (response.ok) {
			this.highscores[gameName] = score;
		  } else {
			console.error('Failed to update highscore:', response.statusText);
		  }
		} catch (error) {
		  console.error('Error updating highscore:', error);
		}
	}
	
	private async getOrCreateGameId(gameName: string): Promise<number> {
		try {
		  const gameResponse = await fetch(`/games?name=${encodeURIComponent(gameName)}`);
		  if (gameResponse.ok) {
			const gameData = await gameResponse.json();
			return gameData.id;
		  } else {
			const newGameResponse = await fetch('/games', {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify({ game_name: gameName })
			});
			const newGameData = await newGameResponse.json();
			return newGameData.id;
		  }
		} catch (error) {
		  console.error('Error fetching or creating game:', error);
		  throw error; // Propagate the error for higher level handling
		}
	  }
}
