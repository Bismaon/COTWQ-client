// ContinentsMode.tsx
import React from "react";
import {
	NavigateFunction,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import "../stylesheet/style.css";

const ContinentsMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();

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
						<h1>Countries Of The World Quizzes</h1>
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
						Africa
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("south_america")}
					>
						South America
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("north_america")}
					>
						North America
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("asia")}
					>
						Asia
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("europe")}
					>
						Europe
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("oceania")}
					>
						Oceania
					</button>
				</>
			)}

			{!isInContinentsMenu && <Outlet />}
		</>
	);
};
export default ContinentsMode;
