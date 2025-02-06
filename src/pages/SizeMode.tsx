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

const SizeMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { setHoveredButton } = useMenu();

	const isInSizeMode: boolean =
		location.pathname.endsWith("/normal") ||
		location.pathname.endsWith("/africa") ||
		location.pathname.endsWith("/asia") ||
		location.pathname.endsWith("/europe") ||
		location.pathname.endsWith("/oceania") ||
		location.pathname.endsWith("/south_america") ||
		location.pathname.endsWith("/north_america");

	console.debug("Rendering SizeMode.tsx");
	return (
		<>
			{isInSizeMode && (
				<>
					<div className="grid-item" id="title">
						<h1>{t("title")}</h1>
					</div>
					<div className="grid-item" id="back">
						<i
							className={`fa-solid fa-arrow-left $"grid-item"`}
							onClick={(): void => navigate(-1)}
						></i>
					</div>
					<button
						className="button grid-item"
						onClick={(): void => {
							navigate("classic");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("classic")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("classic")}
					</button>
					<button
						className="button grid-item"
						onClick={(): void => {
							navigate("sequential-random");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("sequential")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("sequential-random")}
					</button>
					<button
						className="button grid-item"
						onClick={(): void => {
							navigate("hard");
							setHoveredButton(null);
						}}
						onMouseEnter={() => setHoveredButton("hard")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						{t("hard")}
					</button>
				</>
			)}

			{!isInSizeMode && <Outlet />}
		</>
	);
};

export default SizeMode;
