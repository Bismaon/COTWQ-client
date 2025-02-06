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

const HardMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { setHoveredButton } = useMenu();

	const isInHardMenu: boolean = location.pathname.endsWith("/hard");

	const handleNavigate = (mode: string) => {
		navigate(`${location.pathname}/${mode}`);
	};

	console.debug("Rendering HardMode.tsx");
	return (
		<>
			{isInHardMenu && (
				<>
					<div className="grid-item" id="title">
						<h1> {t("title")}</h1>
					</div>
					<div className="grid-item" id="back">
						<i
							className={`fa-solid fa-arrow-left $"grid-item"`}
							onClick={() => navigate(-1)}
						></i>
					</div>

					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("classic");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("classic-hard")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("classic")}
					</button>
					<button
						className="button grid-item"
						onClick={() => {
							handleNavigate("sequential-random");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("sequential-hard")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("sequential-random")}
					</button>
				</>
			)}

			{!isInHardMenu && <Outlet />}
		</>
	);
};

export default HardMode;
