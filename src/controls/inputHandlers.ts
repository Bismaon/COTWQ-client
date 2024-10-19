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
	correctContinent,
	getCenterCA,
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
} from "../country/countriesTable";
import { cameraFaceTo } from "../camera/camera";
import {
	checkUserSession,
	getUserID,
	updateHighscore,
} from "../user/userStorage";

function updateFlagSelection(flagSelected: HTMLImageElement): void {
	const nextFlag: HTMLImageElement | null = getNextFlag(flagSelected);
	flagSelected.classList.remove("selected");
	flagSelected.remove();
	if (nextFlag) {
		nextFlag.classList.add("selected");
	}
}

function handleGameCompletion(timer: Timer): void {
	timer.stop();
	alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
}

function showAnswerContainer(): void {
	const answerContainer: HTMLDivElement = document.getElementById(
		"hint-answer-container"
	) as HTMLDivElement;
	answerContainer.style.visibility = "visible";
}

function textboxChangeFlags(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
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

	if (!world.countryArray[index].visible) {
		world.setCountryAndConnectedVisibility(index, true);
	}
	world.setCountryAndConnectedIsFound(index, true);
	world.triggerCountryAnimation(index, "", "flags", true);

	updateFlagSelection(flagSelected);
	changeCountryCellTo("found", countryIndex);
	if (isFollowing()) {
		cameraFaceTo(getObjCenter(world.countryArray[countryIndex[0]].object));
	}
	answerInput.value = "";
	updateCounter(
		counter,
		world.countriesFound,
		countriesCountByRegion[region]
	);
	if (world.isAllFound(region)) {
		handleGameCompletion(timer);
		checkUserSessionAndHandleGameEnd(timer, gameName);
		showAnswerContainer();
	}
}

function textboxChangeNames(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean,
	gameName: string
): void {
	const countryIndex: number[] = world.exists(enteredText);
	if (countryIndex.length === 0) return; // not a country

	countryIndex.forEach((index: number): void => {
		const country: Country = world.countryArray[index];
		if (country.found) return;
		if (sequentialRandom && country.state !== "selected") return;
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

function textBoxBasicFound(
	sequentialRandom: boolean,
	timer: Timer,
	world: World,
	index: number,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	region: string,
	gameName: string
): void {
	if (sequentialRandom) {
		world.sequentialRandomArray.splice(world.sequentialRandomIndex, 1);
		world.nextInSeqArr();
		const nextCountry: Country = world.sequentialRandomArray[
			world.sequentialRandomIndex
		] as Country;
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
	if (world.isAllFound(region)) {
		handleGameCompletion(timer);
		checkUserSessionAndHandleGameEnd(timer, gameName);
		showAnswerContainer();
	}
}

function textBoxChangeCapitals(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean,
	gameName: string
): void {
	const countryArray: Country[] = world.countryArray;
	countryArray.forEach((country: Country, index: number): void => {
		if (sequentialRandom && country.state !== "selected") return;
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

function textBoXChangeLanguages(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean,
	gameName: string
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
		regionCount,
		sequentialRandom,
		gameName
	);
}

function textBoXChangeCurrencies(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	timer: Timer,
	region: string,
	sequentialRandom: boolean,
	gameName: string
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
		regionCount,
		sequentialRandom,
		gameName
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
	regionCount: number,
	sequentialRandom: boolean,
	gameName: string
): void {
	array.forEach((attribute: CountryAttribute, index: number): void => {
		if (
			processText(attribute.name) !== enteredText ||
			attribute.found ||
			!attribute.region.includes(region) ||
			(sequentialRandom && !attribute.selected)
		)
			return;

		attribute.found = true;
		changeCACell("found", attribute.type, index);
		changeCountryOfCountryAttribute(attribute, "found", region);
		if (sequentialRandom) {
			world.sequentialRandomArray.splice(world.sequentialRandomIndex, 1);
			world.nextInSeqArr();
			const nextIndex: number = world.sequentialRandomIndex;
			const currCA: CountryAttribute = world.sequentialRandomArray[
				nextIndex
			] as CountryAttribute;
			currCA.selected = true;
			currCA.locations.forEach((index: number): void => {
				const country: Country = world.countryArray[index];
				if (region !== 7 && country.location[0] !== region) return;
				world.setCountryState(index, "selected");
				world.setCountryVisibility(index, true);
			});
			cameraFaceTo(getCenterCA(region));
		}

		answerInput.value = "";
		updateCounter(counter, world.getFoundCA(type).length, regionCount);
	});

	if (world.allCountryAttributeFound(type, region)) {
		handleGameCompletion(timer);
		checkUserSessionAndHandleGameEnd(timer, gameName);
		showAnswerContainer();
	}
}

export const regionMap: { [key: string]: number } = {
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

export function updateCounter(
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
		currencies: textBoXChangeCurrencies,
		languages: textBoXChangeLanguages,
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

function countryGiveUp(
	world: World,
	continentIndex: number,
	gameType: string
): void {
	if (["languages", "currencies"].includes(gameType)) return;
	world.countryArray.forEach((country: Country, index: number): void => {
		if (country.found || country.owned) {
			return;
		}
		if (!correctContinent(continentIndex, country)) {
			return;
		}
		world.setCountryAndConnectedVisibility(index, true);

		world.triggerCountryAnimation(
			index,
			"base",
			gameType === "flags" ? gameType : "error",
			true
		);
		changeCountryCellTo("error", [index]);
	});
}

function countryAttributeGiveUp(
	world: World,
	gameType: string,
	regionNumber: number,
	continentIndex: number
): void {
	switch (gameType) {
		case "languages":
			CAGU(world, regionNumber, continentIndex, world.languageArray);
			break;
		case "currencies":
			CAGU(world, regionNumber, continentIndex, world.currencyArray);
			break;
		default:
			break;
	}
}
function CAGU(
	world: World,
	regionNumber: number,
	continentIndex: number,
	CAArray: CountryAttribute[]
): void {
	CAArray.forEach((ca: CountryAttribute, index: number): void => {
		if (
			ca.found ||
			(regionNumber !== 7 && !ca.region.includes(regionNumber))
		) {
			return;
		}
		ca.locations.forEach((index: number): void => {
			const country: Country = world.countryArray[index];
			if (!correctContinent(continentIndex, country)) return;
			world.triggerCountryAnimation(index, ca.type, "error", false);
			world.setCountryVisibility(index, true);
		});
		changeCACell("error", ca.type, index);
	});
}

export function handleGiveUp(
	continentIndex: number,
	timer: Timer,
	isHard: boolean,
	region: string,
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
			continentIndex,
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
	const regionNumber: number = getRegionByNumber(region);
	countryAttributeGiveUp(world, gameType, regionNumber, continentIndex);
	countryGiveUp(world, continentIndex, gameType);
}

export function restartQuiz(
	continentIndex: number,
	timer: Timer,
	hard: boolean,
	restartButton: HTMLButtonElement,
	region: string,
	gameType: string,
	sequentialRandom: boolean,
	gameName: string,
	elements: HTMLElement[]
): void {
	timer.reset();
	restartButton.disabled = true; // Disable button while resetting

	const world: World = getWorld();
	world.resetCountries(continentIndex);
	world.resetSequentialItems(sequentialRandom, gameType);
	world.resetCA(gameType);
	world.clearFound();
	updateUIAfterRestart(
		region,
		gameType,
		continentIndex,
		sequentialRandom,
		timer,
		gameName
	); // Implement this function to handle UI updates
	world.setUpCountries(hard, continentIndex, gameType);
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
	region: string,
	gameName: string
): void {
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
	if (sequentialRandom) {
		const world: World = getWorld();
		const currIndex: number = world.sequentialRandomIndex;
		const currItem: Country = world.sequentialRandomArray[
			currIndex
		] as Country;
		const selected: HTMLImageElement | null =
			document.querySelector(".selected");
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
		const countryIndex: number = world.getRealIndex([
			Number(imgLoc[0]),
			Number(imgLoc[1]),
		]);
		const country: Country = world.countryArray[countryIndex];
		if (!country.visible) {
			world.setCountryAndConnectedVisibility(countryIndex, true);
		}
		world.setCountryAndConnectedIsFound(countryIndex, true);
		world.triggerCountryAnimation(countryIndex, "", "flags", true);

		selected.classList.remove("selected");
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
		changeCountryCellTo("found", [countryIndex]);
		if (isFollowing()) {
			cameraFaceTo(getObjCenter(country.object)); // get the first country object for simplicity
		}

		world.sequentialRandomArray.splice(world.sequentialRandomIndex, 1);
		world.nextInSeqArr();
		console.log(world.sequentialRandomArray);

		if (world.isAllFound(region)) {
			handleGameCompletion(timer);
			checkUserSessionAndHandleGameEnd(timer, gameName);
			showAnswerContainer();
		}
	}
}

function updateUIAfterRestart(
	region: string,
	gameType: string,
	continentIndex: number,
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
	if (gameType === "flags") {
		clearFlags();
		populateFlags(
			continentIndex,
			sequentialRandom,
			timer,
			region,
			gameName
		);
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
		updateHighscore(userID, gameName, timerStore).then((r) =>
			console.debug(r)
		);
	} else {
		// not logged in
	}
}
