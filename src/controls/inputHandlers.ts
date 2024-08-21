// controls/inputHandlers.ts
import { Timer } from "../utils/Timer";
import { Countries, countryToFind } from "../country/Countries";
import { processText } from "../utils/utilities";
import { foundSearch } from "../country/countryManager";
import { getCountries } from "../scene/sceneManager";
import React from "react";
import { Country } from "../country/Country";

let follow: boolean = false;

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

export function followCountry(
	event: React.ChangeEvent<HTMLInputElement>
): void {
	const checkbox: HTMLInputElement = event.target;
	follow = checkbox.checked;
}

export function isFollowing(): boolean {
	return follow;
}
