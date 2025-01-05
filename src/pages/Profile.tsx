import { NavigateFunction, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import React, { useState } from "react";
import LoginForm from "./user/LoginForm";
import { checkUserSession, logoutUser } from "../user/userStorage";
import UserForm from "./user/UserForm";
import { useTranslation } from "react-i18next";
import { useMenu } from "../App";

const ProfileMenu: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const { t } = useTranslation();
	const { setHoveredButton } = useMenu();
	const [, setSessionChecked] = useState<boolean>(false);

	const handleLogOut: () => void = () => {
		logoutUser();
		setSessionChecked((prev) => !prev); // Toggle the state to trigger a re-render
	};

	const handleSessionChange = () => {
		setSessionChecked((prev) => !prev); // Trigger re-render when session changes
	};

	console.debug("Rendering Profile.tsx");
	return (
		<>
			<div className="grid-item" id="title">
				<h1>{t("title")}</h1>
			</div>
			<div className="grid-item" id="back">
				<i
					className="fa-solid fa-arrow-left grid-item"
					onClick={(): void => navigate(-1)}
				></i>
			</div>
			<button className="button grid-item" id="edit">
				Edit
			</button>
			{checkUserSession() !== -1 && (
				<button
					className="button grid-item"
					id="logout"
					onClick={handleLogOut}
				>
					{t("logout")}
				</button>
			)}
			<div id="profile-box" className="grid-item transparent-box">
				{checkUserSession() === -1 ? (
					<LoginForm onSessionChange={handleSessionChange} />
				) : (
					<UserForm onSessionChange={handleSessionChange} />
				)}
			</div>
		</>
	);
};

export default ProfileMenu;
