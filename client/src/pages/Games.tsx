//Games.tsx
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../stylesheet/Menus.css";
import "../stylesheet/style.css";

const Games: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Determine if we are on a specific game mode path
	const isInGameMode = location.pathname === "/games";

	console.debug("Rendering Games Menu");
	return (
		<>
			{/* Render initial Games Menu only if not in a game mode */}
			{isInGameMode && (
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
					<div className="grid-item" id="menu">
						<button
							className="button"
							onClick={() => navigate("normal")}
						>
							Normal
						</button>
						<button
							className="button"
							onClick={() => navigate("continents")} //! SCENE HAS CONTINENT CHILDREN
						>
							Continents
						</button>
					</div>
				</>
			)}

			{/* Outlet will render the selected game mode menu and replace the current menu */}
			{!isInGameMode && <Outlet />}
		</>
	);
};

export default Games;
