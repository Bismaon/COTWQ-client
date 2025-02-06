//Menus.tsx

import React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import { useTranslation } from "react-i18next";
import { useMenu } from "../App";

const MainMenu: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const { t } = useTranslation();
	const { setHoveredButton } = useMenu();

	console.debug("Rendering MainMenu.tsx");

	return (
		<>
			<div className="grid-item" id="title">
				<h1>{t("title")}</h1>
			</div>
			<div className="grid-item" id="back"></div>
			<button
				className="button grid-item"
				onClick={() => {
					navigate("games");
					setHoveredButton(null);
				}}
				onMouseEnter={() => setHoveredButton("games")}
				onMouseLeave={() => setHoveredButton(null)}
			>
				{t("games")}
			</button>
			<button
				className="button grid-item"
				onClick={() => {
					navigate("highscores");
					setHoveredButton(null);
				}}
				onMouseEnter={() => setHoveredButton("highscores")}
				onMouseLeave={() => setHoveredButton(null)}
			>
				{t("highscores")}
			</button>
			<button
				className="button grid-item"
				onClick={() => {
					navigate("settings");
					setHoveredButton(null);
				}}
				onMouseEnter={() => setHoveredButton("settings")}
				onMouseLeave={() => setHoveredButton(null)}
			>
				{t("settings")}
			</button>
			<button
				className="button grid-item"
				onClick={() => {
					navigate("profile");
					setHoveredButton(null);
				}}
				onMouseEnter={() => setHoveredButton("profile")}
				onMouseLeave={() => setHoveredButton(null)}
			>
				{t("profile")}
			</button>
		</>
	);
};

export default MainMenu;
