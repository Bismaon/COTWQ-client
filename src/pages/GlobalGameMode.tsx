import React, { useEffect, useRef } from "react";
import "../stylesheet/Quiz.css";
import "../stylesheet/style.css";
import { Timer } from "../utils/Timer";
import {
	cameraFollowCountry,
	finishGameProcessing,
	getRegionByNumber,
	handleGiveUp,
	handlePauseStart,
	handleTextboxChange,
	updateCounter,
} from "../controls/inputHandlers";
import {
	changeCACells,
	createTableFromType,
	populateFlags,
	shuffleMap,
} from "../utils/countryUtils";
import { World } from "../country/World";
import { useModel } from "./ModelContext";
import { useTranslation } from "react-i18next";
import { getWorld, setupModelForGame } from "../scene/sceneManager";
import { Vector3 } from "three";
import { Country } from "../country/Country";
import {
	correctContinent,
	getCenterCA,
	getNthItem,
	getObjCenter,
} from "../utils/utilities";
import { cameraFaceTo } from "../camera/camera";
import { TFunction } from "i18next";
import {
	CAPITALS,
	countriesCountByRegion,
	CURRENCIES,
	CURRENCY,
	currencyByRegion,
	FLAGS,
	LANGUAGE,
	languageByRegion,
	LANGUAGES,
	NAMES,
	regionMap,
	UNAVAILABLE,
	UNKNOWN,
} from "../utils/constants";
import { Currency } from "../country/Currency";
import { Language } from "../country/Language";
import { AttributeStructure } from "../country/AttributeStructure";
import { countryLoc } from "../utils/types";

interface gameModeProps {
	hard: boolean;
	region: number;
	gameType: string;
	sequentialRandom: boolean;
}

const GlobalGameMode: React.FC<gameModeProps> = ({
	hard,
	region,
	gameType,
	sequentialRandom,
}: gameModeProps): JSX.Element => {
	let isQuizInit: React.MutableRefObject<boolean> = useRef(false);
	let ongoing: boolean = false;
	const gameTimer: Timer = new Timer();
	const { isModelLoaded } = useModel();
	const { t } = useTranslation();
	const normal: string = sequentialRandom ? "sequential_random" : "normal";

	const regionString: string =
		region !== -1
			? (getNthItem(regionMap, region) as [string, number])[0]
			: "all_regions";
	const gameName: string =
		regionString + "-" + normal + "-" + hard + "-" + gameType;

	const answerPromptText: { [gameType: string]: string } = {
		flags: t("answerPromptTextFlags"),
		names: t("answerPromptTextNames"),
		currencies: t("answerPromptTextCurrencies"),
		languages: t("answerPromptTextLanguages"),
		capitals: t("answerPromptTextCapitals"),
	};
	const customPromptFlags: string = t("customPromptFlags");

	function setupRandomSequentialMap(): void {
		const world: World = getWorld();
		let selectMap: Map<number, any> = new Map();
		switch (gameType) {
			case CURRENCIES:
				world.currencies.forEach(
					(currency: Currency, index: number): void => {
						if (currency.isInRegion(region)) {
							selectMap.set(index, currency);
						}
					}
				);
				break;
			case LANGUAGES:
				world.languages.forEach(
					(lang: Language, index: number): void => {
						if (lang.isInRegion(region)) {
							selectMap.set(index, lang);
						}
					}
				);
				break;
			default:
				world.countries.forEach(
					(country: Country, index: number): void => {
						if (country.isInRegion(region)) {
							selectMap.set(index, country);
						}
					}
				);
				break;
		}
		console.log("Filtered map: ", selectMap);
		world.sequentialRandomMap = shuffleMap(selectMap);
	}

	const gameFinishedRef = React.useRef(false); // Use ref to avoid re-renders

	function caByRegion(type: string, region: number): number {
		switch (type) {
			case LANGUAGE:
				return languageByRegion[region];
			case CURRENCY:
				return currencyByRegion[region];
			default:
				return 0;
		}
	}

	function handleFinishGame(): void {
		if (gameFinishedRef.current) return; // Prevent multiple calls

		const world: World = getWorld();
		const regionNumber: number = regionMap.get(regionString) as number;
		console.debug(
			"Region: ",
			regionString,
			", regionString number: ",
			regionNumber
		);
		let type: string = gameType === CURRENCIES ? CURRENCY : LANGUAGE;

		// Call the finish game logic (update world state)
		world.finishGame(gameType, regionNumber);

		// Update counter
		const counter: HTMLDivElement = document.getElementById(
			"counter"
		) as HTMLDivElement;

		// Check if all countries are found and stop the timer

		if (
			![CURRENCIES, LANGUAGES].includes(gameType) &&
			world.isAllFound(regionString)
		) {
			finishGameProcessing(gameTimer, gameName);
			gameFinishedRef.current = true; // Set ref to prevent further calls
			updateCounter(
				counter,
				world.countriesFound,
				countriesCountByRegion[regionString]
			);
		} else if ([CURRENCIES, LANGUAGES].includes(gameType)) {
			const res = world.allCountryAttributeFound(type, regionNumber);
			console.debug("All attribute found? ", res);
			if (world.allCountryAttributeFound(type, regionNumber)) {
				finishGameProcessing(gameTimer, gameName);
				gameFinishedRef.current = true; // Set ref to prevent further calls
				updateCounter(
					counter,
					world.getFoundCA(type, regionNumber).size,
					caByRegion(type, regionNumber)
				);
			}
		} else {
			alert("There are still some countries left to find!");
		}
	}

	function RenderOptions(
		gameType: string,
		t: TFunction<"translation", undefined>
	): React.JSX.Element {
		// Check if the URL contains "cotwq"
		const isButtonVisible: boolean =
			!window.location.href.includes("cotwq");

		return (
			<div className="grid-item" id="quiz-options">
				{[NAMES, FLAGS, CAPITALS, CURRENCIES, LANGUAGES].includes(
					gameType
				) && (
					<>
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
						{/* For language mode, have a numbered list with each language being its own part in the code, you'll get it, while the language isn't found the list will contain "??" for each hidden language, once found the placeholder will be changed to the language */}
						<div id="country-name-container"></div>
					</>
				)}
				{/* Render the Finish Game button conditionally */}
				{isButtonVisible && (
					<button
						className="quiz-grid-item button"
						id="finish-game-btn"
						onClick={handleFinishGame}
					>
						Finish Game
					</button>
				)}
			</div>
		);
	}

	useEffect((): void => {
		if (isQuizInit.current) {
			return;
		}
		if (!isModelLoaded) {
			return;
		}

		console.debug(`Creating table from type: ${gameType}.`);
		createTableFromType(gameType, t, regionString, hard);
		console.debug(`Created table for ${gameType}.`);
		setupModelForGame(hard, region, gameType);
		switch (gameType) {
			case FLAGS:
				populateFlags(
					region,
					sequentialRandom,
					gameTimer,
					regionString,
					gameName
				);
				console.debug(`Flags have been added.`);
				break;
			case CURRENCIES:
				changeCACells(UNAVAILABLE, CURRENCY);
				console.debug("Made answers invisible");
				break;
			case LANGUAGES:
				changeCACells(UNAVAILABLE, LANGUAGE);
				console.debug("Made answers invisible");
				break;
			default:
				break;
		}
		if (sequentialRandom) {
			setupRandomSequentialMap();
			const world: World = getWorld();
			const firstItem: any = world.sequentialRandomMap.get(0);
			if ([LANGUAGES, CURRENCIES].includes(gameType)) {
				firstItem.selected = true;
				firstItem.locations.forEach((index: number): void => {
					const country: Country = world.countries.get(
						index
					) as Country;
					if (!correctContinent(region, country)) return;
					world.setCountryState(index, "selected");
					world.setCountryVisibility(index, true);
				});
				cameraFaceTo(getCenterCA(region));
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
		region,
		gameTimer,
		gameType,
		hard,
		isModelLoaded,
		regionString,
		sequentialRandom,
		setupRandomSequentialMap,
		t,
		gameName,
	]);

	function renderQuizCounter(gameType: string, region: string): number {
		const regionNumber: number = getRegionByNumber(region);
		switch (gameType) {
			case CURRENCIES:
				return currencyByRegion[regionNumber];
			case LANGUAGES:
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

		if ([LANGUAGES, CURRENCIES].includes(gameType)) {
			const [, prevCA]: [number, AttributeStructure] = getNthItem(
				world.sequentialRandomMap,
				prevIndex
			) as [number, AttributeStructure];
			prevCA.selected = false;

			prevCA.territories.forEach((loc: countryLoc): void => {
				const index: number = world.getRealIndex(loc);
				const country: Country = world.countries.get(index) as Country;
				if (!correctContinent(region, country)) return;
				if (hard) world.setCountryVisibility(index, false);
				if (prevCA.type === LANGUAGE) {
					world.applyState(index, prevCA.type);
				} else {
					world.applyState(index, UNKNOWN);
				}
			});
			const [, currCA]: [number, AttributeStructure] = getNthItem(
				world.sequentialRandomMap,
				currIndex
			) as [number, AttributeStructure];
			console.log("Currently selected item: ", currCA);
			currCA.selected = true;
			currCA.territories.forEach((loc: countryLoc): void => {
				const index: number = world.getRealIndex(loc);
				const country: Country = world.countries.get(index) as Country;
				if (!correctContinent(region, country)) return;
				world.setCountryState(index, "selected");
				world.setCountryVisibility(index, true);
			});
			cameraFaceTo(getCenterCA(region));
		} else {
			const [prevCountryIndex, prevCountry]: [number, Country] =
				getNthItem(world.sequentialRandomMap, prevIndex) as [
					number,
					Country,
				];
			world.setCountryAndConnectedState(
				prevCountryIndex,
				prevCountry.state === "selected" ? UNKNOWN : prevCountry.state
			);
			if (hard) {
				world.setCountryAndConnectedVisibility(prevCountryIndex, false);
			}

			const [currCountryIndex, currCountry]: [number, Country] =
				getNthItem(world.sequentialRandomMap, currIndex) as [
					number,
					Country,
				];
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
								region,
								gameTimer,
								hard,
								regionString,
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
							{gameType === FLAGS && sequentialRandom
								? customPromptFlags
								: answerPromptText[gameType]}
						</label>
						{!(gameType === FLAGS && sequentialRandom) && (
							<input
								autoFocus={true}
								type="text"
								id="answer-box-input"
								name="textbox"
								onInput={(): void =>
									handleTextboxChange(
										gameTimer,
										gameType,
										regionString,
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
						0&nbsp;/&nbsp;{" "}
						{renderQuizCounter(gameType, regionString)}
						&nbsp;
						{t("guessed")}
					</div>
					{renderSequentialRandom()}
				</div>
			</div>
			{renderRightSide(gameType)}
			{RenderOptions(gameType, t)}
			<div className="grid-item" id="hint-answer">
				<div className="grid" id="hint-answer-container"></div>
			</div>
		</>
	);
};

function renderRightSide(gameType: string): JSX.Element {
	switch (gameType) {
		case FLAGS:
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
