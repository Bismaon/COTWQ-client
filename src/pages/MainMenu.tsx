//Menus.tsx

import React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";

const MainMenu: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();

	console.debug("Rendering Main Menu");
	return (
		<>
			<div className="grid-item" id="title">
				<h1>Countries Of The World Quizzes</h1>
			</div>
			<div className="grid-item" id="back"></div>
			<button
				className="button grid-item"
				onClick={() => navigate("games")}
			>
				Games
			</button>
			<button
				className="button grid-item"
				onClick={() => navigate("high-scores")}
			>
				High Scores
			</button>
			<button
				className="button grid-item"
				onClick={() => navigate("settings")}
			>
				Settings
			</button>
			<button
				className="button grid-item"
				onClick={() => navigate("profile")}
			>
				Profile
			</button>
		</>
	);
};

export default MainMenu;
