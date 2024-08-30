import React from "react";
import {
	NavigateFunction,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import "../stylesheet/style.css";

const SizeMode: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();

	const isInSizeMode: boolean =
		location.pathname.endsWith("/normal") ||
		location.pathname.endsWith("/africa") ||
		location.pathname.endsWith("/asia") ||
		location.pathname.endsWith("/europe") ||
		location.pathname.endsWith("/oceania") ||
		location.pathname.endsWith("/south_america") ||
		location.pathname.endsWith("/north_america");

	console.debug("Rendering Group Selection");
	return (
		<>
			{isInSizeMode && (
				<>
					<div className="grid-item" id="title">
						<h1>Countries Of The World Quizzes</h1>
					</div>
					<div className="grid-item" id="back">
						<i
							className={`fa-solid fa-arrow-left $"grid-item"`}
							onClick={(): void => navigate(-1)}
						></i>
					</div>
					<button
						className="button grid-item"
						onClick={(): void => navigate("classic")}
					>
						Classic
					</button>
					<button
						className="button grid-item"
						onClick={(): void => navigate("sequential-random")}
					>
						Sequential Random
					</button>
					<button
						className="button grid-item"
						onClick={(): void => navigate("hard")}
					>
						Hard
					</button>
				</>
			)}

			{!isInSizeMode && <Outlet />}
		</>
	);
};

export default SizeMode;
