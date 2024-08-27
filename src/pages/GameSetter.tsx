// GameSetter.tsx
import React from "react";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import "../stylesheet/Quiz.css";
import "../stylesheet/style.css";
import Names from "./Names";
import Currencies from "./Currencies";
import Flags from "./Flags";
import Languages from "./Languages";
import Capitals from "./Capitals";
import { resetModel } from "../scene/sceneManager";

const GameSetter: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	const location = useLocation();
	const continentNames: string[] = [
		"africa",
		"america",
		"antarctic",
		"asia",
		"oceania",
		"europe",
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
					<Names
						isHard={isHardMode}
						continentIndex={continentIndex}
						isClassic={isClassic}
					/>
				);
			case "flags":
				return (
					<Flags
						isHard={isHardMode}
						continentIndex={continentIndex}
						isClassic={isClassic}
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

	console.debug("Rendering Game Setter");
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
