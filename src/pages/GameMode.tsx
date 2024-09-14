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

const GameMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const { t, i18n } = useTranslation();

	const isInGameMode =
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
						onClick={() => handleNavigate("names")}
					>
						{t("names")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("flags")}
					>
						{t("flags")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("languages")}
					>
						{t("languages")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("currencies")}
					>
						{t("currencies")}
					</button>
					<button
						className="button grid-item"
						onClick={() => navigate("capitals")}
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
