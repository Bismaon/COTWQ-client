import React, { useState } from "react";
import { checkUserSession, loginUser } from "../../user/userStorage";
import CreateAccountForm from "./CreateAccountForm";
import UserForm from "./UserForm";

interface LoginFormProps {
	onSessionChange: () => void; // Callback to notify parent about session change
}

const LoginForm: React.FC<LoginFormProps> = ({ onSessionChange }) => {
	const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
	const [logged, setLogged] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	if (showCreateAccountForm) {
		return <CreateAccountForm onSessionChange={onSessionChange} />;
	} else if (logged || checkUserSession() !== -1) {
		return <UserForm onSessionChange={onSessionChange} />;
	}

	const handleLogin = async (
		event: React.FormEvent<HTMLFormElement>
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
				loginUser(id);
				setLogged(true);
				onSessionChange(); // Notify ProfileMenu about session change
				console.debug("User logged in: ", id);
				alert("LOGGED IN SUCCESSFULLY!");
			} else {
				const errorText: string = await response.text();
				setError(`Failed to login: ${errorText}`);
			}
		} catch (error) {
			console.error("Error logging in:", error);
			setError("An error occurred during login.");
		}
	};

	return (
		<form
			className="grid-profile-container"
			name="login-form"
			onSubmit={handleLogin}
		>
			<label className="grid-item" htmlFor="username">
				Username:
			</label>
			<div className="grid-item inputDiv">
				<input
					type="text"
					value={username}
					name="username"
					id="username"
					autoComplete="username"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setUsername(e.target.value)
					}
					required
				/>
				<div className="status-icon" />
			</div>

			<label className="grid-item" htmlFor="password">
				Password:
			</label>
			<div className="grid-item inputDiv">
				<input
					type="password"
					value={password}
					name="password"
					id="password"
					autoComplete="new-password"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setPassword(e.target.value)
					}
					required
					minLength={8}
				/>
				<div className="status-icon" />
			</div>

			<div className="grid-item">
				<button
					className="button"
					onClick={() => setShowCreateAccountForm(true)}
				>
					Don't have an account
				</button>
				<button className="button" type="submit">
					Login
				</button>
			</div>

			{/* <button className="grid-item">Forgot password?</button> */}
			{/* Redirect to change password */}
			{error && <p style={{ color: "red" }}>{error}</p>}
		</form>
	);
};

export default LoginForm;
