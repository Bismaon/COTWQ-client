// UserSession.ts

import { UserModel } from "../models/UserModel";
import { generateUUID } from "three/src/math/MathUtils";

/**
 * Interface representing a mapping of user IDs to user profiles.
 */
export interface Users {
	[id: string]: UserModel;
}

/**
 * Manages user sessions, including user profiles, scores, and session data storage.
 */
export class UserSession {
	private readonly users: Users;

	/**
	 * Creates an instance of UserSession.
	 * Initializes user data from local storage or creates a new instance if no data exists.
	 */
	constructor() {
		const storedUsers = localStorage.getItem("users");
		this.users = this.validateUsersData(storedUsers);
	}

	/**
	 * Sets the score for a specific game for a user.
	 * @param id The user ID.
	 * @param gameName The name of the game.
	 * @param score The score to set.
	 */
	public setUserScore(id: string, gameName: string, score: number): void {
		this.users[id].getScores()[gameName] = score;
		this.saveUsersToLocalStorage();
	}

	/**
	 * Retrieves all user profiles.
	 * @returns A mapping of user IDs to user profiles.
	 */
	public getUsers(): Users {
		return this.users;
	}

	/**
	 * Retrieves scores for a specific game across all user profiles.
	 * @param gameName The name of the game.
	 * @returns A mapping of user names to scores for the specified game.
	 */
	public getScoresFor(gameName: string): { [userName: string]: number } {
		const scores: { [userName: string]: number } = {};
		for (const id in this.users) {
			const user: UserModel = this.users[id];
			const score: number = user.getScores()[gameName] || 0;
			if (score !== 0) {
				scores[user.getName()] = score;
			}
		}
		return scores;
	}

	/**
	 * Retrieves the top high scores for a specific game.
	 * @param game The name of the game.
	 * @returns An array of tuples containing user names and scores, sorted by score in ascending order.
	 */
	public getHighScoreFor(game: string): [string, number][] {
		const scores: { [userName: string]: number } = this.getScoresFor(game);
		const scoreEntries: [string, number][] = Object.entries(scores);
		scoreEntries.sort((a, b) => a[1] - b[1]);
		return scoreEntries.slice(0, 10); // Return top 10 scores
	}

	/**
	 * Checks if a user ID exists in the current session (based on browser cookie).
	 * @returns The user ID if found, otherwise null.
	 */
	public exists(): string | null {
		return this.getIdFromCookie();
	}

	/**
	 * Creates a new user profile with a random ID and specified username.
	 * Stores the user profile in the session and local storage.
	 * @param username The username for the new user.
	 */
	public createUser(username: string): void {
		const id: string = generateUUID();
		this.users[id] = new UserModel(id, username, {});
		this.users[id].setUserIdInCookie();
		this.saveUsersToLocalStorage();
	}

	/**
	 * Validates and parses user data retrieved from local storage.
	 * @param storedData The stored data retrieved from local storage.
	 * @returns A validated mapping of user IDs to user profiles.
	 */
	private validateUsersData(storedData: string | null): Users {
		if (!storedData) {
			console.error("No user data found in localStorage.");
			return {};
		}

		try {
			const parsedData: { [id: string]: UserModel} = JSON.parse(storedData);
			const validatedUsers: Users = {};

			for (const id in parsedData) {
				const userData = parsedData[id];
				if (userData && typeof userData === "object" && "id" in userData && "name" in userData && "scores" in userData) {
					validatedUsers[id] = new UserModel(userData.getID(), userData.getName(), userData.getScores());
				} else {
					console.error(`Invalid user data for ID "${id}". Skipping.`);
				}
			}

			return validatedUsers;
		} catch (error) {
			console.error("Error parsing or validating user data:", error);
			return {};
		}
	}

	/**
	 * Saves the users data to local storage as a JSON string.
	 */
	private saveUsersToLocalStorage(): void {
		localStorage.setItem("users", JSON.stringify(this.users));
	}

	/**
	 * Retrieves the user ID from a browser cookie.
	 * @returns The user ID retrieved from the cookie, or null if not found.
	 */
	private getIdFromCookie(): string | null {
		const cookieName: string = "userId=";
		const decodedCookie: string = decodeURIComponent(document.cookie);
		const cookieArray: string[] = decodedCookie.split(";");

		for (const cookie of cookieArray) {
			let trimmedCookie: string = cookie.trim();
			if (trimmedCookie.indexOf(cookieName) === 0) {
				return trimmedCookie.substring(cookieName.length, trimmedCookie.length);
			}
		}

		return null;
	}
}
