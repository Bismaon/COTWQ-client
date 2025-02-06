// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import { World } from "../country/World";
import {
	changeCountryOfCountryAttribute,
	changeElementsVisibility,
	deleteNthItem,
	getCenterCA,
	getNthItem,
	getObjCenter,
	processText,
} from "../utils/utilities";
import { getWorld } from "../scene/sceneManager";
import React from "react";
import { Country } from "../country/Country";
import {
	isFollowing,
	isPlaying,
	toggleIsFollowing,
	toggleIsPlaying,
} from "./playingState";
import { isControlsEnabled } from "./controls";
import {
	changeCACell,
	changeCountryCellTo,
	clearFlags,
	populateFlags,
} from "../utils/countryUtils";
import { cameraFaceTo } from "../camera/camera";
import {
	checkUserSession,
	getUserID,
	updateHighscore,
} from "../user/userStorage";
import {
	countriesCountByRegion,
	COUNTRY,
	CURRENCIES,
	CURRENCY,
	currencyByRegion,
	ERROR,
	FLAGS,
	FOUND,
	LANGUAGE,
	languageByRegion,
	LANGUAGES,
	SELECTED,
} from "../utils/constants";
import { Currency } from "../country/Currency";
import { AttributeStructure } from "../country/AttributeStructure";
import { Language } from "../country/Language";
import { countryLoc } from "../utils/types";

/**
 * Updates the currently selected flag by removing the selected state from the current flag
 * and applying it to the next available flag.
 * @param {HTMLImageElement} flagSelected - The currently selected flag element.
 */
function updateFlagSelection(flagSelected: HTMLImageElement): void {
	const nextFlag: HTMLImageElement | null = getNextFlag(flagSelected);
	flagSelected.classList.remove(SELECTED);
	flagSelected.remove();
	if (nextFlag) {
		nextFlag.classList.add(SELECTED);
	}
}

/**
 * Handles the game completion by stopping the timer and displaying a congratulatory message.
 * @param {Timer} timer - The timer instance for the game.
 */
function handleGameCompletion(timer: Timer): void {
	timer.stop();
	alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
}

/**
 * Displays the answer container by setting its visibility to "visible."
 */
function showAnswerContainer(): void {
	const answerContainer: HTMLDivElement = document.getElementById(
		"hint-answer-container"
	) as HTMLDivElement;
	answerContainer.style.visibility = "visible";
}

/**
 * Handles text box input for the FLAGS game mode.
 * @param {World} world - The current world instance.
 * @param {string} enteredText - The text entered the answer box.
 * @param {HTMLInputElement} answerInput - The input element for the answer box.
 * @param {HTMLDivElement} counter - The counter element to update.
 * @param {Timer} timer - The timer instance for the game.
 * @param {string} region - The current region for the game.
 * @param {string} gameName - The name of the current game.
 * @param {boolean} [sequentialRandom] - Whether the game is in sequential random mode.
 */
function textboxChangeFlags(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: number,
	gameName: string,
	sequentialRandom?: boolean
): void {
	const flagSelected: HTMLImageElement | null =
		document.querySelector(".selected") || document.querySelector("img");
	if (!flagSelected) return;

	const [first, second]: string[] = flagSelected.alt.split("_");
	const location: [number, number] = [Number(first), Number(second)];
	const country: Country = world.getCountryByLocation(location);

	if (!isAcceptedName(country.acceptedNames, enteredText)) return;

	const countryIndex: number[] = [world.getRealIndex(location)];
	const index: number = countryIndex[0];

	if (!(world.countries.get(index) as Country).visible) {
		world.setCountryAndConnectedVisibility(index, true);
	}
	world.setCountryAndConnectedIsFound(index, true);
	world.triggerCountryAnimation(index, "", FLAGS, true);

	updateFlagSelection(flagSelected);
	changeCountryCellTo(FOUND, countryIndex);
	if (isFollowing()) {
		cameraFaceTo(
			getObjCenter(
				(world.countries.get(countryIndex[0]) as Country).object
			)
		);
	}
	answerInput.value = "";
	updateCounter(
		counter,
		world.countriesFound,
		countriesCountByRegion[region]
	);
	if (world.isAllFound(region)) {
		finishGameProcessing(timer, gameName);
	}
}

/**
 * Handles text box input for the NAMES game mode.
 * @param {World} world - The current world instance.
 * @param {string} enteredText - The text entered the answer box.
 * @param {HTMLInputElement} answerInput - The input element for the answer box.
 * @param {HTMLDivElement} counter - The counter element to update.
 * @param {Timer} timer - The timer instance for the game.
 * @param {string} region - The current region for the game.
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {string} gameName - The name of the current game.
 */
function textboxChangeNames(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: number,
	sequentialRandom: boolean,
	gameName: string
): void {
	const countryIndex: number[] = world.exists(enteredText);
	if (countryIndex.length === 0) return; // not a country

	countryIndex.forEach((index: number): void => {
		const country: Country = world.countries.get(index) as Country;
		if (country.found) return;
		if (sequentialRandom && country.state !== SELECTED) return;
		textBoxBasicFound(
			sequentialRandom,
			timer,
			world,
			index,
			answerInput,
			counter,
			region,
			gameName
		);
	});
}

/**
 * Updates the state of a country and its associated elements when found.
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {Timer} timer - The timer instance for the game.
 * @param {World} world - The current world instance.
 * @param {number} index - The index of the country being updated.
 * @param {HTMLInputElement} answerInput - The input element for the answer box.
 * @param {HTMLDivElement} counter - The counter element to update.
 * @param {string} region - The current region for the game.
 * @param {string} gameName - The name of the current game.
 */
function textBoxBasicFound(
	sequentialRandom: boolean,
	timer: Timer,
	world: World,
	index: number,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	region: number,
	gameName: string
): void {
	if (sequentialRandom) {
		deleteNthItem(world.sequentialRandomMap, world.sequentialRandomIndex);
		world.nextInSeqArr();
		const [nextIndex, nextCountry]: [number, Country] = getNthItem(
			world.sequentialRandomMap,
			world.sequentialRandomIndex
		) as [number, Country];
		world.setCountryAndConnectedState(nextIndex, SELECTED);
		world.setCountryAndConnectedVisibility(nextIndex, true);
		cameraFaceTo(getObjCenter(nextCountry.object));
	}
	world.applyFoundEffectsToCountry(index);
	answerInput.value = "";
	updateCounter(
		counter,
		world.countriesFound,
		countriesCountByRegion[region]
	);
	if (world.isAllFound(region)) {
		finishGameProcessing(timer, gameName);
	}
}

/**
 * Handles text box input for the CAPITALS game mode.
 * @param {World} world - The current world instance.
 * @param {string} enteredText - The text entered the answer box.
 * @param {HTMLInputElement} answerInput - The input element for the answer box.
 * @param {HTMLDivElement} counter - The counter element to update.
 * @param {Timer} timer - The timer instance for the game.
 * @param {string} region - The current region for the game.
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {string} gameName - The name of the current game.
 */
function textBoxChangeCapitals(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: number,
	sequentialRandom: boolean,
	gameName: string
): void {
	const countryArray: Map<number, Country> = world.countries;
	countryArray.forEach((country: Country, index: number): void => {
		if (sequentialRandom && country.state !== SELECTED) return;
		if (!country.capital || country.owned) return;
		if (processText(country.capital) !== enteredText) return;
		if (country.found) return;
		textBoxBasicFound(
			sequentialRandom,
			timer,
			world,
			index,
			answerInput,
			counter,
			region,
			gameName
		);
	});
}

/**
 * Handles text box input for the LANGUAGES game mode.
 * @param {World} world - The current world instance.
 * @param {string} enteredText - The text entered the answer box.
 * @param {HTMLInputElement} answerInput - The input element for the answer box.
 * @param {HTMLDivElement} counter - The counter element to update.
 * @param {Timer} timer - The timer instance for the game.
 * @param {string} region - The current region for the game.
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {string} gameName - The name of the current game.
 */
function textBoxChangeLanguages(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: number,
	sequentialRandom: boolean,
	gameName: string
): void {
	const languageMap: Map<number, Language> = world.languages;
	const regionCount: number = languageByRegion[region];
	textboxChangeCA(
		world,
		enteredText,
		answerInput,
		counter,
		timer,
		region,
		languageMap,
		LANGUAGE,
		regionCount,
		sequentialRandom,
		gameName
	);
}

/**
 * Handles text box input for the CURRENCIES game mode.
 * @param {World} world - The current world instance.
 * @param {string} enteredText - The text entered the answer box.
 * @param {HTMLInputElement} answerInput - The input element for the answer box.
 * @param {HTMLDivElement} counter - The counter element to update.
 * @param {Timer} timer - The timer instance for the game.
 * @param {string} region - The current region for the game.
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {string} gameName - The name of the current game.
 */
function textBoxChangeCurrencies(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: number,
	sequentialRandom: boolean,
	gameName: string
): void {
	const currencyMap: Map<number, Currency> = world.currencies;
	const regionCount: number = currencyByRegion[region];
	textboxChangeCA(
		world,
		enteredText,
		answerInput,
		counter,
		timer,
		region,
		currencyMap,
		CURRENCY,
		regionCount,
		sequentialRandom,
		gameName
	);
}

/**
 * Finalizes the game by handling completion logic, updating user session, and showing answers.
 * @param {Timer} timer - The timer instance for the game.
 * @param {string} gameName - The name of the current game.
 */
export function finishGameProcessing(timer: Timer, gameName: string): void {
	handleGameCompletion(timer);
	checkUserSessionAndHandleGameEnd(timer, gameName);
	showAnswerContainer();
}

function textboxChangeCA(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: number,
	array: Map<number, AttributeStructure>,
	type: string,
	regionCount: number,
	sequentialRandom: boolean,
	gameName: string
): void {
	array.forEach((attribute: AttributeStructure, index: number): void => {
		if (
			processText(attribute.name) !== enteredText ||
			attribute.found ||
			!attribute.isInRegion(region) ||
			(sequentialRandom && !attribute.selected)
		)
			return;

		attribute.found = true;
		changeCACell(FOUND, type, index);
		changeCountryOfCountryAttribute(attribute, FOUND, region);
		if (sequentialRandom) {
			deleteNthItem(
				world.sequentialRandomMap,
				world.sequentialRandomIndex
			);
			world.nextInSeqArr();
			const nextIndex: number = world.sequentialRandomIndex;
			const [, currCA]: [number, AttributeStructure] = getNthItem(
				world.sequentialRandomMap,
				nextIndex
			) as [number, AttributeStructure];
			currCA.selected = true;
			currCA.territories.forEach((loc: countryLoc): void => {
				const index: number = world.getRealIndex(loc);
				const country: Country = world.countries.get(index) as Country;
				if (region !== 7 && country.location[0] !== region) return;
				world.setCountryState(index, SELECTED);
				country.visible = true;
			});
			cameraFaceTo(getCenterCA(region));
		}

		answerInput.value = "";
		updateCounter(
			counter,
			world.getFoundCA(type, region).size,
			regionCount
		);
	});

	if (world.allCountryAttributeFound(type, region)) {
		finishGameProcessing(timer, gameName);
	}
}

function getNextFlag(flagSelected: HTMLImageElement): HTMLImageElement | null {
	return (
		(flagSelected.nextElementSibling as HTMLImageElement) ||
		document.querySelector("img")
	);
}

export function updateCounter(
	counter: HTMLDivElement,
	foundCount: number,
	totalCount: number
): void {
	counter.textContent = `${foundCount}\u00A0/\u00A0${totalCount} guessed`;
}

/**
 * Handles text box input changes and routes them to the appropriate game type handler.
 * @param {Timer} timer - The timer instance for the game.
 * @param {string} gameType - The type of game (e.g., FLAGS, NAMES).
 * @param {string} region - The region for the game.
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {string} gameName - The name of the current game.
 */
export function handleTextboxChange(
	timer: Timer,
	gameType: string,
	region: number,
	sequentialRandom: boolean,
	gameName: string
): void {
	const answerInput: HTMLInputElement = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	if (!answerInput) {
		console.error(`Input Element is missing: "answer-box-input"`);
		return;
	}
	const counter: HTMLDivElement = document.getElementById(
		"counter"
	) as HTMLDivElement;
	if (!counter) {
		console.error(`Div Element is missing: "counter"`);
		return;
	}
	const world: World = getWorld();
	const enteredText: string = processText(answerInput.value);
	const gameTypeHandlers: { [key: string]: Function } = {
		flags: textboxChangeFlags,
		currencies: textBoxChangeCurrencies,
		languages: textBoxChangeLanguages,
		capitals: textBoxChangeCapitals,
		names: textboxChangeNames,
	};
	const handler: Function = gameTypeHandlers[gameType];
	if (handler) {
		console.log(`Entering handler for ${gameType}`);
		handler(
			world,
			enteredText,
			answerInput,
			counter,
			timer,
			region,
			sequentialRandom,
			gameName
		);
	}
}

/**
 * Checks if the entered text matches any of the accepted names.
 * @param {string[]} acceptedNames - The array of accepted names.
 * @param {string} enteredText - The text entered by the user.
 * @returns {boolean} True if the entered text matches an accepted name, otherwise false.
 */
export function isAcceptedName(
	acceptedNames: string[],
	enteredText: string
): boolean {
	const normalizedEnteredText: string = processText(enteredText);
	return acceptedNames.some((name: string): boolean => {
		return processText(name) === normalizedEnteredText;
	});
}

/**
 * Toggles the camera follow mode based on the state of a checkbox input.
 * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the checkbox.
 */
export function cameraFollowCountry(
	event: React.ChangeEvent<HTMLInputElement>
): void {
	const checkbox: HTMLInputElement = event.target;
	if (isFollowing() === !checkbox.checked) toggleIsFollowing();
}

function countryGiveUp(world: World, region: number, gameType: string): void {
	if ([LANGUAGES, CURRENCIES].includes(gameType)) return;
	world.countries.forEach((country: Country, index: number): void => {
		if (country.found || country.owned) {
			return;
		}
		if (!country.isInRegion(region)) {
			return;
		}
		world.setCountryAndConnectedVisibility(index, true);

		world.triggerCountryAnimation(
			index,
			COUNTRY,
			gameType === FLAGS ? gameType : ERROR,
			true
		);
		changeCountryCellTo(ERROR, [index]);
	});
}

function countryAttributeGiveUp(
	world: World,
	gameType: string,
	region: number
): void {
	switch (gameType) {
		case LANGUAGES:
			CAGU(world, region, world.languages);
			break;
		case CURRENCIES:
			CAGU(world, region, world.currencies);
			break;
		case FLAGS:
			clearFlags();
			break;
		default:
			break;
	}
}

function CAGU(
	world: World,
	region: number,
	CAArray: Map<number, AttributeStructure>
): void {
	CAArray.forEach((ca: AttributeStructure, index: number): void => {
		if (ca.found || !ca.isInRegion(region)) {
			return;
		}

		ca.territories.forEach((loc: countryLoc): void => {
			let cIndex: number = world.getRealIndex(loc);
			const country: Country = world.countries.get(cIndex) as Country;
			if (!country.isInRegion(region)) {
				return;
			}

			world.triggerCountryAnimation(cIndex, ca.type, ERROR, false);
			country.visible = true;
		});
		changeCACell(ERROR, ca.type, index);
	});
}

/**
 * Handles the "give up" logic for the game, revealing answers and resetting UI elements.
 * @param {Timer} timer - The timer instance for the game.
 * @param {boolean} isHard - Whether the game is in hard mode.
 * @param {string} region - The region for the game.
 * @param {string} gameType - The type of the game (e.g., FLAGS).
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {string} gameName - The name of the current game.
 */
export function handleGiveUp(
	timer: Timer,
	isHard: boolean,
	region: number,
	gameType: string,
	sequentialRandom: boolean,
	gameName: string
): void {
	console.debug(`Giving up, cleaning for ${gameType}`);
	const QCTable = document.getElementById(
		"quiz-controls-table"
	) as HTMLTableElement;
	const elements: HTMLElement[] = [
		document.getElementById("counter") as HTMLElement,
		document.getElementById("quiz-stop-start") as HTMLButtonElement,
		document.getElementById("hint-answer-container") as HTMLDivElement,

		...Array.from(document.getElementsByClassName("chevron")).map(
			(element) => element as HTMLElement
		),
		document.getElementById("answer-box-container") as HTMLDivElement,
		document.getElementById("give-up-btn") as HTMLButtonElement,
	];
	const restartButton: HTMLButtonElement =
		elements[1].cloneNode() as HTMLButtonElement;
	restartButton.id = "restart-btn";
	elements[1].textContent = "Start"; // change with translation
	QCTable.appendChild(restartButton);
	restartButton.textContent = "Restart";
	restartButton.onclick = (): void => {
		restartQuiz(
			timer,
			isHard,
			restartButton,
			region,
			gameType,
			sequentialRandom,
			gameName,
			elements
		);
	};
	toggleIsPlaying();
	isControlsEnabled(true);
	timer.stop();

	changeElementsVisibility(elements, "hidden");
	changeElementsVisibility([elements[2]], "visible");
	const world: World = getWorld();
	countryAttributeGiveUp(world, gameType, region);
	countryGiveUp(world, region, gameType);
}

/**
 * Restarts the quiz, resetting all game elements and updating the UI.
 * @param {Timer} timer - The timer instance for the game.
 * @param {boolean} hard - Whether the game is in hard mode.
 * @param {HTMLButtonElement} restartButton - The restart button element.
 * @param {string} region - The region for the game.
 * @param {string} gameType - The type of the game (e.g., FLAGS).
 * @param {boolean} sequentialRandom - Whether the game is in sequential random mode.
 * @param {string} gameName - The name of the current game.
 * @param {HTMLElement[]} elements - The elements to reset.
 */
export function restartQuiz(
	timer: Timer,
	hard: boolean,
	restartButton: HTMLButtonElement,
	region: number,
	gameType: string,
	sequentialRandom: boolean,
	gameName: string,
	elements: HTMLElement[]
): void {
	timer.reset();
	restartButton.disabled = true; // Disable button while resetting

	const world: World = getWorld();
	world.resetCountries(region);
	world.resetSequentialItems(sequentialRandom, gameType);
	world.resetCA(gameType);
	world.clearFound();
	updateUIAfterRestart(region, gameType, sequentialRandom, timer, gameName); // Implement this function to handle UI updates
	world.setUpCountries(hard, region, gameType);
	changeElementsVisibility(elements, "visible");
	if (hard) {
		changeElementsVisibility([elements[2]], "hidden");
	}
	elements[0].textContent =
		"0\u00A0/\u00A0" + countriesCountByRegion[region] + " guessed";
	restartButton.remove();
}

export function handlePauseStart(ongoing: boolean, timer: Timer): boolean {
	ongoing = !ongoing;
	const htmlElements: HTMLElement[] = [
		document.getElementById("timer") as HTMLElement,
		...Array.from(document.getElementsByClassName("chevron")).map(
			(element) => element as HTMLElement
		),
		document.getElementById("answer-box-container") as HTMLElement,
		document.getElementById("give-up-btn") as HTMLElement,
		document.getElementById("counter") as HTMLElement,
	];
	if (!timer.setElement) {
		timer.setTimerElement(htmlElements[0]);
	}

	const visibility: "visible" | "hidden" = ongoing ? "visible" : "hidden";
	changeElementsVisibility(htmlElements, visibility);

	if (ongoing !== isPlaying()) {
		toggleIsPlaying();
		isControlsEnabled(true);
	}
	const PSButton = document.getElementById("quiz-stop-start") as HTMLElement;
	if (ongoing) {
		timer.start();
		PSButton.textContent = "Pause";
	} else {
		timer.stop();
		PSButton.textContent = "Start";
	}
	return ongoing;
}

export function handleImageClick(
	event: MouseEvent,
	sequentialRandom: boolean,
	timer: Timer,
	region: number,
	gameName: string
): void {
	const imgElement = event.currentTarget as HTMLImageElement;

	if (imgElement.classList.contains(SELECTED)) {
		imgElement.classList.remove(SELECTED);
	} else {
		const previouslySelected: Element | null =
			document.querySelector(".SELECTED");
		if (previouslySelected) {
			previouslySelected.classList.remove(SELECTED);
		}
		imgElement.classList.add(SELECTED);
	}
	if (sequentialRandom) {
		const world: World = getWorld();
		const [countryIndex, currItem]: [number, Country] = getNthItem(
			world.sequentialRandomMap,
			world.sequentialRandomIndex
		) as [number, Country];
		const selected: HTMLImageElement | null =
			document.querySelector(".SELECTED");
		if (!selected) return;
		const imgLoc: string[] = selected.alt.split("_");
		const countryLoc: [number, number] = currItem.location;
		if (
			!(
				Number(imgLoc[0]) === countryLoc[0] &&
				Number(imgLoc[1]) === countryLoc[1]
			)
		) {
			return;
		}
		const country: Country = world.countries.get(countryIndex) as Country;
		if (!country.visible) {
			world.setCountryAndConnectedVisibility(countryIndex, true);
		}
		world.setCountryAndConnectedIsFound(countryIndex, true);
		world.triggerCountryAnimation(countryIndex, "", FLAGS, true);

		selected.classList.remove(SELECTED);
		selected.remove();
		const counter: HTMLDivElement = document.getElementById(
			"counter"
		) as HTMLDivElement;
		if (!counter) {
			console.error(`Div Element is missing: "counter"`);
			return;
		}
		updateCounter(
			counter,
			world.countriesFound,
			countriesCountByRegion[region]
		);
		changeCountryCellTo(FOUND, [countryIndex]);
		if (isFollowing()) {
			cameraFaceTo(getObjCenter(country.object)); // get the first country object for simplicity
		}

		deleteNthItem(world.sequentialRandomMap, world.sequentialRandomIndex);
		world.nextInSeqArr();
		console.debug(world.sequentialRandomMap);

		if (world.isAllFound(region)) {
			finishGameProcessing(timer, gameName);
		}
	}
}

function updateUIAfterRestart(
	region: number,
	gameType: string,
	sequentialRandom: boolean,
	timer: Timer,
	gameName: string
): void {
	// Logic to update the UI after restarting the quiz
	const answerInput: HTMLInputElement = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	if (answerInput) answerInput.value = "";

	const counter: HTMLDivElement = document.getElementById(
		"counter"
	) as HTMLDivElement;
	if (counter) updateCounter(counter, 0, countriesCountByRegion[region]); // Reset counter
	if (gameType === FLAGS) {
		clearFlags();
		populateFlags(sequentialRandom, timer, region, gameName);
	}
	// Add more UI reset logic as needed (e.g., resetting flags)
}

export function checkUserSessionAndHandleGameEnd(
	timer: Timer,
	gameName: string
): void {
	if (checkUserSession() !== -1) {
		const userID: number = getUserID();
		const timerStore: string = timer.toStore();
		updateHighscore(userID, gameName, timerStore).then(() =>
			console.debug(
				"Highscore updated: ",
				timerStore,
				", game: ",
				gameName
			)
		);
	} else {
		// not logged in
		const timerStore: string = timer.toStore();
		console.debug("Highscore: ", timerStore, ", game: ", gameName);
	}
}
