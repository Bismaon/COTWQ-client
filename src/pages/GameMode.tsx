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
							handleNavigate("names");
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton("names" + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("names")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("flags");
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton("flags" + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("flags")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("languages");
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton(
								"languages" + hardMode + sequential
							)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("languages")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("currencies");
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton(
								"currencies" + hardMode + sequential
							)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("currencies")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							navigate("capitals");
							setHoveredButton(null);
						}}
						onMouseEnter={() =>
							setHoveredButton("capitals" + hardMode + sequential)
						}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("capitals")}
					</button>
				</>
			)}

			{!isInGameMode && <Outlet />}
		</>
	);
};
export default GameMode;
