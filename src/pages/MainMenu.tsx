//Menus.tsx

import React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import { useTranslation } from "react-i18next";

const MainMenu: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const { t, i18n } = useTranslation();
	console.debug("Rendering MainMenu.tsx");
	return (
		<>
			<div className="grid-item" id="title">
				<h1>{t("title")}</h1>
			</div>
			<div className="grid-item" id="back"></div>
			<button
				className="button grid-item"
				onClick={() => navigate("games")}
			>
				{t("games")}
			</button>
			<button
				className="button grid-item"
				onClick={() => navigate("high-scores")}
			>
				{t("highscores")}
			</button>
			<button
				className="button grid-item"
				onClick={() => navigate("settings")}
			>
				{t("settings")}
			</button>
			<button
				className="button grid-item"
				onClick={() => navigate("profile")}
			>
				{t("profile")}
			</button>
		</>
	);
};

export default MainMenu;
