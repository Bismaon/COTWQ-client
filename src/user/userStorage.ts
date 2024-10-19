import { User } from "./User";
import { Highscores } from "./Highscores";

export type UserBase = {
	id: number;
	username: string;
	email: string;
};

export type UserWithHS = UserBase & {
	highscores: Highscore[];
};

export type Highscore = {
	game_name: string;
	score: string;
};
// Assuming this is called after successful login
export async function loginUser(userId: number): Promise<boolean> {
	try {
		const data: UserWithHS | null = await retrieveUser(userId);

		if (!data) {
			console.error(
				"Failed to retrieve user data or highscores are missing."
			);
			return false;
		}
		console.log("data fetched: ", data);
		const user: User = new User(data.id, data.username, data.highscores);
		localStorage.setItem("user", user.toString());
		localStorage.setItem("userId", String(user.id));

		console.log("formattedHS: ", user.highscores);
		console.log("User logged in with ID:", user.id);
		return true;
	} catch (error) {
		console.error("Error during login:", error);
		return false;
	}
}

// Retrieve user ID when needed
export function checkUserSession(): number {
	const userId: number = getUserID();
	if (userId) {
		console.debug("Session active for user ID: ", userId);
		return userId;
	} else {
		console.debug("No active session.");
		return -1;
	}
}
export function getUserID(): number {
	return Number(localStorage.getItem("userId"));
}
// Call this function when the user logs out
export function logoutUser(): void {
	localStorage.removeItem("user");
	localStorage.removeItem("userId");
	console.log("User logged out.");
}

export function getUser(): User | null {
	try {
		const userData: string | null = localStorage.getItem("user");
		if (!userData) {
			return null; // No user data found
		}
		const parsedData = JSON.parse(userData);
		const HSBase: { game_name: string; score: string }[] = Object.entries(
			parsedData.highscores
		).map((game: [string, unknown]) => ({
			game_name: game[0],
			score: game[1] as string,
		}));
		const highscores: Highscores = new Highscores(HSBase);

		const user = new User(parsedData.id, parsedData.username, highscores);
		console.log("user: ", user);
		return user;
	} catch (error) {
		console.error("Error parsing user data:", error);
		return null;
	}
}

// Fetch user data from the backend
async function retrieveUser(id: number): Promise<UserWithHS | null> {
	try {
		const response: Response = await fetch("/users/fetch-user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id }),
		});

		if (response.ok) {
			const data = await response.json();
			console.log("Data fetched from backend:", data);
			if (!data) {
			}
			const userData: UserWithHS = data.userData;
			console.log("userData: ", userData);
			return userData; // Return the retrieved user data
		} else {
			console.error("Failed to retrieve user data from the server.");
			return null;
		}
	} catch (error) {
		console.error("Error fetching user data: ", error);
		return null;
	}
}

export async function updateHighscore(
	user_id: number,
	gameName: string,
	time: string
): Promise<void> {
	try {
		const response: Response = await fetch("/highscores/update-highscore", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ user_id, gameName, time }),
		});

		if (response.ok) {
			console.debug("Successfully updated highscore: ", response.status);
		} else {
			console.error("Failed to retrieve user data from the server.");
		}
	} catch (error) {
		console.error("Error fetching user data: ", error);
	}
}

export function storeGameNames(gameNames: string[]): void {
	localStorage.setItem("gameNames", JSON.stringify(gameNames));
}
export function retrieveGameNames(): string[] {
	const data: string | null = localStorage.getItem("gameNames");
	if (!data) {
		console.error("Can't find game names.");
		return [];
	}
	return JSON.parse(data);
}
