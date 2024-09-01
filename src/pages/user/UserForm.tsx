import React, { useEffect, useState } from "react";
import { User } from "../../user/User";
import { checkUserSession } from "../../user/userStorage";

interface UserFormProps {
	onSessionChange: () => void; // Callback to notify parent about session change
}

const UserForm: React.FC<UserFormProps> = ({ onSessionChange }) => {
	const [userIsSet, setUserIsSet] = useState(false);
	const [userID, setUserID] = useState<number>();
	const [userData, setUserData] = useState<User | null>(null);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (!userIsSet) {
			const id: number = checkUserSession();
			console.log("ID: ", id);
			if (id !== -1) {
				setUserID(id);
				setUserIsSet(true); // This will ensure the second useEffect is triggered only once
			}
		}
	}, [userIsSet]);

	useEffect(() => {
		if (!(userIsSet && userID !== undefined && !userData)) {
			return;
		}
		fetch("/users/fetch-user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: userID }),
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error("Failed to fetch user data");
				}
			})
			.then((data) => {
				console.log(data);
				setUserData(data);
				onSessionChange(); // Notify ProfileMenu about session change
			})
			.catch((error) => {
				console.error(error);
				setError(error.message);
			});
	}, [userIsSet, userID, userData, onSessionChange]);

	return (
		<>
			{userData && (
				<div className="grid-profile-container">
					<h2 className="grid-item">User Data</h2>
					<p className="grid-item">ID: {userData.id}</p>
					<p className="grid-item">Username: {userData.username}</p>
					<h3 className="grid-item">Highscores:</h3>
					<ul className="grid-item">
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
		</>
	);
};

export default UserForm;
