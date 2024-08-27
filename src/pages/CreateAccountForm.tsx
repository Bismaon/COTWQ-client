import React, { useState } from "react";

const CreateAccountForm: React.FC<{ setUserID: (userID: number) => void }> = ({
	setUserID,
}) => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleCreateAccount = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		try {
			const response = await fetch("/users/create-account", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, username, password }),
			});

			console.debug("Raw response:", response);

			if (response.ok) {
				const data = await response.json();
				const { id } = data[0];
				console.debug("Parsed response:", data);
				setUserID(id);
				console.debug("User logged in:", id);
				alert("CREATE ACCOUNT SUCCESSFULL!");
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
		<form name="create-account-form" onSubmit={handleCreateAccount}>
			<label>
				Email address:
				<input
					type="email"
					value={email}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setEmail(e.target.value)
					}
					required
				/>
			</label>
			<label>
				Username:
				<input
					type="text"
					value={username}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setUsername(e.target.value)
					}
					required
				/>
			</label>
			<label>
				Password:
				<input
					type="password"
					value={password}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setPassword(e.target.value)
					}
					required
				/>
			</label>
			<label>
				Re-enter Password:
				<input type="password" required />
			</label>
			<button type="submit">Create Account</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</form>
	);
};

export default CreateAccountForm;
