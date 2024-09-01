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

export function handleTextboxChange(timer: Timer, continent: string): void {
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
		if (country.isFound) {
			return;
		}
		if (foundSearch(country, continent)) {
			timer.stop();
			alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
		}
		answerInput.value = "";
		countryCounterDiv.textContent =
			String(countries.countriesFound) +
			"\u00A0/\u00A0" +
			countryToFind[continent] +
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
	continent: string
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

	const countries: Countries = getCountries();
	countries.countryArray.forEach((country: Country): void => {
		if (country.isFound || country.isOwned) {
			return;
		}
		const location: [number, number] = country.location;
		if (!(continentIndex === -1 || location[0] === continentIndex)) {
			return;
		}
		const locations: [number, number][] = getConnected(location);
		animationMultipleLocs(locations);
		changeCountryVisibilityTo(true, locations);
		changeCountryCellTo("missed", location);
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
	const countries: Countries = getCountries();
	countries.clearFound();
	countryCounter.textContent =
		String(countries.countriesFound) +
		"\u00A0/\u00A0" +
		countryToFind[continent] +
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

export async function handleFlagInput(timer: Timer, continent: string):Promise<void> {
	const answerInput: HTMLInputElement = document.getElementById(
		"answer-box-input"
	) as HTMLInputElement;
	const countryCounterDiv: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;
	let flagSelected: HTMLImageElement | null =
		document.querySelector(".selected");
	if (!flagSelected) {
		flagSelected = document.querySelector("img");
		if (!flagSelected){
			return;
		}
	}

	const countries: Countries = getCountries();
	const enteredText: string = processText(answerInput.value);
	const [first, second]: string[] = flagSelected.alt.split("_");

	const country: Country = countries.getCountryByLocation([Number(first), Number(second)]);
	if (!country.acceptedNames.includes(enteredText)) {
		return;
	}

	country.meshes.material = country.flagMaterial;
	
	flagSelected.classList.remove("selected");
	flagSelected.remove();
	if (getCountries().isAllFound(continent)) {
		timer.stop();
		alert(`Congratulations you finished in ${timer.toString()}!`); // make a better message
	}

	answerInput.value = "";
	countryCounterDiv.textContent =
		String(countries.countriesFound) +
		"\u00A0/\u00A0" +
		countryToFind[continent] +
		" guessed";
}
