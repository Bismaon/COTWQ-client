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
import { useMenu } from "../App";

const ContinentsMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { setHoveredButton } = useMenu();

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
						onClick={() => {
							handleNavigate("africa");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("AF")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("africa")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("south_america");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("SA")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("southamerica")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("north_america");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("NA")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("northamerica")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("asia");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("AS")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("asia")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("europe");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("EU")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("europe")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("oceania");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("OC")}
						onMouseLeave={() => setHoveredButton(null)}
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
