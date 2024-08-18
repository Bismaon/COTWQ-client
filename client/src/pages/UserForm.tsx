// UserForm.tsx
import React, { useState } from "react";
import { UserModel } from "../user/UserModel";
import CreateAccountForm from "./CreateAccountForm";

const UserForm: React.FC = () => {
	const [userID, setUserID] = useState<number>();
	const [userData, setUserData] = useState<UserModel | null>(null);
	const [error, setError] = useState<string>("");

	const handleSubmitFetchUser = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		try {
			const response = await fetch("/users/fetch-user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: userID }),
			});

			if (response.ok) {
				const fetchedUser = await response.json();
				setUserData(fetchedUser);
				console.log("Fetched user data:", fetchedUser);
			} else {
				const errorText = await response.text();
				setError(`Failed to fetch user: ${errorText}`);
			}
		} catch (error) {
			console.error("Error fetching user:", error);
			// Handle error
		}
	};

	return (
		<div style={{ display: "none" }}>
			<CreateAccountForm setUserID={setUserID} />

			<hr />

			<form onSubmit={handleSubmitFetchUser}>
				<label>
					Enter User ID to Fetch:
					<input
						type="number"
						value={userID}
						onChange={(e) => setUserID(Number(e.target.value))}
						required
					/>
				</label>
				<button type="submit">Fetch User Data</button>
			</form>

			{userData && (
				<div>
					<h2>User Data</h2>
					<p>ID: {userData.id}</p>
					<p>Username: {userData.username}</p>
					<h3>Highscores:</h3>
					<ul>
						{Object.entries(userData.highscores).map(
							([game, score]: [string, number]) => (
								<li key={game}>
									{game}: {score}
								</li>
							)
						)}
					</ul>
				</div>
			)}

			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default UserForm;
