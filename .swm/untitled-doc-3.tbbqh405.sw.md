---
title: Untitled doc (3)
---
# Introduction

This document will walk you through the implementation of error handling in the user storage module.

We will cover:

1. Where and why error calls are placed.
2. How error handling integrates with user session management.
3. The impact of error handling on data retrieval and storage.

# Error handling in <SwmToken path="/src/user/userStorage.ts" pos="17:6:6" line-data="export async function loginUser(userId: number): Promise&lt;boolean | Error&gt; {">`loginUser`</SwmToken> function

<SwmSnippet path="/src/user/userStorage.ts" line="8">

---

The <SwmToken path="/src/user/userStorage.ts" pos="17:6:6" line-data="export async function loginUser(userId: number): Promise&lt;boolean | Error&gt; {">`loginUser`</SwmToken> function is responsible for logging in a user by retrieving their data and storing it locally. Error handling is crucial here to ensure that any issues during the login process are logged and handled appropriately.

```

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
```

---

</SwmSnippet>

<SwmSnippet path="/src/user/userStorage.ts" line="20">

---

If the user data retrieval fails, an error message is logged, and the function returns `false`.

```

		if (!data) {
			console.error(
				"Failed to retrieve user data or highscores are missing."
			);
			return false;
		}
```

---

</SwmSnippet>

<SwmSnippet path="/src/user/userStorage.ts" line="27">

---

If the user data is successfully retrieved, it is stored in local storage, and a success message is logged. Any errors during this process are caught and logged, and the function returns `false`.

```

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
```

---

</SwmSnippet>

# Session management functions

<SwmSnippet path="/src/user/userStorage.ts" line="39">

---

The <SwmToken path="/src/user/userStorage.ts" pos="41:4:4" line-data="export function checkUserSession(): number {">`checkUserSession`</SwmToken> function checks if there is an active user session by retrieving the user ID from local storage. If no session is found, an appropriate message is logged.

```

// Retrieve user ID when needed
export function checkUserSession(): number {
	const userId: number = getUserID();
	if (userId) {
		console.log("Session active for user ID:", userId);
		return userId;
	} else {
		console.log("No active session.");
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
```

---

</SwmSnippet>

<SwmSnippet path="/src/user/userStorage.ts" line="39">

---

The <SwmToken path="/src/user/userStorage.ts" pos="55:4:4" line-data="export function logoutUser(): void {">`logoutUser`</SwmToken> function clears the user data from local storage and logs a message indicating that the user has logged out.

```

// Retrieve user ID when needed
export function checkUserSession(): number {
	const userId: number = getUserID();
	if (userId) {
		console.log("Session active for user ID:", userId);
		return userId;
	} else {
		console.log("No active session.");
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
```

---

</SwmSnippet>

# Retrieving user data

<SwmSnippet path="/src/user/userStorage.ts" line="60">

---

The <SwmToken path="/src/user/userStorage.ts" pos="61:4:4" line-data="export function getUser(): User | null {">`getUser`</SwmToken> function retrieves the user data from local storage and ensures that the highscores format is correct. If the highscores format is invalid, an error is logged, and the highscores are defaulted to an empty object.

```

export function getUser(): User | null {
	const userData = localStorage.getItem("user");
	if (!userData) {
		return null; // No user data found
	}

	try {
		const parsedData = JSON.parse(userData);

		// Ensure highscores is an object
		if (
			typeof parsedData.highscores !== "object" ||
			Array.isArray(parsedData.highscores)
		) {
			console.error("Invalid highscores format. Expected an object.");
			parsedData.highscores = {}; // Default to an empty object if it's invalid
		}
```

---

</SwmSnippet>

<SwmSnippet path="/src/user/userStorage.ts" line="78">

---

If there is an error parsing the user data, it is logged, and the function returns <SwmToken path="/src/user/userStorage.ts" pos="87:3:3" line-data="		return null;">`null`</SwmToken>.

```

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
```

---

</SwmSnippet>

# Fetching user data from the backend

<SwmSnippet path="/src/user/userStorage.ts" line="90">

---

The <SwmToken path="/src/user/userStorage.ts" pos="92:4:4" line-data="async function retrieveUser(id: number): Promise&lt;UserWithHSF | null&gt; {">`retrieveUser`</SwmToken> function fetches user data from the backend. If the response is successful, the data is logged. If the highscores format is invalid, an error is logged, and the format is corrected.

```

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
```

---

</SwmSnippet>

<SwmSnippet path="/src/user/userStorage.ts" line="115">

---

If the response is not successful or an error occurs during the fetch, appropriate error messages are logged.

```

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
```

---

</SwmSnippet>

# Updating highscores

<SwmSnippet path="/src/user/userStorage.ts" line="126">

---

The <SwmToken path="/src/user/userStorage.ts" pos="127:6:6" line-data="export async function updateHighscore(">`updateHighscore`</SwmToken> function updates the user's highscore on the backend. If the update is successful, a debug message is logged. If the update fails or an error occurs, appropriate error messages are logged.

```

export async function updateHighscore(
	userID: number,
	gameName: string,
	time: string
): Promise<void> {
	try {
		const response: Response = await fetch("/highscores/update-highscore", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userID, gameName, time }),
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
```

---

</SwmSnippet>

# Conclusion

Error handling is integrated throughout the user storage module to ensure that any issues are logged and handled appropriately. This helps in identifying and debugging problems during user login, session management, data retrieval, and highscore updates.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBQ09UV1EtY2xpZW50JTNBJTNBQmlzbWFvbg==" repo-name="COTWQ-client"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
