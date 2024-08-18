import React, { useEffect, useState } from "react";
import "../../stylesheet/Quiz.css";
import "../../stylesheet/style.css";
import { Timer } from "../../utils/Timer";

import { toggleIsPlaying } from "../../controls/toggleControls";
import {
	followCountry,
	handleTextboxChange,
} from "../../controls/inputHandlers";
import { setupModelForGame } from "../../scene/sceneManager";

const Names: React.FC<{
	isHard: boolean;
	continentIndex: number;
	isClassic: boolean;
}> = ({ isHard, continentIndex, isClassic }) => {
	const [isQuizStarted, setIsQuizStarted] = useState(false);
	const [gameTimer, setGameTimer] = useState<Timer | null>(null);

	setupModelForGame(isHard, continentIndex);
	useEffect(() => {
		const timer = new Timer();
		setGameTimer(timer);

		// Clean up the timer when the component unmounts
		return () => {
			timer.stop();
		};
	}, []);

	useEffect(() => {
		if (gameTimer) {
			if (isQuizStarted) {
				gameTimer.start();
			} else {
				gameTimer.stop();
			}
		}
	}, [isQuizStarted, gameTimer]);

	const handleStart = () => {
		setIsQuizStarted(true);
		const answerContainer: HTMLElement | null = document.getElementById(
			"answer-box-container"
		);
		const timerCell: HTMLElement | null = document.getElementById("timer");
		const giveUp: HTMLElement | null =
			document.getElementById("give-up-btn");
		const countryCounter: HTMLElement | null =
			document.getElementById("country-counter");

		if (answerContainer) answerContainer.style.display = "block";
		else {
			console.error("No answer box container found.");
		}
		if (timerCell) timerCell.style.display = "block";
		else {
			console.error("No timer cell found.");
		}
		if (giveUp) giveUp.style.display = "block";
		else {
			console.error("No give up button found.");
		}
		if (countryCounter) countryCounter.style.display = "block";
		else {
			console.error("No country counter div found.");
		}
		toggleIsPlaying();
	};

	const handlePause = () => {
		setIsQuizStarted(false);
		const answerContainer: HTMLElement | null = document.getElementById(
			"answer-box-container"
		);
		const timerCell: HTMLElement | null = document.getElementById("timer");
		const giveUp: HTMLElement | null =
			document.getElementById("give-up-btn");
		const countryCounter: HTMLElement | null =
			document.getElementById("country-counter");
		if (answerContainer) answerContainer.style.display = "none";
		else {
			console.error("No answer box container found.");
		}
		if (timerCell) timerCell.style.display = "none";
		else {
			console.error("No timer cell found.");
		}
		if (giveUp) giveUp.style.display = "none";
		else {
			console.error("No give up button found.");
		}
		if (countryCounter) countryCounter.style.display = "none";
		else {
			console.error("No country counter div found.");
		}
		toggleIsPlaying();
	};

	return (
		<>
			<div className="grid-item" id="quiz-controls">
				<div className="quiz-grid-container" id="quiz-controls-table">
					<div className="quiz-grid-item" id="timer">
						00:00:00
					</div>
					<button className="quiz-grid-item button" id="give-up-btn">
						Give Up
					</button>
					{!isQuizStarted ? (
						<button
							className="quiz-grid-item button"
							id="quiz-stop-start"
							onClick={handleStart}
						>
							Start
						</button>
					) : (
						<button
							className="quiz-grid-item button"
							id="quiz-stop-start"
							onClick={handlePause}
						>
							Pause
						</button>
					)}
					<div className="quiz-grid-item" id="answer-box-container">
						<label id="answer-box-prompt" htmlFor="textbox">
							Enter Country's Name:
						</label>
						<input
							type="text"
							id="answer-box-input"
							name="textbox"
							onInput={(event) =>
								handleTextboxChange(event, gameTimer)
							}
							autoComplete="off"
							autoCorrect="off"
						/>
					</div>
					<div className="quiz-grid-item" id="country-counter">
						0&nbsp;/&nbsp;191 guessed
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
						onChange={followCountry}
					></input>
				</div>
				<div id="country-name-container"></div>
			</div>
			{isHard && (
				<div className="grid-item" id="country-container">
					<h2>Not ready yet, need to implement game creation</h2>
				</div>
			)}
		</>
	);
};

export default Names;
