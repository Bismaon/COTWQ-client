// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import { Countries, countryToFind } from "../country/Countries";
import { processText } from "../utils/utilities";
import { changeCountryStateTo, changeCountryVisibilityTo, foundSearch, getConnected } from "../country/countryManager";
import { getCountries, restartQuiz } from "../scene/sceneManager";
import React from "react";
import { Country } from "../country/Country";
import { isFollowing, isPlaying, toggleIsFollowing, toggleIsPlaying } from "./playingState";
import { isControlsEnabled } from "./controls";
import { changeCountryCellTo } from "../country/countriesTable";

/**
 * Handles changes in the answer input textbox during the game.
 * It processes the input text, checks if the entered country exists, and updates
 * the guessed countries counter. If the correct country is found, the timer stops.
 *
 * @param {Timer} timer - The timer object that controls the game's timing.
 */
export function handleTextboxChange(timer: Timer): void {
	//!! Need to add gamemode name or change how the checks happen

	const textBox: HTMLInputElement = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	const countryCounterDiv: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;

	const countries: Countries = getCountries();
	if (timer) {
		const countryName: string = processText(textBox.value);
		const indexCountry: number[] = countries.exists(countryName);

		indexCountry.forEach((index: number): void => {
			const country: Country = countries.getCountriesArray()[index];
			if (foundSearch(country, textBox)) {
				timer.stop();
			}
			countryCounterDiv.textContent =
				String(countries.getFound()) +
				"\u00A0/\u00A0" +
				countryToFind["base"] +
				" guessed";
		});
	}
}

/**
 * Handles the state of whether the camera should follow a selected country.
 * Updates the global `follow` variable based on the checkbox state.
 *
 * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the follow checkbox.
 */
export function followCountry(
	event: React.ChangeEvent<HTMLInputElement>
): void {
	const checkbox: HTMLInputElement = event.target;
	if (isFollowing() === !checkbox.checked) toggleIsFollowing();
}

export function handleGiveUp(
	continentIndex: number,
	timer: Timer,
	isHard: boolean
): void {
	toggleIsPlaying();
	isControlsEnabled(true);
	timer.stop();

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

	pauseStart.style.visibility = "hidden";
	giveUp.style.visibility = "hidden";
	answerContainer.style.visibility = "hidden";

	restartButton.textContent = "Restart";
	restartButton.onclick = (): void => {
		restartQuiz(continentIndex, timer, isHard, restartButton);
	};

	const countries: Countries = getCountries();

	if (continentIndex !== -1) {
		countries.getCountriesArray().forEach((country: Country): void => {
			if (
				country.getOwnerLocation() === null &&
				country.getCountryLocation()[0] === continentIndex &&
				!country.getFound()
			) {
				const location: [number, number] = country.getCountryLocation();
				const locations: [number, number][] = getConnected(
					country.getCountryLocation()
				);
				changeCountryStateTo("error", locations);
				changeCountryVisibilityTo(true, locations);
				changeCountryCellTo(location[0], location[1], "missed");
			}
		});
	} else {
		countries.getCountriesArray().forEach((country: Country): void => {
			if (country.getOwnerLocation() === null && !country.getFound()) {
				const location: [number, number] = country.getCountryLocation();
				const locations: [number, number][] = getConnected(
					country.getCountryLocation()
				);
				changeCountryStateTo("error", locations);
				changeCountryVisibilityTo(true, locations);
				changeCountryCellTo(location[0], location[1], "missed");
			}
		});
	}
}

export function handlePauseStart(ongoing: boolean, timer: Timer): void {
	if (ongoing !== isPlaying()) toggleIsPlaying();

	const stopStartButton: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const answerContainer: HTMLDivElement = document.getElementById(
		"answer-box-container"
	) as HTMLDivElement;
	const timerCell: HTMLDivElement = document.getElementById(
		"timer"
	) as HTMLDivElement;

	const giveUp: HTMLButtonElement = document.getElementById(
		"give-up-btn"
	) as HTMLButtonElement;
	const countryCounter: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;

	const visibility: string = ongoing ? "visible" : "hidden";
	timer.setTimerElement(timerCell);

	answerContainer.style.visibility = visibility;
	timerCell.style.visibility = visibility;
	giveUp.style.visibility = visibility;
	countryCounter.style.visibility = visibility;
	if (ongoing) {
		timer.start();
		stopStartButton.textContent = "Pause";
	} else {
		timer.stop();
		stopStartButton.textContent = "Start";
	}
}
