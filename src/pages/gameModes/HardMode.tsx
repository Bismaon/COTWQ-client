import React from "react";
import {
	NavigateFunction,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import "../../stylesheet/Menus.css";
import "../../stylesheet/style.css";

const HardMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();

	const isInHardMenu: boolean = location.pathname.endsWith("/hard");

	const handleNavigate = (mode: string) => {
		navigate(`${location.pathname}/${mode}`);
	};

	console.debug("Rendering Hard Mode Menu");
	return (
		<>
			{isInHardMenu && (
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
							onClick={() => handleNavigate("classic")}
						>
							Classic
						</button>
						<button
							className="button"
							onClick={() => handleNavigate("sequential-random")}
						>
							Sequential Random
						</button>
					</div>
				</>
			)}

			{!isInHardMenu && <Outlet />}
		</>
	);
};

export default HardMode;
