//Games.tsx
import React from "react";
import {
	NavigateFunction,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import "../stylesheet/style.css";
import { useTranslation } from "react-i18next";

const Games: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	// Determine if we are on a specific game mode path
	const isInGameMode: boolean = location.pathname === "/games";

	console.debug("Rendering Games.tsx");
	return (
		<>
			{isInGameMode && (
				<>
					<div className="grid-item" id="title">
						<h1>{t("title")}</h1>
					</div>
					<div className="grid-item" id="back">
						<i
							className={`fa-solid fa-arrow-left $"grid-item"`}
							onClick={() => navigate(-1)}
						></i>
					</div>
					<button
						className="button grid-item"
						onClick={() => navigate("normal")}
					>
						{t("normal")}
					</button>
					<button
						className="button grid-item"
						onClick={() => navigate("continents")}
					>
						{t("continents")}
					</button>
				</>
			)}

			{!isInGameMode && <Outlet />}
		</>
	);
};

export default Games;
