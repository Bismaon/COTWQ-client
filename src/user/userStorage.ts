// Assuming this is called after successful login
export function loginUser(userID: number): void {
	localStorage.setItem("userId", String(userID));
	console.log("User logged in with ID:", userID);
}

// Retrieve user ID when needed
export function checkUserSession(): number {
	const userId: number = Number(localStorage.getItem("userId"));
	console.log(userId);
	if (userId) {
		console.log("true");
		return userId;
	} else {
		console.log("false");
		return -1;
	}
}

// Call this function when the user logs out
export function logoutUser(): void {
	localStorage.removeItem("userId");
	console.log("User logged out.");
}
