// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import {
	countriesCountByRegion,
	CountryAttribute,
	currencyByRegion,
	languageByRegion,
	World,
} from "../country/World";
import {
	changeCountryOfCountryAttribute,
	changeElementsVisibility,
	getObjCenter,
	processText,
} from "../utils/utilities";
import { getWorld, setupModelForGame } from "../scene/sceneManager";
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
	changeCACells,
	changeCountryCellTo,
	clearFlags,
	populateFlags,
} from "../country/countriesTable";
import { cameraFaceTo } from "../camera/camera";

function textboxChangeFlags(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean
): void {
	let flagSelected: HTMLImageElement | null =
		document.querySelector(".selected") || document.querySelector("img");
	if (!flagSelected) return;

	const [first, second]: string[] = flagSelected.alt.split("_");
	const location: [number, number] = [Number(first), Number(second)];

	const country: Country = world.getCountryByLocation(location);
	if (!isAcceptedName(country.acceptedNames, enteredText)) return;

	const countryIndex: number[] = [world.getRealIndex(location)];
	const index: number = countryIndex[0];
	if (!world.countryArray[index].visible) {
		world.setCountryAndConnectedVisibility(index, true);
	}
	world.setCountryAndConnectedIsFound(index, true);
	world.triggerCountryAnimation(index, "flags", true);

	// take the first img tag element in the item-list and make it the selected
	const nextFlag: HTMLImageElement | null = getNextFlag(flagSelected);
	if (nextFlag) nextFlag.classList.add("selected");
	// remove the outline of the selected flag and remove it from the list
	flagSelected.classList.remove("selected");
	flagSelected.remove();
	if (nextFlag) {
		nextFlag.classList.add("selected");
	}
	answerInput.value = "";
	updateCounter(
		counter,
		world.countriesFound,
		countriesCountByRegion[region]
	);
	changeCountryCellTo("found", countryIndex);
	if (isFollowing()) {
		cameraFaceTo(getObjCenter(world.countryArray[countryIndex[0]].object)); // get the first country object for simplicity
	}

	if (world.isAllFound(region)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
	}
}

function textboxChangeNames(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean
): void {
	const countryIndex: number[] = world.exists(enteredText);
	const country: Country = world.countryArray[countryIndex[0]];
	if (countryIndex.length === 0) {
		return; // not a country
	}
	countryIndex.forEach((index: number): void => {
		const country: Country = world.countryArray[index];
		if (country.found) {
			return;
		}
		if (sequentialRandom && country.state !== "selected") {
			return;
		}
		if (sequentialRandom) {
			world.sequentialRandomArray.splice(world.sequentialRandomIndex, 1);
			world.nextInSeqArr();
			const nextCountry: Country =
				world.sequentialRandomArray[world.sequentialRandomIndex];
			const nextIndex: number = world.getRealIndex(nextCountry.location);
			world.setCountryAndConnectedState(nextIndex, "selected");
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
	});
	if (isFollowing()) {
		cameraFaceTo(getObjCenter(country.object)); // get the first country object for simplicity
	}

	if (world.isAllFound(region)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
	}
}

function textBoxChangeCapitals(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean
): void {
	const countryArray: Country[] = world.countryArray;
	countryArray.forEach((country: Country, index: number): void => {
		if (!country.capital || country.owned) return;
		if (processText(country.capital) === enteredText) {
			if (!country.found) {
				country.found = true;
				world.applyFoundEffectsToCountry(index);

				answerInput.value = "";
				updateCounter(
					counter,
					world.countriesFound,
					countriesCountByRegion[region]
				);
			}
			return;
		}
	});
	if (world.isAllFound(region)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`);
	}
	return;
}
function textBoXChangeLanguages(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean
) {
	const languageArray: CountryAttribute[] = world.languageArray;
	const regionNumber: number = getRegionByNumber(region);
	const type = "language";
	const regionCount: number = languageByRegion[regionNumber];
	textboxChangeCA(
		world,
		enteredText,
		answerInput,
		counter,
		timer,
		regionNumber,
		languageArray,
		type,
		regionCount
	);
}
function textBoXChangeCurrencies(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string
): void {
	const currencyArray: CountryAttribute[] = world.currencyArray;
	const regionNumber: number = getRegionByNumber(region);
	const type = "currency";
	const regionCount: number = currencyByRegion[regionNumber];
	textboxChangeCA(
		world,
		enteredText,
		answerInput,
		counter,
		timer,
		regionNumber,
		currencyArray,
		type,
		regionCount
	);
}
function textboxChangeCA(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: number,
	array: CountryAttribute[],
	type: "language" | "currency",
	regionCount: number
): void {
	array.forEach((attribute: CountryAttribute, index: number): void => {
		if (
			processText(attribute.name) !== enteredText ||
			attribute.found ||
			!attribute.region.includes(region)
		) {
			return;
		}
		attribute.found = true;
		changeCACell("found", attribute, index);
		changeCountryOfCountryAttribute(index, "found", type, region);
		answerInput.value = "";
		updateCounter(counter, world.getFoundCA(type).length, regionCount);
	});

	if (world.allCountryAttributeFound(type, region)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`);
	}
}

const regionMap: { [key: string]: number } = {
	africa: 0,
	asia: 2,
	antarctica: 1,
	europe: 3,
	north_america: 4,
	oceania: 5,
	south_america: 6,
	all_regions: 7,
};
function getNextFlag(flagSelected: HTMLImageElement): HTMLImageElement | null {
	return (
		(flagSelected.nextElementSibling as HTMLImageElement) ||
		document.querySelector("img")
	);
}
export function getRegionByNumber(region: string): number {
	return regionMap[region] ?? -1;
}
function updateCounter(
	counter: HTMLDivElement,
	foundCount: number,
	totalCount: number
): void {
	counter.textContent = `${foundCount}\u00A0/\u00A0${totalCount} guessed`;
}

export function handleTextboxChange(
	timer: Timer,
	gameType: string,
	region: string,
	sequentialRandom: boolean
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
		currencies: textBoXChangeCurrencies,
		languages: textBoXChangeLanguages,
		capitals: textBoxChangeCapitals,
		names: textboxChangeNames,
	};
	const handler = gameTypeHandlers[gameType];
	if (handler) {
		console.log(`Entering handler for ${gameType}`);
		handler(
			world,
			enteredText,
			answerInput,
			counter,
			timer,
			region,
			sequentialRandom
		);
	}
}

export function isAcceptedName(
	acceptedNames: string[],
	enteredText: string
): boolean {
	const normalizedEnteredText: string = processText(enteredText);

	return acceptedNames.some((name: string): boolean => {
		return processText(name) === normalizedEnteredText;
	});
}

export function cameraFollowCountry(
	event: React.ChangeEvent<HTMLInputElement>
): void {
	const checkbox: HTMLInputElement = event.target;
	if (isFollowing() === !checkbox.checked) toggleIsFollowing();
}

function setCountryOfCA(
	world: World,
	countryAttribute: CountryAttribute,
	indexCA: number,
	state: string,
	region: number
): void {
	const locations: number[] = countryAttribute.locations;
	locations.forEach((index: number): void => {
		const country: Country = world.countryArray[index];
		if (country.owned || (region !== 7 && country.location[0] !== region)) {
			return;
		}

		world.triggerCountryAnimation(index, state, true);
		world.setCountryVisibility(index, true);
		changeCACell("missed", countryAttribute, indexCA);
	});
}

export function handleGiveUp(
	continentIndex: number,
	timer: Timer,
	isHard: boolean,
	region: string,
	gameType: string,
	sequentialRandom: boolean
): void {
	const chevrons: HTMLCollection =
		document.getElementsByClassName("chevron") || [];

	const answerContainer: HTMLDivElement = document.getElementById(
		"answer-box-container"
	) as HTMLDivElement;
	const hintAnswerContainer: HTMLDivElement = document.getElementById(
		"hint-answer-container"
	) as HTMLDivElement;
	const giveUp: HTMLButtonElement = document.getElementById(
		"give-up-btn"
	) as HTMLButtonElement;
	const pauseStart: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const restartButton: HTMLButtonElement =
		pauseStart.cloneNode() as HTMLButtonElement;
	document.getElementById("quiz-controls-table")?.appendChild(restartButton);
	restartButton.textContent = "Restart";
	restartButton.onclick = (): void => {
		restartQuiz(
			continentIndex,
			timer,
			isHard,
			restartButton,
			region,
			gameType
		);
	};
	if (isHard) {
		changeElementsVisibility([hintAnswerContainer], "visible");
	}
	const elements: HTMLElement[] = [pauseStart, giveUp, answerContainer];
	for (let i: number = 0; i < chevrons.length; i++) {
		elements.push(chevrons[i] as HTMLElement);
	}
	changeElementsVisibility(elements, "hidden");

	toggleIsPlaying();
	isControlsEnabled(true);
	timer.stop();

	const world: World = getWorld();

	console.debug(`Giving up, cleaning for ${gameType}`);
	const regionNumber: number = getRegionByNumber(region);
	if (gameType === "currencies") {
		const currencyArray: CountryAttribute[] = world.currencyArray;
		currencyArray.forEach(
			(currency: CountryAttribute, index: number): void => {
				if (
					currency.found ||
					(regionNumber !== 7 &&
						currency.region.includes(regionNumber))
				) {
					return;
				}
				setCountryOfCA(world, currency, index, "error", regionNumber);
			}
		);
		return;
	} else if (gameType === "languages") {
		const languageArray: CountryAttribute[] = world.languageArray;
		languageArray.forEach(
			(language: CountryAttribute, index: number): void => {
				if (
					language.found ||
					(regionNumber !== 7 &&
						language.region.includes(regionNumber))
				) {
					return;
				}

				setCountryOfCA(world, language, index, "error", regionNumber);
			}
		);
		return;
	}
	world.countryArray.forEach((country: Country, index: number): void => {
		if (country.found || country.owned) {
			return;
		}
		const location: [number, number] = country.location;
		if (!(continentIndex === -1 || location[0] === continentIndex)) {
			return;
		}
		world.setCountryAndConnectedVisibility(index, true);

		world.triggerCountryAnimation(
			index,
			gameType === "flags" ? gameType : "error",
			true
		);
		changeCountryCellTo("missed", [index]);
	});
}

export function handlePauseStart(ongoing: boolean, timer: Timer): void {
	const htmlElements: HTMLElement[] = [];
	const stopStartButton: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const answerContainer: HTMLDivElement = document.getElementById(
		"answer-box-container"
	) as HTMLDivElement;
	htmlElements.push(answerContainer);
	const giveUp: HTMLButtonElement = document.getElementById(
		"give-up-btn"
	) as HTMLButtonElement;
	htmlElements.push(giveUp);
	const counter: HTMLDivElement = document.getElementById(
		"counter"
	) as HTMLDivElement;
	htmlElements.push(counter);
	const timerCell: HTMLDivElement = document.getElementById(
		"timer"
	) as HTMLDivElement;
	htmlElements.push(timerCell);
	const chevrons: HTMLCollectionOf<Element> =
		document.getElementsByClassName("chevron");
	for (let i: number = 0; i < chevrons.length; i++) {
		const chevron: Element = chevrons[i];
		htmlElements.push(chevron as HTMLElement);
	}
	timer.setTimerElement(timerCell);

	const visibility: "visible" | "hidden" = ongoing ? "visible" : "hidden";
	changeElementsVisibility(htmlElements, visibility);

	if (ongoing !== isPlaying()) {
		toggleIsPlaying();
		isControlsEnabled(true);
	}
	if (ongoing) {
		timer.start();
		stopStartButton.textContent = "Pause";
	} else {
		timer.stop();
		stopStartButton.textContent = "Start";
	}
}

export function restartQuiz(
	regionNumber: number,
	timer: Timer,
	isHard: boolean,
	restartButton: HTMLButtonElement,
	region: string,
	gameType: string
): void {
	const counter: HTMLDivElement = document.getElementById(
		"counter"
	) as HTMLDivElement;
	const pauseStart: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const world: World = getWorld();

	if (gameType === "currencies") {
		world.currencyArray.forEach((currency: CountryAttribute): void => {
			currency.found = false;
		});

		counter.textContent =
			"0\u00A0/\u00A0" + currencyByRegion[regionNumber] + " guessed";
	} else if (gameType === "languages") {
		world.languageArray.forEach((language: CountryAttribute): void => {
			language.found = false;
		});
		changeCACells("invisible", "language");
		counter.textContent =
			"0\u00A0/\u00A0" + languageByRegion[regionNumber] + " guessed";
	} else {
		clearFlags();
		populateFlags(regionNumber);
		world.clearFound();

		counter.textContent =
			"0\u00A0/\u00A0" + countriesCountByRegion[region] + " guessed";
	}

	setupModelForGame(isHard, regionNumber, gameType);
	timer.reset();
	toggleIsPlaying();
	handlePauseStart(false, timer);
	pauseStart.style.visibility = "visible";
	restartButton.remove();
}

export function handleImageClick(event: MouseEvent): void {
	const imgElement = event.currentTarget as HTMLImageElement;

	if (imgElement.classList.contains("selected")) {
		imgElement.classList.remove("selected");
	} else {
		const previouslySelected: Element | null =
			document.querySelector(".selected");
		if (previouslySelected) {
			previouslySelected.classList.remove("selected");
		}
		imgElement.classList.add("selected");
	}
}

//TODO because of countries that are owned somehow going through
