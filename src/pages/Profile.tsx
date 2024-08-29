import { NavigateFunction, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import React, { useState } from "react";
import LoginForm from "./user/LoginForm";
import { checkUserSession, logoutUser } from "../user/userStorage";
import UserForm from "./user/UserForm";

const ProfileMenu: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	console.debug("Rendering ProfileMenu");

	const [sessionChecked, setSessionChecked] = useState<boolean>(false);

	const handleLogOut = () => {
		logoutUser();
		setSessionChecked((prev) => !prev); // Toggle the state to trigger a re-render
	};

	const handleSessionChange = () => {
		setSessionChecked((prev) => !prev); // Trigger re-render when session changes
	};

	return (
		<>
			<div className="grid-item" id="title">
				<h1>Countries Of The World Quizzes</h1>
			</div>
			<div className="grid-item" id="back">
				<i
					className="fa-solid fa-arrow-left grid-item"
					onClick={(): void => navigate(-1)}
				></i>
			</div>
			<div className="grid-item" id="menu">
				<button className="button">Edit</button>
				{checkUserSession() !== -1 && (
					<button className="button" onClick={handleLogOut}>
						Logout
					</button>
				)}
			</div>
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
