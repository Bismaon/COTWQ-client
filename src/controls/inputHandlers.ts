// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import { countriesCountByRegion, Currency, World } from "../country/World";
import {
	changeCountryOfCurrency,
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
	changeCountryCellTo,
	changeCurrencyCell,
} from "../country/countriesTable";
import { cameraFaceTo } from "../camera/camera";

function allCurrencyFound(world: World): boolean {
	const foundArray = world.currencyArray.filter((currency: Currency) => {
		return currency.found;
	});
	return foundArray.length === world.currencyArray.length;
}

function textboxChangeCurrencies(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	timer: Timer
): void {
	const counter = document.getElementById(
		"currency-counter"
	) as HTMLDivElement;
	const currencyArray: Currency[] = world.currencyArray;
	currencyArray.forEach((currency: Currency) => {
		if (processText(currency.name) === enteredText) {
			if (!currency.found) {
				currency.found = true;
				changeCurrencyCell("found", currency.name);
				changeCountryOfCurrency(currency.name, "found");
				answerInput.value = "";
				const foundArray = currencyArray.filter(
					(currency: Currency) => {
						return currency.found;
					}
				);
				counter.textContent =
					String(foundArray.length) +
					"\u00A0/\u00A0" +
					currencyArray.length +
					" guessed"; // TODO CHANGE WITH TRANSLATION
			}
			return;
		}
	});
	if (allCurrencyFound(world)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`);
	}
	return;
}

function textboxChangeFlags(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	counter: HTMLDivElement,
	continent: string,
	timer: Timer
): void {
	let flagSelected: HTMLImageElement | null =
		document.querySelector(".selected");
	if (!flagSelected) {
		flagSelected = document.querySelector("img"); // Compare to the first flag in the flag list
		if (!flagSelected) {
			return;
		}
	}
	const [first, second]: string[] = flagSelected.alt.split("_");
	const location: [number, number] = [Number(first), Number(second)];

	const country: Country = world.getCountryByLocation([
		Number(first),
		Number(second),
	]);
	if (!isAcceptedName(country.acceptedNames, enteredText)) {
		return;
	}

	const countryIndex = [world.getRealIndex(location)];
	const index: number = countryIndex[0];
	if (!world.countryArray[index].isVisible) {
		world.setCountryAndConnectedVisibility(index, true);
	}
	world.setCountryAndConnectedIsFound(index, true);
	// countryIndex[0], because only one country can be guessed by flag
	world.triggerCountryAnimation(index, "flags", true);
	// take the first img tag element in the item-list and make it the selected
	let nextFlag: HTMLImageElement | null =
		flagSelected.nextSibling as HTMLImageElement;
	if (!(nextFlag instanceof HTMLImageElement)) {
		nextFlag = document.querySelector("img");
	}
	// remove the outline of the selected flag and remove it from the list
	flagSelected.classList.remove("selected");
	flagSelected.remove();
	if (nextFlag) {
		nextFlag.classList.add("selected");
	}
	answerInput.value = "";

	counter.textContent =
		String(world.countriesFound) +
		"\u00A0/\u00A0" +
		countriesCountByRegion[continent] +
		" guessed"; // TODO CHANGE WITH TRANSLATION
	changeCountryCellTo("found", countryIndex);
	if (isFollowing()) {
		cameraFaceTo(getObjCenter(world.countryArray[countryIndex[0]].object)); // get the first country object for simplicity
	}

	if (world.isAllFound(continent)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
	}
	return;
}

function textboxChangeNames(
	world: World,
	enteredText: string,
	answerInput: HTMLInputElement,
	countryCounterDiv: HTMLDivElement,
	continent: string,
	timer: Timer
): void {
	const countryIndex = world.exists(enteredText);
	countryIndex.forEach((index: number): void => {
		const country: Country = world.countryArray[index];
		if (country.isFound) {
			return;
		}

		world.applyFoundEffectsToCountry(index);
		answerInput.value = "";
		countryCounterDiv.textContent =
			String(world.countriesFound) +
			"\u00A0/\u00A0" +
			countriesCountByRegion[continent] +
			" guessed";
	});
	changeCountryCellTo("found", countryIndex);
	if (isFollowing()) {
		cameraFaceTo(getObjCenter(world.countryArray[countryIndex[0]].object)); // get the first country object for simplicity
	}

	if (world.isAllFound(continent)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
	}
}

export function handleTextboxChange(
	timer: Timer,
	continent: string,
	gameType: string
): void {
	const answerInput: HTMLInputElement = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	const countryCounterDiv: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;

	const world: World = getWorld();
	const enteredText: string = processText(answerInput.value);
	if (gameType === "flags") {
		textboxChangeFlags(
			world,
			enteredText,
			answerInput,
			countryCounterDiv,
			continent,
			timer
		);
	} else if (gameType === "currencies") {
		textboxChangeCurrencies(world, enteredText, answerInput, timer);
	} else {
		textboxChangeNames(
			world,
			enteredText,
			answerInput,
			countryCounterDiv,
			continent,
			timer
		);
	}
}

export function isAcceptedName(
	acceptedNames: string[],
	enteredText: string
): boolean {
	const normalizedEnteredText = processText(enteredText);

	return acceptedNames.some(
		(name) => processText(name) === normalizedEnteredText
	);
}
export function cameraFollowCountry(
	event: React.ChangeEvent<HTMLInputElement>
): void {
	const checkbox: HTMLInputElement = event.target;
	if (isFollowing() === !checkbox.checked) toggleIsFollowing();
}

function setCountryOfCurrency(
	world: World,
	currency: Currency,
	continentIndex: number,
	state: string
): void {
	const locations: number[] = currency.locations;
	locations.forEach((index: number) => {
		const country = world.countryArray[index];
		if (continentIndex !== -1 && country.location[0] !== continentIndex) {
			return;
		}

		world.triggerCountryAnimation(index, state, false);
		world.setCountryVisibility(index, true);
		changeCurrencyCell("missed", currency.name);
	});
}

export function handleGiveUp(
	continentIndex: number,
	timer: Timer,
	isHard: boolean,
	continent: string,
	gameType: string
): void {
	const answerContainer: HTMLDivElement = document.getElementById(
		"answer-box-container"
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
			continent,
			gameType
		);
	};
	console.log(pauseStart);
	console.log(giveUp);
	console.log(answerContainer);
	changeElementsVisibility([pauseStart, giveUp, answerContainer], "hidden");

	toggleIsPlaying();
	isControlsEnabled(true);
	timer.stop();

	const world: World = getWorld();

	if (gameType === "currencies") {
		const currencyArray = world.currencyArray;
		currencyArray.forEach((currency: Currency) => {
			if (currency.found) {
				return;
			}
			setCountryOfCurrency(world, currency, continentIndex, "error");
		});
	} else {
		world.countryArray.forEach((country: Country, index: number): void => {
			if (country.isFound || country.isOwned) {
				return;
			}
			const location: [number, number] = country.location;
			if (!(continentIndex === -1 || location[0] === continentIndex)) {
				return;
			}
			world.triggerCountryAnimation(
				index,
				gameType === "flags" ? gameType : "error",
				true
			);
			world.setCountryVisibility(index, true);
			changeCountryCellTo("missed", [index]);
		});
	}
}

export function handlePauseStart(ongoing: boolean, timer: Timer): void {
	const stopStartButton: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const answerContainer: HTMLDivElement = document.getElementById(
		"answer-box-container"
	) as HTMLDivElement;
	const giveUp: HTMLButtonElement = document.getElementById(
		"give-up-btn"
	) as HTMLButtonElement;
	let counter: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;
	if (!counter) {
		counter = document.getElementById("currency-counter") as HTMLDivElement;
	}
	const timerCell: HTMLDivElement = document.getElementById(
		"timer"
	) as HTMLDivElement;
	timer.setTimerElement(timerCell);

	const visible: "visible" | "hidden" = ongoing ? "visible" : "hidden";
	changeElementsVisibility(
		[answerContainer, timerCell, giveUp, counter],
		visible
	);

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
	continentIndex: number,
	timer: Timer,
	isHard: boolean,
	restartButton: HTMLButtonElement,
	continent: string,
	gameType: string
): void {
	let counter: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;
	if (!counter) {
		counter = document.getElementById("currency-counter") as HTMLDivElement;
	}
	const pauseStart: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const world: World = getWorld();
	world.currencyArray.forEach((currency: Currency): void => {
		currency.found = false;
	});
	world.clearFound();
	const foundArray: Currency[] = world.currencyArray.filter(
		(currency: Currency) => {
			return currency.found;
		}
	);
	if (gameType === "currencies") {
		counter.textContent =
			String(foundArray.length) +
			"\u00A0/\u00A0" +
			world.currencyArray.length +
			" guessed";
	} else {
		counter.textContent =
			String(world.countriesFound) +
			"\u00A0/\u00A0" +
			countriesCountByRegion[continent] +
			" guessed";
	}

	setupModelForGame(isHard, continentIndex, gameType);
	timer.reset();
	toggleIsPlaying();
	handlePauseStart(false, timer);
	pauseStart.style.visibility = "visible";
	restartButton.remove();
}

export function handleImageClick(event: MouseEvent) {
	const imgElement = event.currentTarget as HTMLImageElement;

	if (imgElement.classList.contains("selected")) {
		imgElement.classList.remove("selected");
	} else {
		const previouslySelected = document.querySelector(".selected");
		if (previouslySelected) {
			previouslySelected.classList.remove("selected");
		}
		imgElement.classList.add("selected");
	}
}
//TODO clear answer box function
