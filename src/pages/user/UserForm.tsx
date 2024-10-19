import React, { useEffect, useState } from "react";
import { User } from "../../user/User";
import { checkUserSession, getUser } from "../../user/userStorage";
import { useTranslation } from "react-i18next";
import { formatGameName } from "../../utils/utilities";

interface UserFormProps {
	onSessionChange: () => void; // Callback to notify parent about session change
}

const UserForm: React.FC<UserFormProps> = ({ onSessionChange }) => {
	const [userIsSet, setUserIsSet] = useState(false);
	const [userID, setUserID] = useState<number>();
	const [userData, setUserData] = useState<User | null>(null);
	const [error, setError] = useState<string>("");
	const { t } = useTranslation();

	useEffect((): void => {
		console.log("user is set? ", userIsSet);
		if (!userIsSet && !userData) {
			const id: number = checkUserSession();
			console.log("ID: ", id);
			if (id !== -1) {
				setUserID(id);
				setUserData(getUser());
				console.log("Here how many times?");
				setUserIsSet(true); // This will ensure the second useEffect is triggered only once
			}
		}
	}, [userIsSet]);

	console.debug("Rendering UserForm.tsx");

	return (
		<>
			{userData && (
				<div className="grid-profile-container">
					<h2 className="grid-item">{t("userdata")}</h2>
					<p className="grid-item">ID: {userData.id}</p>
					<p className="grid-item">
						{t("username")}: {userData.username}
					</p>
					<h3 className="grid-item">{t("highscores")}:</h3>
					<ul className="grid-item">
						{userData.highscores
							.getFormattedEntries()
							.map(
								([game, score]: [
									string,
									string,
								]): JSX.Element => {
									const formatedGameName: string =
										formatGameName(game);
									console.log("game: " + formatedGameName);
									console.log("score: " + score);
									return (
										<li key={game}>
											{formatedGameName}: {score}
										</li>
									);
								}
							)}
					</ul>
				</div>
			)}

			{error && <p style={{ color: "red" }}>{error}</p>}
		</>
	);
};

export default UserForm;
