// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import { Countries, countryToFind } from "../country/Countries";
import { processText } from "../utils/utilities";
import { foundSearch } from "../country/countryManager";
import { getCountries } from "../scene/sceneManager";
import React from "react";
import { Country } from "../country/Country";
import { isFollowing, toggleIsFollowing } from "./playingState";

/**
 * Handles changes in the answer input textbox during the game.
 * It processes the input text, checks if the entered country exists, and updates
 * the guessed countries counter. If the correct country is found, the timer stops.
 *
 * @param {React.FormEvent<HTMLInputElement>} _event - The form event triggered by input in the textbox.
 * @param {Timer | null} timer - The timer object that controls the game's timing.
 */
export function handleTextboxChange(
	_event: React.FormEvent<HTMLInputElement>,
	timer: Timer | null
): void {
	//!! Need to add gamemode name or change how the checks happen

	const textBox: HTMLInputElement | null = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	const countryCounterDiv: HTMLDivElement | null = document.getElementById(
		"country-counter"
	) as HTMLDivElement;

	const countries: Countries = getCountries();
	if (textBox && timer) {
		const countryName: string = processText(textBox.value);
		const indexCountry: number[] = countries.exists(countryName);

		indexCountry.forEach((index: number): void => {
			const country: Country = countries.getCountriesArray()[index];
			if (foundSearch(country, textBox, countries)) {
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
	if (isFollowing() && !checkbox.checked) toggleIsFollowing();
}
