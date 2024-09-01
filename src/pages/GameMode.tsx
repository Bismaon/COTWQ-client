// GameMode.tsx
import React from "react";
import {
	NavigateFunction,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import "../stylesheet/style.css";

const GameMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();

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
						<h1>Countries Of The World Quizzes</h1>
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
						Names
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("flags")}
					>
						Flags
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("languages")}
					>
						Languages
					</button>
					<button
						className="button grid-item"
						onClick={() => handleNavigate("currencies")}
					>
						Currencies
					</button>
					<button
						className="button grid-item"
						onClick={() => navigate("capitals")}
					>
						Capitals
					</button>
				</>
			)}

			{!isInGameMode && <Outlet />}
		</>
	);
};
export default GameMode;
