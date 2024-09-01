import React, { useEffect, useRef } from "react";
import "../../stylesheet/Quiz.css";
import "../../stylesheet/style.css";
import "../../stylesheet/CountryInfo.css";
import { Timer } from "../../utils/Timer";
import {
	cameraFollowCountry,
	handleGiveUp,
	handlePauseStart,
	handleTextboxChange,
} from "../../controls/inputHandlers";
import { setupModelForGame } from "../../scene/sceneManager";
import { continentNames, createTable } from "../../country/countriesTable";
import { countryToFind } from "../../country/Countries";
import { useModel } from "../ModelContext";

const Names: React.FC<{
	isHard: boolean;
	continentIndex: number;
	isClassic: boolean;
}> = ({ isHard, continentIndex, isClassic }) => {
	let isQuizInit = useRef(false);
	let ongoing: boolean = false;
	const gameTimer: Timer = new Timer();
	const gameMode: string =
		continentIndex === -1 ? "base" : continentNames[continentIndex];
	const { isModelLoaded } = useModel();

	useEffect(() => {
		if (isQuizInit.current) {
			return;
		}
		if (!isModelLoaded) {
			return;
		}

		createTable();
		setupModelForGame(isHard, continentIndex);
		isQuizInit.current = true;
	}, [continentIndex, isHard, isModelLoaded]);
	return (
		<>
			<div className="grid-item" id="quiz-controls">
				<div className="quiz-grid-container" id="quiz-controls-table">
					<div className="quiz-grid-item" id="timer">
						00:00:00
					</div>
					<button
						className="quiz-grid-item button"
						id="give-up-btn"
						onClick={(): void => {
							ongoing = !ongoing;
							handleGiveUp(
								continentIndex,
								gameTimer,
								isHard,
								gameMode
							);
						}}
					>
						Give Up
					</button>
					<button
						className="quiz-grid-item button"
						id="quiz-stop-start"
						onClick={(): void => {
							ongoing = !ongoing;
							handlePauseStart(ongoing, gameTimer);
						}}
					>
						Start
					</button>
					<div className="quiz-grid-item" id="answer-box-container">
						<label id="answer-box-prompt" htmlFor="textbox">
							Enter Country's Name:
						</label>
						<input
							type="text"
							id="answer-box-input"
							name="textbox"
							onInput={(): void =>
								handleTextboxChange(gameTimer, gameMode)
							}
							autoComplete="off"
							autoCorrect="off"
						/>
					</div>
					<div className="quiz-grid-item" id="country-counter">
						0&nbsp;/&nbsp;{countryToFind[gameMode]} guessed
					</div>
				</div>
			</div>
			<div className="grid-item" id="quiz-options">
				<div id="checkbox-container">
					<label htmlFor="follow">Follow countries:</label>
					<input
						type="checkbox"
						id="follow"
						name="follow"
						onChange={cameraFollowCountry}
					></input>
				</div>
				<div id="country-name-container"></div>
			</div>
			<div className="grid-item" id="country-continent">
				<div
					className="grid-continent"
					id="country-continent-name-container"
				></div>
			</div>
		</>
	);
};

export default Names;
