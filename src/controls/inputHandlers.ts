// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import { Countries, countryToFind } from "../country/Countries";
import { changeElementsVisibility, processText } from "../utils/utilities";
import { getCountries, setupModelForGame } from "../scene/sceneManager";
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
import { bounceAnimation } from "../utils/animation";
import { Object3D, Vector3 } from "three";
import {
	changeCountryStateTo,
	changeCountryVisibilityTo,
	foundSearch,
	getConnected,
	getCountryMovement,
} from "../utils/countryUtils";

export function handleTextboxChange(timer: Timer, gameMode: string): void {
	const answerInput: HTMLInputElement = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	const countryCounterDiv: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;

	const countries: Countries = getCountries();
	const enteredText: string = processText(answerInput.value);
	const indexCountry: number[] = countries.exists(enteredText);

	indexCountry.forEach((index: number): void => {
		const country: Country = countries.countryArray[index];
		if (foundSearch(country, gameMode)) {
			timer.stop();
			alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
		}
		console.log(answerInput);
		answerInput.value = "";
		countryCounterDiv.textContent =
			String(countries.countriesFound) +
			"\u00A0/\u00A0" +
			countryToFind[gameMode] +
			" guessed";
	});
}

export function cameraFollowCountry(
	event: React.ChangeEvent<HTMLInputElement>
): void {
	const checkbox: HTMLInputElement = event.target;
	if (isFollowing() === !checkbox.checked) toggleIsFollowing();
}

function animationMultipleLocs(locations: [number, number][]): void {
	const countries: Countries = getCountries();
	locations.forEach((location: [number, number]): void => {
		const countryObj: Object3D =
			countries.getCountryByLocation(location).object;
		const [orgPos, targetPos]: Vector3[] = getCountryMovement(
			countryObj,
			100
		);
		bounceAnimation(countryObj, orgPos, targetPos, (): void => {
			changeCountryStateTo("error", [location]);
		});
	});
}

export function handleGiveUp(
	continentIndex: number,
	timer: Timer,
	isHard: boolean,
	gameMode: string
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
		restartQuiz(continentIndex, timer, isHard, restartButton, gameMode);
	};
	changeElementsVisibility([pauseStart, giveUp, answerContainer], "hidden");

	toggleIsPlaying();
	isControlsEnabled(true);
	timer.stop();

	const countries: Countries = getCountries();
	countries.countryArray.forEach((country: Country): void => {
		if (!(country.isFound || country.isOwned)) {
			const location: [number, number] = country.location;
			if (continentIndex === -1 || location[0] === continentIndex) {
				const locations: [number, number][] = getConnected(location);

				animationMultipleLocs(locations);
				changeCountryVisibilityTo(true, locations);
				changeCountryCellTo("missed", location);
			}
		}
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
	gameMode: string
): void {
	const countryCounter: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;
	const pauseStart: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const countries: Countries = getCountries();
	countries.clearFound();
	countryCounter.textContent =
		String(countries.countriesFound) +
		"\u00A0/\u00A0" +
		countryToFind[gameMode] +
		" guessed";
	setupModelForGame(isHard, continentIndex);
	timer.reset();
	toggleIsPlaying();
	handlePauseStart(false, timer);
	pauseStart.style.visibility = "visible";
	restartButton.remove();
}
