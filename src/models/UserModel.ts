// UserModel.ts

/**
 * A class representing a user profile with an ID, name, and game scores.
 */
export class UserModel {
	private id: string;
	private name: string;
	// Mapping of game names to scores
	private scores: { [gameName: string]: number };

	/**
	 * Creates an instance of UserProfile.
	 * @param id The user ID.
	 * @param name The user name.
	 * @param scores Optional initial scores for games.
	 */
	constructor(id: string, name: string, scores: { [gameName: string]: number } = {}) {
		this.id = id;
		this.name = name;
		this.scores = scores;
	}

	/**
	 * Gets the user's name.
	 * @returns The user's name.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Sets the user's name.
	 * @param name The new name to set.
	 */
	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Gets the user's ID.
	 * @returns The user's ID.
	 */
	public getID(): string {
		return this.id;
	}

	/**
	 * Sets the user's ID.
	 * @param id The new ID to set.
	 */
	public setID(id: string): void {
		this.id = id;
	}

	/**
	 * Gets the user's scores for all games.
	 * @returns The scores mapping for all games.
	 */
	public getScores(): { [gameName: string]: number } {
		return this.scores;
	}

	/**
	 * Gets the user's score for a specific game.
	 * @param gameName The name of the game.
	 * @returns The score for the specified game.
	 */
	public getScoreFor(gameName: string): number {
		return this.scores[gameName];
	}

	/**
	 * Sets the user's scores for all games.
	 * @param scores The new scores mapping for all games.
	 */
	public setScores(scores: { [gameName: string]: number }): void {
		this.scores = scores;
	}

	/**
	 * Sets the user's ID in a browser cookie.
	 */
	public setUserIdInCookie(): void {
		document.cookie = `userId=${this.id}; SameSite=Strict; Secure; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
	}
}
