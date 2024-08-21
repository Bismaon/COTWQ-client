import React, { useEffect, useState } from "react";
import { UserModel } from "../user/UserModel";

const UserInformation: React.FC<{ userID: number }> = ({ userID }) => {
	const [userData, setUserData] = useState<UserModel | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect((): void => {
		const fetchUserData = async (): Promise<void> => {
			try {
				const response: Response = await fetch("/users/fetch-user", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: userID }), // Need to make the user login and keep track of his ID
				});

				if (response.ok) {
					const userData = await response.json();
					setUserData(userData);
					console.log("success");
				} else {
					const errorText: string = await response.text();
					setError(`Failed to fetch user: ${errorText}`);
				}
			} catch (error) {
				console.error("Error fetching user: ", error);
				setError("Error during user DB call.");
			}
		};
		fetchUserData();
	}, [userID]);

	if (userData != null) {
		return (
			<>
				<h2>User Information</h2>
				<p>ID: {userData.getID()}</p>
				<p>Username: {userData.getUsername()}</p>
				<h3>Highscores:</h3>
				<ul>
					{Object.entries(userData.getHighscores()).map(
						([game, score]: [string, number]) => (
							<li key={game}>
								{game}: {score}
							</li>
						)
					)}
				</ul>
			</>
		);
	} else {
		return (
			<>
				<h2>User Information</h2>
				{error && <p style={{ color: "red" }}>{error}</p>}
			</>
		);
	}
};

export default UserInformation;
