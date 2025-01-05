// country/countriesTable.ts

import { BaseItem, CountryAttribute, World } from "./World";
import { Country } from "./Country";
import { getWorld } from "../scene/sceneManager";
import { handleImageClick } from "../controls/inputHandlers";
import { TFunction } from "i18next";
import { correctContinent } from "../utils/utilities";
import { Timer } from "../utils/Timer";

/** Represents the number of countries in each continent for table layout purposes. */
const continentCountryCounts: [56, 3, 51, 46, 34, 19, 15] = [
	56, 3, 51, 46, 34, 19, 15,
];

/** Defines the names of the continents. */
export const continentNames: string[] = [
	"africa",
	"antarctic",
	"asia",
	"europe",
	"north_america",
	"oceania",
	"south_america",
];

const continentFormattedNames: string[] = [
	"Africa",
	"Antarctic",
	"Asia",
	"Europe",
	"North America",
	"Oceania",
	"South America",
];

/**
 * Changes the state (class) of specific country cells in the table.
 * @param {"found" | "error" | "unavailable"} state - The new state to apply.
 * @param {number[]} countryIndex - Array of country indices to update.
 */
export function changeCountryCellTo(
	state: "found" | "error" | "unavailable",
	countryIndex: number[]
): void {
	countryIndex.forEach((index: number): void => {
		const countryElement: Country = getWorld().countryArray[index];
		const [continent, country] = countryElement.location;
		if (continent === 1) {
			return;
		}

		// Find the cell with the specific index in the table
		const cell: HTMLElement | null = document.getElementById(
			`_${continent}_${country}`
		);

		if (!cell) {
			console.error(
				`Cell with index _${continent}_${country} not found.`
			);
			return;
		}

		// Change the cell's class based on the state
		cell.className = `cell ${state}`;
	});
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
 * @param {number} continentIndex - The index of the continent to filter by.
 * @returns {Country[]} An array of shuffled and filtered countries.
 */
export function randomizedCountries(
	countries: Country[],
	continentIndex: number
): Country[] {
	const filteredCountries: Country[] = countries.filter(
		(country: Country): boolean => {
			if (country.owned) return false; // skip if the country is not independent
			if (country.name === "Antarctica") return false; // skip Antarctica
			if (!correctContinent(continentIndex, country)) return false; // skip if the country is not in the wanted continent
			return true;
		}
	);
	return shuffleArray(filteredCountries);
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
 * @param {number} continentIndex - The index of the continent to filter by.
 * @param {boolean} sequentialRandom - Whether the flags should be randomized sequentially.
 * @param {Timer} timer - The game timer instance.
 * @param {string} region - The region for the game.
 * @param {string} gameName - The name of the game.
 */
export function populateFlags(
	continentIndex: number,
	sequentialRandom: boolean,
	timer: Timer,
	region: string,
	gameName: string
): void {
	const flagContainer: HTMLElement | null =
		document.getElementById("item-list");
	if (!flagContainer) {
		return;
	}

	const countries: Country[] = getWorld().countryArray;
	const filteredCountries: Country[] = randomizedCountries(
		countries,
		continentIndex
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
		firstFlag.classList.add("selected");
	}
}

/**
 * Changes the state (class) of cells corresponding to a specific country attribute type.
 * @param {"found" | "error" | "unavailable"} state - The new state to apply.
 * @param {string} type - The type of the country attribute (e.g., "currency", "language").
 */
export function changeCACells(
	state: "found" | "error" | "unavailable",
	type: string
): void {
	let caArray: BaseItem[];
	switch (type) {
		case "currency":
			caArray = getWorld().currencyArray;

			break;
		case "language":
			caArray = getWorld().languageArray;

			break;
		default:
			console.error(`Country attribute of type ${type} unknown`);
			return;
	}
	caArray.forEach((item: BaseItem, index: number): void => {
		changeCACell(state, item.type, index);
	});
}

/**
 * Changes the state (class) of a single cell based on its index and type.
 * @param {string} state - The new state to apply.
 * @param {string} type - The type of the country attribute (e.g., "currency", "language").
 * @param {number} index - The index of the cell to update.
 */
export function changeCACell(state: string, type: string, index: number): void {
	let cells: Element[];
	switch (type) {
		case "currency":
			changing();
			break;
		case "language":
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
 * @param {string} type - The type of data to display (e.g., "names", "flags", "languages").
 * @param {TFunction<"translation">} t - The translation function for localization.
 * @param {string} region - The region to display in the table.
 * @param {boolean} hard - Whether the game is in hard mode.
 */
export function createTableFromType(
	type: string,
	t: TFunction<"translation">,
	region: string,
	hard: boolean
): void {
	const world: World = getWorld();

	const container: HTMLTableElement = document.getElementById(
		"hint-answer-container"
	) as HTMLTableElement;

	if (hard) {
		container.style.visibility = "hidden";
	}
	continentNames.forEach((continent: string, index: number): void => {
		if (
			continent === "antarctic" ||
			(region !== "all_regions" && continent !== region)
		)
			return;

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
		continentCell.innerHTML = `<div class="table-title" id=${continent.toLowerCase()}>${continentFormattedNames[index]}</div>`;

		// Add the countries as subsequent rows.
		for (let i: number = 0; i < continentCountryCounts[index]; i++) {
			const country: Country = world.getCountryByLocation([index, i]);
			const languages: string[] | null = country.languages;
			const currency: string | null = country.currency;
			if (country.owned || !languages || !currency) {
				continue;
			}
			const countryRow: HTMLTableRowElement = tableBody.insertRow();
			const countryCell: HTMLTableCellElement = countryRow.insertCell();
			if (type === "names") {
				countryCell.innerHTML = `<div class="cell unavailable" id="_${index}_${i}">${country.name}</div>`;
			} else {
				countryCell.innerHTML = `<div class="cell-text">${country.name}</div>`;
			}

			// contains language|currency|capital
			let infoCell: HTMLTableCellElement;
			switch (type) {
				case "flags":
					infoCell = countryRow.insertCell();
					// Base URL for flag images
					const baseURL = `${process.env.PUBLIC_URL}/assets/svg/flags/`;
					const flagURL: string = baseURL + country.svgFlag;

					infoCell.innerHTML = `<img src="${flagURL}" class="cell unavailable" id="_${index}_${i}" alt="${country.location[0]}_${country.location[1]}"/>`;
					break;
				case "languages":
					countryCell.rowSpan = languages.length;
					// same row level as the country name row
					infoCell = countryRow.insertCell();
					infoCell.innerHTML = `<div class="cell _${world.languageArray.findIndex(
						(lang: CountryAttribute) => {
							return lang.name === languages[0];
						}
					)} unavailable">${languages[0]}</div>`;

					for (let i = 1; i < languages.length; i++) {
						const languageRow: HTMLTableRowElement =
							tableBody.insertRow();
						const languageCell: HTMLTableCellElement =
							languageRow.insertCell();
						languageCell.innerHTML = `<div class="cell _${world.languageArray.findIndex(
							(lang: CountryAttribute) => {
								return lang.name === languages[i];
							}
						)} unavailable">${languages[i]}</div>`;
					}
					break;
				case "capitals":
					infoCell = countryRow.insertCell();
					infoCell.innerHTML = `<div class="cell unavailable" id="_${index}_${i}">${country.capital}</div>`;
					break;
				case "currencies":
					infoCell = countryRow.insertCell();
					infoCell.innerHTML = `<div class="cell _${world.currencyArray.findIndex(
						(curr: CountryAttribute) => {
							return curr.name === currency;
						}
					)}">${currency}</div>`;
					break;
				default:
					break;
			}
		}

		// Append the table to the container div.
		container.appendChild(table);
	});
}
