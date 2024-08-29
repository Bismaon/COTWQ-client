// Assuming this is called after successful login
export function loginUser(userID: number): void {
	localStorage.setItem("userId", String(userID));
	console.log("User logged in with ID:", userID);
}

// Retrieve user ID when needed
export function checkUserSession(): number {
	const userId: number = Number(localStorage.getItem("userId"));
	if (userId) {
		return userId;
		// Proceed with user-specific logic
	} else {
		// Redirect to login page or show login form
		return -1;
	}
}

// Call this function when the user logs out
export function logoutUser(): void {
	localStorage.removeItem("userId");
	console.log("User logged out.");
}
