import React, { useEffect, useRef } from "react";
import "../stylesheet/Quiz.css";
import "../stylesheet/style.css";
import { Timer } from "../utils/Timer";
import {
	cameraFollowCountry,
	getRegionByNumber,
	handleGiveUp,
	handlePauseStart,
	handleTextboxChange,
	regionMap,
	updateCounter,
} from "../controls/inputHandlers";
import {
	changeCACells,
	continentNames,
	createTableFromType,
	populateFlags,
	randomizedCountries,
	shuffleArray,
} from "../country/countriesTable";
import {
	countriesCountByRegion,
	CountryAttribute,
	currencyByRegion,
	languageByRegion,
	World,
} from "../country/World";
import { useModel } from "./ModelContext";
import { useTranslation } from "react-i18next";
import { getWorld, setupModelForGame } from "../scene/sceneManager";
import { Vector3 } from "three";
import { Country } from "../country/Country";
import {
	correctContinent,
	getCenterCA,
	getObjCenter,
} from "../utils/utilities";
import { cameraFaceTo } from "../camera/camera";
import { TFunction } from "i18next";
import { getUserID, updateHighscore } from "../user/userStorage";

interface gameModeProps {
	hard: boolean;
	continentIndex: number;
	gameType: string;
	sequentialRandom: boolean;
}

const GlobalGameMode: React.FC<gameModeProps> = ({
	hard,
	continentIndex,
	gameType,
	sequentialRandom,
}: gameModeProps): JSX.Element => {
	let isQuizInit: React.MutableRefObject<boolean> = useRef(false);
	let ongoing: boolean = false;
	const gameTimer: Timer = new Timer();
	const region: string =
		continentIndex === -1 ? "all_regions" : continentNames[continentIndex];
	const { isModelLoaded } = useModel();
	const { t } = useTranslation();
	const normal: string = sequentialRandom ? "sequential_random" : "normal";
	const gameName: string =
		region + "-" + normal + "-" + hard + "-" + gameType;

	const answerPromptText: { [gameType: string]: string } = {
		flags: t("answerPromptTextFlags"),
		names: t("answerPromptTextNames"),
		currencies: t("answerPromptTextCurrencies"),
		languages: t("answerPromptTextLanguages"),
		capitals: t("answerPromptTextCapitals"),
	};
	const customPromptFlags = t("customPromptFlags");

	function setupRandomSequentialArray(): void {
		const world: World = getWorld();
		let itemArray;
		let filteredArray;
		switch (gameType) {
			case "currencies":
				itemArray = getWorld().currencyArray;
				filteredArray = itemArray.filter(
					(currency: CountryAttribute): boolean => {
						if (continentIndex !== -1)
							return currency.region.includes(continentIndex);
						return true;
					}
				);
				break;
			case "languages":
				itemArray = getWorld().languageArray;
				filteredArray = itemArray.filter(
					(language: CountryAttribute): boolean => {
						if (continentIndex !== -1)
							return language.region.includes(continentIndex);
						return true;
					}
				);

				break;
			default:
				itemArray = getWorld().countryArray;
				world.sequentialRandomArray = randomizedCountries(
					itemArray,
					continentIndex
				);
				return;
		}
		console.log("Filtered array: ", filteredArray);
		world.sequentialRandomArray = shuffleArray(filteredArray);
	}

	const gameFinishedRef = React.useRef(false); // Use ref to avoid re-renders

	function handleFinishGame(): void {
		if (gameFinishedRef.current) return; // Prevent multiple calls

		const world: World = getWorld();
		const regionNumber: number = regionMap[region];

		// Call the finish game logic (update world state)
		world.finishGame(gameType, regionNumber);

		// Update counter
		const counter: HTMLDivElement = document.getElementById(
			"counter"
		) as HTMLDivElement;
		updateCounter(
			counter,
			world.countriesFound,
			countriesCountByRegion[region]
		);

		// Check if all countries are found and stop the timer
		if (
			!["currencies", "languages"].includes(gameType) &&
			world.isAllFound(region)
		) {
			gameTimer.stop();
			const completionTime: string = gameTimer.toString();
			const userID: number = getUserID();
			const timerStore: string = gameTimer.toStore();

			// Display success message
			alert(`Congratulations! You finished in ${completionTime}!`);

			// Update highscore
			updateHighscore(userID, gameName, timerStore).then((r) =>
				console.debug("Highscore updated: ", timerStore)
			);

			gameFinishedRef.current = true; // Set ref to prevent further calls
		} else if (["currencies", "languages"].includes(gameType)) {
			let type: string =
				gameType === "currencies" ? "currency" : "language";
			world.allCountryAttributeFound(type, regionNumber);
		} else {
			alert("There are still some countries left to find!");
		}
	}

	function renderOptions(
		gameType: string,
		t: TFunction<"translation", undefined>
	): React.JSX.Element {
		switch (gameType) {
			case "names" || "flags":
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
						<div id="quiz-feedback-container"></div>
						<div id="country-name-container"></div>
						{/* <button
							className="quiz-grid-item button"
							id="finish-game-btn"
							onClick={handleFinishGame}
						>
							Finish Game
						</button> */}
					</div>
				);
			default:
				return (
					<div className="grid-item" id="quiz-options">
						<div id="country-name-container"></div>
					</div>
				);
		}
	}

	useEffect((): void => {
		if (isQuizInit.current) {
			return;
		}
		if (!isModelLoaded) {
			return;
		}

		console.debug(`Creating table from type: ${gameType}.`);
		createTableFromType(gameType, t, region, hard);
		console.debug(`Created table for ${gameType}.`);
		setupModelForGame(hard, continentIndex, gameType);
		switch (gameType) {
			case "flags":
				populateFlags(
					continentIndex,
					sequentialRandom,
					gameTimer,
					region,
					gameName
				);
				console.debug(`Flags have been added.`);
				break;
			case "currencies":
				changeCACells("unavailable", "currency");
				console.debug("Made answers invisible");
				break;
			case "languages":
				changeCACells("unavailable", "language");
				console.debug("Made answers invisible");
				break;
			default:
				break;
		}
		if (sequentialRandom) {
			setupRandomSequentialArray();

			const world: World = getWorld();
			const firstItem: any = world.sequentialRandomArray[0];
			if (["languages", "currencies"].includes(gameType)) {
				firstItem.selected = true;
				firstItem.locations.forEach((index: number): void => {
					const country: Country = world.countryArray[index];
					if (!correctContinent(continentIndex, country)) return;
					world.setCountryState(index, "selected");
					world.setCountryVisibility(index, true);
				});
				cameraFaceTo(getCenterCA(continentIndex));
			} else {
				const firstIndex: number = world.getRealIndex(
					firstItem.location
				);
				world.setCountryAndConnectedState(firstIndex, "selected");
				world.setCountryAndConnectedVisibility(firstIndex, true);
				cameraFaceTo(getObjCenter(firstItem.object));
			}
		}

		console.debug("Post setups completed.");
		isQuizInit.current = true;
	}, [
		continentIndex,
		gameTimer,
		gameType,
		hard,
		isModelLoaded,
		region,
		sequentialRandom,
		setupRandomSequentialArray,
		t,
	]);

	function renderQuizCounter(gameType: string, region: string): number {
		const regionNumber: number = getRegionByNumber(region);
		switch (gameType) {
			case "currencies":
				return currencyByRegion[regionNumber];
			case "languages":
				return languageByRegion[regionNumber];
			default:
				return countriesCountByRegion[region];
		}
	}

	function handleSequentialMove(direction: number): void {
		if (!ongoing) return;
		const world: World = getWorld();
		const prevIndex: number = world.sequentialRandomIndex;

		direction === -1 ? world.prevInSeqArr() : world.nextInSeqArr();

		const currIndex: number = world.sequentialRandomIndex;

		if (["languages", "currencies"].includes(gameType)) {
			const prevCA: CountryAttribute = world.sequentialRandomArray[
				prevIndex
			] as CountryAttribute;
			prevCA.selected = false;

			prevCA.locations.forEach((index: number): void => {
				const country: Country = world.countryArray[index];
				if (!correctContinent(continentIndex, country)) return;
				if (hard) world.setCountryVisibility(index, false);
				if (prevCA.type === "language") {
					world.applyState(index, prevCA.type);
				} else {
					world.applyState(index, "unknown");
				}
			});
			const currCA: CountryAttribute = world.sequentialRandomArray[
				currIndex
			] as CountryAttribute;
			console.log("Currently selected item: ", currCA);
			currCA.selected = true;
			currCA.locations.forEach((index: number): void => {
				const country: Country = world.countryArray[index];
				if (!correctContinent(continentIndex, country)) return;
				world.setCountryState(index, "selected");
				world.setCountryVisibility(index, true);
			});
			cameraFaceTo(getCenterCA(continentIndex));
		} else {
			const prevCountry: Country = world.sequentialRandomArray[
				prevIndex
			] as Country;
			const prevCountryIndex: number = world.getRealIndex(
				prevCountry.location
			);
			world.setCountryAndConnectedState(
				prevCountryIndex,
				prevCountry.state === "selected" ? "unknown" : prevCountry.state
			);
			if (hard) {
				world.setCountryAndConnectedVisibility(prevCountryIndex, false);
			}

			const currCountry: Country = world.sequentialRandomArray[
				currIndex
			] as Country;
			const currCountryIndex: number = world.getRealIndex(
				currCountry.location
			);
			world.setCountryAndConnectedState(currCountryIndex, "selected");
			world.setCountryAndConnectedVisibility(currCountryIndex, true);
			const objCenter: Vector3 = getObjCenter(currCountry.object);

			cameraFaceTo(objCenter);
		}
	}

	function renderSequentialRandom(): React.JSX.Element {
		if (!sequentialRandom) return <></>;
		return (
			<div className="quiz-grid-item" id="sequential-random-select">
				<i
					className="fa-solid fa-chevron-left chevron"
					onClick={(): void => {
						handleSequentialMove(-1);
					}}
				></i>
				<i
					className="fa-solid fa-chevron-right chevron"
					onClick={(): void => {
						handleSequentialMove(1);
					}}
				></i>
			</div>
		);
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
							ongoing = ongoing ? false : ongoing;
							handleGiveUp(
								continentIndex,
								gameTimer,
								hard,
								region,
								gameType,
								sequentialRandom,
								gameName
							);
						}}
					>
						{t("giveup")}
					</button>
					<button
						className="quiz-grid-item button"
						id="quiz-stop-start"
						onClick={(): void => {
							ongoing = handlePauseStart(ongoing, gameTimer);
							console.log(ongoing);
						}}
					>
						{t("start")}
					</button>

					<div className="quiz-grid-item" id="answer-box-container">
						<label id="answer-box-prompt" htmlFor="textbox">
							{gameType === "flags" && sequentialRandom
								? customPromptFlags
								: answerPromptText[gameType]}
						</label>
						{!(gameType === "flags" && sequentialRandom) && (
							<input
								autoFocus={true}
								type="text"
								id="answer-box-input"
								name="textbox"
								onInput={(): void =>
									handleTextboxChange(
										gameTimer,
										gameType,
										region,
										sequentialRandom,
										gameName
									)
								}
								autoComplete="off"
								autoCorrect="off"
							/>
						)}
					</div>

					<div className="quiz-grid-item" id="counter">
						0&nbsp;/&nbsp; {renderQuizCounter(gameType, region)}
						&nbsp;
						{t("guessed")}
					</div>
					{renderSequentialRandom()}
				</div>
			</div>
			{renderRightSide(gameType)}
			{renderOptions(gameType, t)}
			<div className="grid-item" id="hint-answer">
				<div className="grid" id="hint-answer-container"></div>
			</div>
		</>
	);
};

function renderRightSide(gameType: string): JSX.Element {
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

export default GlobalGameMode;

/* TODO LIST
 * - FLAGS IMPORTANT
 * - For flags/sequential/normal : user selects the flag associated with the country highlighted on the globe
 * - For flags/sequential/hard : like in normal maybe on top of the country not
 *   showing the user has to enter the country name assocated with the flag
 *  */
