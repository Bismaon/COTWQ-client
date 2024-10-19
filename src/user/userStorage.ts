import { User } from "./User";

export type UserBase = {
	id: number;
	username: string;
	email: string;
};

export type UserWithHSF = UserBase & {
	highscores: HighscoreFormatted;
};

export type HighscoreFormatted = {
	[gameName: string]: string;
};
// Assuming this is called after successful login
export async function loginUser(userId: number): Promise<boolean | Error> {
	try {
		const data: UserWithHSF | null = await retrieveUser(userId);

		if (!data) {
			console.error(
				"Failed to retrieve user data or highscores are missing."
			);
			return false;
		}

		const user: User = new User(data.id, data.username, data.highscores);
		localStorage.setItem("user", user.toString());
		localStorage.setItem("userId", String(user.id));

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
	const userData: string | null = localStorage.getItem("user");
	if (!userData) {
		return null; // No user data found
	}

	try {
		const parsedData: UserWithHSF = JSON.parse(userData);

		// Ensure highscores is an object
		if (
			typeof parsedData.highscores !== "object" ||
			Array.isArray(parsedData.highscores)
		) {
			console.error("Invalid highscores format. Expected an object.");
			parsedData.highscores = {}; // Default to an empty object if it's invalid
		}

		// Create a new User object with the correct highscores format
		return new User(
			parsedData.id,
			parsedData.username,
			parsedData.highscores
		);
	} catch (error) {
		console.error("Error parsing user data:", error);
		return null;
	}
}

// Fetch user data from the backend
async function retrieveUser(id: number): Promise<UserWithHSF | null> {
	try {
		const response = await fetch("/users/fetch-user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id }),
		});

		if (response.ok) {
			const data: UserWithHSF = await response.json();
			console.log("Data fetched from backend:", data);

			if (
				typeof data.highscores !== "object" ||
				Array.isArray(data.highscores)
			) {
				console.error(
					"Invalid highscores format from backend. Expected object."
				);
				data.highscores = {}; // Fix invalid format
			}

			return data; // Return the retrieved user data
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
