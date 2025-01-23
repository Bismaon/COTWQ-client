// countryUtils.ts
import { getWorld } from "../scene/sceneManager";
import { World } from "../country/World";
import { TFunction } from "i18next";
import { Country } from "../country/Country";
import { getIndexInMap } from "./utilities";
import { Timer } from "./Timer";
import { handleImageClick } from "../controls/inputHandlers";
import {
	CAPITALS,
	continentCountryCounts,
	CURRENCIES,
	CURRENCY,
	FLAGS,
	LANGUAGE,
	LANGUAGES,
	NAMES,
	regionMap,
	regionNamesUNFtoFORMap,
	SELECTED,
} from "./constants";
import { Currency } from "../country/Currency";
import { Language } from "../country/Language";
import { countryLoc } from "./types";

/**
 * Shuffles a map in place using the Fisher-Yates algorithm.
 * @returns {Map<string, unknown>} A new map with the elements shuffled.
 * @param map
 */
export function shuffleMap(map: Map<any, any>): Map<any, any> {
	const entries = Array.from(map.entries());

	// Shuffle the array using Fisher-Yates algorithm
	for (let i = entries.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[entries[i], entries[j]] = [entries[j], entries[i]];
	}

	// Create a new Map from the shuffled entries
	return new Map(entries);
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {any[]} array - The array to shuffle.
 * @returns {any[]} A new array with the elements shuffled.
 */
export function shuffleArray(array: any[]): any[] {
	const copiedArray: any[] = array.slice();
	for (let i: number = array.length - 1; i > 0; i--) {
		const j: number = Math.floor(Math.random() * (i + 1));
		[copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
	}
	return copiedArray;
}

/**
 * Filters and shuffles an array of countries based on specific criteria.
 * @param {Country[]} countries - The array of countries to process.
 * @param {number} region - The index of the continent to filter by.
 * @returns {Country[]} An array of shuffled and filtered countries.
 */
export function randomizedCountries(
	countries: Map<number, Country>,
	region: number
): Map<number, Country> {
	const filteredCountries: Map<number, Country> = new Map(
		Array.from(countries.entries()).filter(
			([_, country]: [number, Country]): boolean => {
				if (country.owned) return false; // skip if the country is not independent
				if (country.name === "Antarctica") return false; // skip Antarctica
				if (!country.isInRegion(region)) return false; // skip if the country is not in the wanted continent
				return true;
			}
		)
	);
	return shuffleMap(filteredCountries);
}

/**
 * Clears all flags from the "item-list" container in the DOM.
 */
export function clearFlags(): void {
	const flagContainer: HTMLElement | null =
		document.getElementById("item-list");
	if (!flagContainer) {
		return;
	}
	flagContainer.innerHTML = "";
}

/**
 * Populates the flag container with flags for the given countries.
 * @param {boolean} sequentialRandom - Whether the flags should be randomized sequentially.
 * @param {Timer} timer - The game timer instance.
 * @param {string} region - The region for the game.
 * @param {string} gameName - The name of the game.
 */
export function populateFlags(
	sequentialRandom: boolean,
	timer: Timer,
	region: number,
	gameName: string
): void {
	const flagContainer: HTMLElement | null =
		document.getElementById("item-list");
	if (!flagContainer) {
		return;
	}

	const countries: Map<number, Country> = getWorld().countries;
	const filteredCountries: Map<number, Country> = randomizedCountries(
		countries,
		region
	);
	console.log("Filtered countries: ", filteredCountries);

	const baseURL = `${process.env.PUBLIC_URL}/assets/svg/flags/`;

	filteredCountries.forEach((country: Country): void => {
		const flagUrl: string = baseURL + country.svgFlag;

		const imgElement: HTMLImageElement = document.createElement("img");
		imgElement.src = flagUrl;
		imgElement.alt = `${country.location[0]}_${country.location[1]}`;

		imgElement.addEventListener("click", (e: MouseEvent): void => {
			handleImageClick(e, sequentialRandom, timer, region, gameName);
		});

		flagContainer.appendChild(imgElement);
	});

	const firstFlag = document.querySelector("img") as HTMLImageElement;
	if (firstFlag) {
		firstFlag.classList.add(SELECTED);
	}
}

/**
 * Changes the state (class) of specific country cells in the table.
 * @param {FOUND | ERROR | UNAVAILABLE} state - The new state to apply.
 * @param {number[]} countryIndex - Array of country indices to update.
 */
export function changeCountryCellTo(
	state: string,
	countryIndex: number[]
): void {
	countryIndex.forEach((index: number): void => {
		const country: Country = getWorld().countries.get(index) as Country;
		const [continentI, countryI] = country.location;
		if (continentI === 1) {
			//Antarctica
			return;
		}

		// Find the cell with the specific index in the table
		const cell: HTMLElement | null = document.getElementById(
			`_${continentI}_${countryI}`
		);

		if (!cell) {
			console.error(
				`Cell with index _${continentI}_${countryI} not found.`
			);
			return;
		}

		// Change the cell's class based on the state
		cell.className = `cell ${state}`;
	});
}

/**
 * Changes the state (class) of cells corresponding to a specific country attribute type.
 * @param {FOUND | ERROR | UNAVAILABLE} state - The new state to apply.
 * @param {string} type - The type of the country attribute (e.g., CURRENCY, LANGUAGE).
 */
export function changeCACells(state: string, type: string): void {
	let caMap: Map<number, any>;
	switch (type) {
		case CURRENCY:
			caMap = getWorld().currencies;
			break;

		case LANGUAGE:
			caMap = getWorld().languages;
			break;

		default:
			console.error(`Country attribute of type ${type} unknown`);
			return;
	}
	caMap.forEach((item: any, index0: number): void => {
		changeCACell(
			state,
			item.type,
			getIndexInMap(caMap, (_, index: number) => index0 === index)
		);
	});
}

/**
 * Changes the state (class) of a single cell based on its index and type.
 * @param {string} state - The new state to apply.
 * @param {string} type - The type of the country attribute (e.g., CURRENCY, LANGUAGE).
 * @param {number} index - The index of the cell to update.
 */
export function changeCACell(state: string, type: string, index: number): void {
	let cells: Element[];
	switch (type) {
		case CURRENCY:
			changing();
			break;
		case LANGUAGE:
			changing();
			break;
		default:
			console.error(`Country attribute of type ${type} unknown`);
			return;
	}

	function changing(): void {
		cells = Array.from(document.getElementsByClassName(`cell _${index}`));

		if (!cells) {
			console.error(`Cells with classname ${index} not found.`);
			return;
		}

		cells.forEach((cell: Element): void => {
			cell.className = `cell _${index} ${state}`;
		});
	}
}

/**
 * Creates and populates a table layout for the game based on the selected type.
 * @param {string} type - The type of data to display (e.g., NAMES, FLAGS, LANGUAGES).
 * @param {TFunction<"translation">} t - The translation function for localization.
 * @param {string} region - The region to display in the table.
 * @param {boolean} hard - Whether the game is in hard mode.
 */
export function createTableFromType(
	type: string,
	t: TFunction<"translation">,
	region: number,
	hard: boolean
): void {
	const world: World = getWorld();

	const container: HTMLTableElement = document.getElementById(
		"hint-answer-container"
	) as HTMLTableElement;

	if (hard) {
		container.style.visibility = "hidden";
	}
	regionMap.forEach((index: number, regionI: string): void => {
		if (
			index === 1 || // antarctica
			(region !== 7 && index !== region) || // passes regions which aren't the one given (not "all_regions")
			index === 7 // skips if region given is all_regions
		) {
			return;
		}

		// Create a new table element for the current continent.
		const table: HTMLTableElement = document.createElement("table");
		table.className = "grid-table-item";
		table.ariaColSpan = "1";

		// Create the table body.
		const tableBody: HTMLTableSectionElement = table.createTBody();

		// Add the continent name as the first row.
		const continentRow: HTMLTableRowElement = tableBody.insertRow();
		const continentCell: HTMLTableCellElement = continentRow.insertCell();
		continentCell.colSpan = 2; // Ensuring the cell takes full width of the column.
		continentCell.innerHTML = `<div class="table-title" id=${regionI}>${regionNamesUNFtoFORMap.get(regionI)}</div>`;

		// Add the countries as subsequent rows.
		for (let i: number = 0; i < continentCountryCounts[index]; i++) {
			const loc: countryLoc = [index, i];

			const country: Country = world.getCountryByLocation(loc);
			const languages: [number, Language][] =
				world.getLanguagesArrayFrom(loc);
			const currency: [number, Currency][] =
				world.getCurrencyArrayFrom(loc);

			if (
				country.owned ||
				languages.length === 0 ||
				currency.length === 0
			) {
				continue;
			}
			const countryRow: HTMLTableRowElement = tableBody.insertRow();
			const countryCell: HTMLTableCellElement = countryRow.insertCell();
			if (type === NAMES) {
				countryCell.innerHTML = `<div class="cell unavailable" id="_${index}_${i}">${country.name}</div>`;
			} else {
				countryCell.innerHTML = `<div class="cell-text">${country.name}</div>`;
			}

			// contains language|currency|capital
			let infoCell: HTMLTableCellElement;
			switch (type) {
				case FLAGS:
					infoCell = countryRow.insertCell();
					// Base URL for flag images
					const baseURL = `${process.env.PUBLIC_URL}/assets/svg/flags/`;
					const flagURL: string = baseURL + country.svgFlag;

					infoCell.innerHTML = `<img src="${flagURL}" class="cell unavailable" id="_${index}_${i}" alt="${country.location[0]}_${country.location[1]}"/>`;
					break;
				case LANGUAGES:
					countryCell.rowSpan = country.langAmount;

					// same row level as the country name row
					infoCell = countryRow.insertCell();
					infoCell.innerHTML = `<div class="cell _${languages[0][0]} unavailable">${languages[0][1].name}</div>`;

					for (let i: number = 1; i < country.langAmount; i++) {
						const languageRow: HTMLTableRowElement =
							tableBody.insertRow();
						const languageCell: HTMLTableCellElement =
							languageRow.insertCell();
						languageCell.innerHTML = `<div class="cell _${languages[i][0]} unavailable">${languages[i][1].name}</div>`;
					}
					break;
				case CAPITALS:
					infoCell = countryRow.insertCell();
					infoCell.innerHTML = `<div class="cell unavailable" id="_${index}_${i}">${country.capital}</div>`;
					break;
				case CURRENCIES:
					infoCell = countryRow.insertCell();
					infoCell.innerHTML = `<div class="cell _${currency[0][0]}">${currency[0][1].name}</div>`;
					break;
				default:
					break;
			}
		}

		// Append the table to the container div.
		container.appendChild(table);
	});
}
