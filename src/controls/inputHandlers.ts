// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import { countriesCountByRegion, World } from "../country/World";
import {
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
import { changeCountryCellTo } from "../country/countriesTable";
import { cameraFaceTo } from "../camera/camera";

export function handleTextboxChange(
	timer: Timer,
	continent: string,
	gameType?: string
): void {
	const answerInput: HTMLInputElement = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	const countryCounterDiv: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;

	const world: World = getWorld();
	const enteredText: string = processText(answerInput.value);
	let countryIndex: number[];
	if (gameType === "flag") {
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
		if (!country.acceptedNames.includes(enteredText)) {
			return;
		}
		countryIndex = [world.getRealIndex(location)];
		world.setCountryAndConnectedIsFound(countryIndex[0], true);
		// countryIndex[0], because only one country can be guessed by flag
		world.triggerCountryAnimation(countryIndex[0], "flag");
		// remove the outline of the selected flag and remove it from the list
		flagSelected.classList.remove("selected");
		flagSelected.remove();
		// take the first img tag element in the item-list and make it the selected
		let nextFlag: HTMLImageElement | null = document.querySelector("img");
		if (nextFlag) {
			nextFlag.classList.add("selected");
		}
	} else {
		countryIndex = world.exists(enteredText);

		countryIndex.forEach((index: number): void => {
			const country: Country = world.countryArray[index];
			if (country.isFound) {
				return;
			}
			world.applyFoundEffectsToCountry(index);
		});
	}
	console.log("Country Index: ", countryIndex);
	changeCountryCellTo("found", countryIndex);
	if (isFollowing()) {
		cameraFaceTo(getObjCenter(world.countryArray[countryIndex[0]].object)); // get the first country object for simplicity
	}
	answerInput.value = "";
	countryCounterDiv.textContent =
		String(world.countriesFound) +
		"\u00A0/\u00A0" +
		countriesCountByRegion[continent] +
		" guessed";
	if (world.isAllFound(continent)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
	}
}

export function cameraFollowCountry(
	event: React.ChangeEvent<HTMLInputElement>
): void {
	const checkbox: HTMLInputElement = event.target;
	if (isFollowing() === !checkbox.checked) toggleIsFollowing();
}

export function handleGiveUp(
	continentIndex: number,
	timer: Timer,
	isHard: boolean,
	continent: string,
	gameType?:string
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
		restartQuiz(continentIndex, timer, isHard, restartButton, continent);
	};
	changeElementsVisibility([pauseStart, giveUp, answerContainer], "hidden");

	toggleIsPlaying();
	isControlsEnabled(true);
	timer.stop();

	const world: World = getWorld();
	world.countryArray.forEach((country: Country, index:number): void => {
		if (country.isFound || country.isOwned) {
			return;
		}
		const location: [number, number] = country.location;
		if (!(continentIndex === -1 || location[0] === continentIndex)) {
			return;
		}
		world.triggerCountryAnimation(index, "error")
		world.setCountryAndConnectedIsFound(index, true);
		changeCountryCellTo("missed", [index]);
	});
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
	const countryCounter: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;
	const timerCell: HTMLDivElement = document.getElementById(
		"timer"
	) as HTMLDivElement;
	timer.setTimerElement(timerCell);

	const visible: "visible" | "hidden" = ongoing ? "visible" : "hidden";
	changeElementsVisibility(
		[answerContainer, timerCell, giveUp, countryCounter],
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
	continent: string
): void {
	const countryCounter: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;
	const pauseStart: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const countries: World = getWorld();
	countries.clearFound();
	countryCounter.textContent =
		String(countries.countriesFound) +
		"\u00A0/\u00A0" +
		countriesCountByRegion[continent] +
		" guessed";
	setupModelForGame(isHard, continentIndex);
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

