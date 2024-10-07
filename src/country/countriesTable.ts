// country/countriesTable.ts

import { CountryAttribute, World } from "./World";
import { Country } from "./Country";
import { getWorld } from "../scene/sceneManager";
import { handleImageClick } from "../controls/inputHandlers";
import { TFunction } from "i18next";
import { correctContinent } from "../utils/utilities";

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

export function changeCountryCellTo(
	state: "found" | "error" | "unavailable",
	countryIndex: number[]
): void {
	countryIndex.forEach((index) => {
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

export function shuffleArray(array: any[]): any[] {
	const copiedArray: any[] = array.slice();
	for (let i: number = array.length - 1; i > 0; i--) {
		const j: number = Math.floor(Math.random() * (i + 1));
		[copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
	}
	return copiedArray;
}

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
	// Shuffle the filteredCountries array
	return shuffleArray(filteredCountries);
}

export function clearFlags(): void {
	const flagContainer: HTMLElement | null =
		document.getElementById("item-list");
	if (!flagContainer) {
		return;
	}
	flagContainer.innerHTML = "";
}

export function populateFlags(continentIndex: number): void {
	const flagContainer: HTMLElement | null =
		document.getElementById("item-list");
	if (!flagContainer) {
		return;
	}

	// Get the countries and shuffle them
	const countries: Country[] = getWorld().countryArray;
	const filteredCountries: Country[] = randomizedCountries(
		countries,
		continentIndex
	);
	console.log("Filtered countries: ", filteredCountries);

	// Base URL for flag images
	const baseURL = `${process.env.PUBLIC_URL}/assets/svg/flags/`;

	// Create and append flag elements
	filteredCountries.forEach((country: Country) => {
		const flagUrl: string = baseURL + country.svgFlag;

		const imgElement: HTMLImageElement = document.createElement("img");
		imgElement.src = flagUrl;
		imgElement.alt = `${country.location[0]}_${country.location[1]}`;

		// Attach click handler
		imgElement.addEventListener("click", handleImageClick);

		flagContainer.appendChild(imgElement);
	});

	// Set the first flag as selected
	const firstFlag = document.querySelector("img") as HTMLImageElement;
	if (firstFlag) {
		firstFlag.classList.add("selected");
	}
}

export function changeCACells(
	state: "found" | "error" | "unavailable",
	type: string
): void {
	switch (type) {
		case "currency":
			const currencyArray: CountryAttribute[] = getWorld().currencyArray;

			currencyArray.forEach(
				(currency: CountryAttribute, index: number): void => {
					changeCACell(state, currency, index);
				}
			);
			break;
		case "language":
			const languageArray: CountryAttribute[] = getWorld().languageArray;

			languageArray.forEach(
				(language: CountryAttribute, index: number): void => {
					changeCACell(state, language, index);
				}
			);
			break;
		default:
			console.error(`Country attribute of type ${type} unknown`);
	}
}

export function changeCACell(
	state: string,
	countryAttribute: CountryAttribute,
	index: number
): void {
	let cells;
	// Find the cell with the specific index in the table
	switch (countryAttribute.type) {
		case "currency":
			cells = document.getElementsByClassName(`_${index}`);

			if (!cells) {
				console.error(`Cell with ID ${index} not found.`);
				return;
			}

			// Change the cell's class based on the state
			for (let i: number = 0; i < cells.length; i++) {
				const cell: Element = cells[i];
				cell.className = `cell _${index} ${state}`;
			}

			break;
		case "language":
			cells = document.getElementsByClassName(`_${index}`);
			if (!cells) {
				console.error(`Cell with index _${index} not found.`);
				return;
			}

			for (let i: number = 0; i < cells.length; i++) {
				const cell: Element = cells[i];
				cell.className = `cell _${index} ${state}`;
			}
			break;
		default:
			console.error(
				`Country attribute of type ${countryAttribute.type} unknown`
			);
			return;
	}
}

export function createTableFromType(
	type: string,
	t: TFunction<"translation">,
	region: string,
	hard: boolean
) {
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
