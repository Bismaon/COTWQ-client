// ContinentsMode.tsx
import React from "react";
import {
	NavigateFunction,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import "../stylesheet/style.css";
import { useTranslation } from "react-i18next";

const ContinentsMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	const isInContinentsMenu: boolean =
		location.pathname.endsWith("/continents");

	const handleNavigate = (mode: string): void => {
		navigate(`${location.pathname}/${mode}`);
	};

	console.debug("Rendering ContinentsMode.tsx");
	return (
		<>
			{isInContinentsMenu && (
				<>
					<div className="grid-item" id="title">
						<h1>{t("title")}</h1>
					</div>
					<div className="grid-item" id="back">
						<i
							className="fa-solid fa-arrow-left grid-item"
							onClick={() => navigate(-1)}
						></i>
					</div>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("africa")}
					>
						{t("africa")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("south_america")}
					>
						{t("southamerica")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("north_america")}
					>
						{t("northamerica")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("asia")}
					>
						{t("asia")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("europe")}
					>
						{t("europe")}
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("oceania")}
					>
						{t("oceania")}
					</button>
				</>
			)}

			{!isInContinentsMenu && <Outlet />}
		</>
	);
};
export default ContinentsMode;
