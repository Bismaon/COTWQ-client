// src/utils/loginUtils.ts
import { loginUser } from "../user/userStorage";

export const togglePasswordVisibility = (
	passwordInput: HTMLInputElement,
	showPassword: boolean
) => {
	const type = showPassword ? "text" : "password";
	passwordInput.setAttribute("type", type);
};

export const handleLogin = async (
	event: React.FormEvent<HTMLFormElement>,
	username: string,
	password: string,
	onSessionChange: () => void,
	setLogged: React.Dispatch<React.SetStateAction<boolean>>,
	setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> => {
	event.preventDefault();
	try {
		const response: Response = await fetch("/users/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});

		console.debug("Raw response:", response);

		if (response.ok) {
			const { id } = await response.json();
			console.debug("Parsed response: ", id);
			if (!(await loginUser(id))) {
				setLogged(false);
				console.error("Error logging user.");
				return;
			}
			setLogged(true);
			onSessionChange(); // Notify ProfileMenu about session change
			console.debug("User logged in: ", id);
		} else {
			const errorText: string = await response.text();
			setError(`Failed to login: ${errorText}`);
		}
	} catch (error) {
		console.error("Error logging in:", error);
		setError("An error occurred during login.");
	}
};
