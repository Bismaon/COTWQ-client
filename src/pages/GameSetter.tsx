// GameSetter.tsx
import React from "react";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import Currencies from "./gamemodes/Currencies";
import Languages from "./gamemodes/Languages";
import Capitals from "./gamemodes/Capitals";
import { resetModel } from "../scene/sceneManager";
import GlobalGameMode from "./GlobalGameMode";

const GameSetter: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const continentNames: string[] = [
		"africa",
		"antarctic",
		"asia",
		"europe",
		"north_america",
		"oceania",
		"south_america",
	];

	function getGameMode() {
		const pathSegments: string[] = location.pathname.split("/");
		const hasContinents: number = pathSegments.indexOf("continents");
		const continentIndex: number =
			hasContinents !== -1
				? continentNames.indexOf(pathSegments[hasContinents + 1])
				: -1;
		const isHardMode: boolean = pathSegments.includes("hard");
		const isClassic: boolean = pathSegments.includes("classic");
		const gameMode: string = pathSegments[pathSegments.length - 1];
		switch (gameMode) {
			case "names":
				return (
					<GlobalGameMode
						hard={isHardMode}
						continentIndex={continentIndex}
						classic={isClassic}
						gameType={gameMode}
					/>
				);
			case "flags":
				return (
					<GlobalGameMode
						hard={isHardMode}
						continentIndex={continentIndex}
						classic={isClassic}
						gameType={gameMode}
					/>
				);
			case "currencies":
				return (
					<Currencies
						isHard={isHardMode}
						continentIndex={continentIndex}
						isClassic={isClassic}
					/>
				);
			case "languages":
				return (
					<Languages
						isHard={isHardMode}
						continentIndex={continentIndex}
						isClassic={isClassic}
					/>
				);
			case "capitals":
				return (
					<Capitals
						isHard={isHardMode}
						continentIndex={continentIndex}
						isClassic={isClassic}
					/>
				);
		}
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
