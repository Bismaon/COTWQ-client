import React, { useEffect, useRef } from "react";
import "../../stylesheet/style.css";
import "../../stylesheet/Quiz.css";
import {
	cameraFollowCountry,
	handleGiveUp,
	handlePauseStart,
	handleTextboxChange,
} from "../../controls/inputHandlers";
import { countriesCountByRegion } from "../../country/World";
import { Timer } from "../../utils/Timer";
import {
	continentNames,
	createTable,
	populateFlags,
} from "../../country/countriesTable";
import { setupModelForGame } from "../../scene/sceneManager";
import { useModel } from "../ModelContext";

const Flags: React.FC<{
	isHard: boolean;
	continentIndex: number;
	isClassic: boolean;
}> = ({ isHard, continentIndex, isClassic }) => {
	let isQuizInit = useRef(false);
	let ongoing: boolean = false;
	const gameTimer: Timer = new Timer();
	const region: string =
		continentIndex === -1 ? "all_regions" : continentNames[continentIndex];
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
		populateFlags(continentIndex);
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
								// TODO re-add country svgFlag
								continentIndex,
								gameTimer,
								isHard,
								region
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
							Enter Flag's name:
						</label>
						<input
							type="text"
							id="answer-box-input"
							name="textbox"
							onInput={(): void => {
								handleTextboxChange(gameTimer, region, "flag");
							}}
							autoComplete="off"
							autoCorrect="off"
						/>
					</div>
					<div className="quiz-grid-item" id="country-counter">
						0&nbsp;/&nbsp;{countriesCountByRegion[continentIndex]}{" "}
						guessed
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
			<div
				className="grid-item grid-item-list-container"
				id="item-list"
			></div>

			<div className="grid-item" id="country-continent">
				<div
					className="grid-continent"
					id="country-continent-name-container"
				></div>
			</div>
		</>
	);
};

export default Flags;
