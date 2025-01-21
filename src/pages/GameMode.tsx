// GameMode.tsx
import React from "react";
import {
	NavigateFunction,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import "../stylesheet/style.css";
import { useTranslation } from "react-i18next";
import { useMenu } from "../App";
import {
	CAPITALS,
	CURRENCIES,
	FLAGS,
	LANGUAGES,
	NAMES,
} from "../utils/constants";

const GameMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { setHoveredButton } = useMenu();

	const hardMode: string = location.pathname.includes("/hard") ? "-hard" : "";
	const sequential: string = location.pathname.includes("sequential-random")
		? "-sequential"
		: "";
	const isInGameMode: boolean =
		location.pathname.endsWith("/classic") ||
		location.pathname.endsWith("/sequential-random");

	const handleNavigate = (mode: string): void => {
		navigate(`${location.pathname}/${mode}`);
	};

	console.debug("Rendering GameMode.tsx");
	return (
		<>
			{isInGameMode && (
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
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate(NAMES);
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton(NAMES + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t(NAMES)}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate(FLAGS);
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton(FLAGS + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t(FLAGS)}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate(LANGUAGES);
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton(LANGUAGES + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t(LANGUAGES)}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate(CURRENCIES);
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton(CURRENCIES + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t(CURRENCIES)}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							navigate(CAPITALS);
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton(CAPITALS + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t(CAPITALS)}
					</button>
				</>
			)}

			{!isInGameMode && <Outlet />}
		</>
	);
};
export default GameMode;
