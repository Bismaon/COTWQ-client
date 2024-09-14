import React, { useEffect, useRef } from "react";
import "../stylesheet/Quiz.css";
import "../stylesheet/style.css";
import "../stylesheet/CountryInfo.css";
import { Timer } from "../utils/Timer";
import {
	cameraFollowCountry,
	handleGiveUp,
	handlePauseStart,
	handleTextboxChange,
} from "../controls/inputHandlers";
import { setupModelForGame } from "../scene/sceneManager";
import {
	continentNames,
	createTable,
	populateFlags,
} from "../country/countriesTable";
import { countriesCountByRegion } from "../country/World";
import { useModel } from "./ModelContext";
import { useTranslation } from "react-i18next";

interface gameModeProps {
	hard: boolean;
	continentIndex: number;
	classic: boolean;
	gameType: string;
}

const GlobalGameMode: React.FC<gameModeProps> = ({
	hard,
	continentIndex,
	classic,
	gameType,
}: gameModeProps) => {
	let isQuizInit = useRef(false);
	let ongoing: boolean = false;
	const gameTimer: Timer = new Timer();
	const region: string =
		continentIndex === -1 ? "all_regions" : continentNames[continentIndex];
	const { isModelLoaded } = useModel();
	const { t, i18n } = useTranslation();

	const answerPromptText: { [gameType: string]: string } = {
		flags: t("answerPromptTextFlags"),
		names: t("answerPromptTextNames"),
		currencies: t("answerPromptTextCurrencies"),
		languages: t("answerPromptTextLanguages"),
		capitals: t("answerPromptTextCapitals"),
	};
	function preSetups(gameType: string): void {
		switch (gameType) {
			case "names":
				createTable();
				break;
			case "flags":
				createTable();
				break;
			case "currencies":
				// setup for currencies
				break;
			case "languages":
				// setup for currencies
				break;
			case "capitals":
				// setup for currencies
				break;
			default:
				break;
		}
	}

	function postSetups(gameType: string): void {
		switch (gameType) {
			case "flags":
				populateFlags();
				break;
			default:
				break;
		}
	}

	useEffect(() => {
		if (isQuizInit.current) {
			return;
		}
		if (!isModelLoaded) {
			return;
		}

		console.debug(`Setups for ${gameType}.`);
		preSetups(gameType);
		console.debug("Pre setups completed.");
		setupModelForGame(hard, continentIndex);
		postSetups(gameType);
		console.debug("Post setups completed.");
		isQuizInit.current = true;
	}, [continentIndex, gameType, hard, isModelLoaded]);
	function renderQuizCounter(gameType: string): React.JSX.Element {
		switch (gameType) {
			case "currencies":
				return (
					<div className="quiz-grid-item" id="currency-counter">
						0&nbsp;/&nbsp; NOT IMPLEMENTED YET guessed
					</div>
				);
			case "languages":
				return (
					<div className="quiz-grid-item" id="language-counter">
						0&nbsp;/&nbsp; NOT IMPLEMENTED YET guessed
					</div>
				);
			default:
				return (
					<div className="quiz-grid-item" id="country-counter">
						0&nbsp;/&nbsp;{countriesCountByRegion[region]}{" "}
						{t("guessed")}
					</div>
				);
		}
	}

	function renderOptions(gameType: string): React.JSX.Element {
		switch (gameType) {
			case "currencies":
				return (
					<div className="grid-item" id="quiz-options">
						<div id="country-name-container"></div>
					</div>
				);
			case "languages":
				return (
					<div className="grid-item" id="quiz-options">
						<div id="country-name-container"></div>
					</div>
				);
			default:
				return (
					<div className="grid-item" id="quiz-options">
						<div id="checkbox-container">
							<label htmlFor="follow">{t("follow")}</label>
							<input
								type="checkbox"
								id="follow"
								name="follow"
								onChange={cameraFollowCountry}
							></input>
						</div>
						<div id="country-name-container"></div>
					</div>
				);
		}
	}

	function renderAnswers(gameType: string): React.JSX.Element {
		switch (gameType) {
			case "currencies":
				return (
					<div className="grid-item" id="country-continent">
						<div
							className="grid-continent"
							id="country-continent-name-container"
						></div>
					</div>
				);
			default:
				return (
					<div className="grid-item" id="country-continent">
						<div
							className="grid-continent"
							id="country-continent-name-container"
						></div>
					</div>
				);
		}
	}

	function renderRightSide(gameType: string) {
		switch (gameType) {
			case "flags":
				return (
					<div
						className="grid-item grid-item-list-container"
						id="item-list"
					></div>
				);
			default:
				return <></>;
		}
	}

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
								hard,
								region,
								gameType
							);
						}}
					>
						{t("giveup")}
					</button>
					<button
						className="quiz-grid-item button"
						id="quiz-stop-start"
						onClick={(): void => {
							ongoing = !ongoing;
							handlePauseStart(ongoing, gameTimer);
						}}
					>
						{t("start")}
					</button>
					<div className="quiz-grid-item" id="answer-box-container">
						<label id="answer-box-prompt" htmlFor="textbox">
							{answerPromptText[gameType]}
						</label>
						<input
							type="text"
							id="answer-box-input"
							name="textbox"
							onInput={(): void =>
								handleTextboxChange(gameTimer, region, gameType)
							}
							autoComplete="off"
							autoCorrect="off"
						/>
					</div>
					{renderQuizCounter(gameType)}
				</div>
			</div>
			{renderRightSide(gameType)}
			{renderOptions(gameType)}
			{renderAnswers(gameType)}
		</>
	);
};

export default GlobalGameMode;
