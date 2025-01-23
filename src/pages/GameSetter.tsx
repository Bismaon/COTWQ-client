// GameSetter.tsx
import React from "react";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import { resetModel } from "../scene/sceneManager";
import GlobalGameMode from "./GlobalGameMode";
import { continentNames } from "../utils/constants";

const GameSetter: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	function getGameMode() {
		const pathSegments: string[] = location.pathname.split("/");
		const hasContinents: number = pathSegments.indexOf("continents");
		const region: number =
			hasContinents !== -1
				? continentNames.indexOf(pathSegments[hasContinents + 1])
				: 7;
		const isHardMode: boolean = pathSegments.includes("hard");
		const sequentialRandom: boolean =
			pathSegments.includes("sequential-random");
		const gameMode: string = pathSegments[pathSegments.length - 1];
		console.debug("Game type: ", gameMode);
		return (
			<GlobalGameMode
				hard={isHardMode}
				region={region}
				gameType={gameMode}
				sequentialRandom={sequentialRandom}
			/>
		);
	}

	const navigateBack = (): void => {
		resetModel();
		navigate(-1);
	};

	console.debug("Rendering GameSetter.tsx");
	return (
		<>
			<div className="grid-item" id="back">
				<i
					className="fa-solid fa-arrow-left grid-item"
					onClick={() => navigateBack()}
				></i>
			</div>
			{getGameMode()}
		</>
	);
};
export default GameSetter;
