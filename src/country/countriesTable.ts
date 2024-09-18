// country/countriesTable.ts

import { CountryAttribute, World } from "./World";
import { Country } from "./Country";
import { getWorld } from "../scene/sceneManager";
import { handleImageClick } from "../controls/inputHandlers";
import { TFunction } from "i18next";

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
 * Creates and populates separate tables for each continent.
 * Each table starts with the continent name, followed by the countries within that continent.
 *
 * @returns {void}
 */
export function createTable(): void {
	// Retrieve the World object, which contains country data.
	const countries: World = getWorld();

	// Reference to the container div where the tables will be placed.
	const container: HTMLTableElement = document.getElementById(
		"country-continent-name-container"
	) as HTMLTableElement;

	// Iterate over each continent to create a separate table.
	continentNames.forEach((continent: string, index: number): void => {
		// Skip "Antarctic" as per requirements.
		if (continent === "antarctic" || continent === "south_america") return;

		// Create a new table element for the current continent.
		const table: HTMLTableElement = document.createElement("table");
		table.className = "grid-continent-item";
		table.ariaColSpan = "1";

		// Create the table body.
		const tableBody: HTMLTableSectionElement = table.createTBody();

		// Add the continent name as the first row.
		const continentRow: HTMLTableRowElement = tableBody.insertRow();
		const continentCell: HTMLTableCellElement = continentRow.insertCell();
		continentCell.colSpan = 1; // Ensuring the cell takes full width of the column.
		continentCell.innerHTML = `<div class="continent-name" id=${continent.toLowerCase()}>${continentFormattedNames[index]}</div>`;

		// Add the countries as subsequent rows.
		for (let i: number = 0; i < continentCountryCounts[index]; i++) {
			const country: Country = countries.getCountryByLocation([index, i]);
			if (country.isOwned) continue;
			const row: HTMLTableRowElement = tableBody.insertRow();
			const cell: HTMLTableCellElement = row.insertCell();
			cell.innerHTML = `<div class="cell invisible" id="_${index}_${i}">${country.name}</div>`;
		}

		// Append the table to the container div.
		container.appendChild(table);
		if (continent === "oceania") {
			index++; // South America
			continent = continentNames[index];
			// Add the continent name as the first row.

			const emptyRow: HTMLTableRowElement = tableBody.insertRow();
			const emptyCell: HTMLTableCellElement = emptyRow.insertCell();
			emptyCell.colSpan = 1;
			emptyCell.innerHTML = "<div id='empty-space'>EMPTY</div>";

			const continentRow: HTMLTableRowElement = tableBody.insertRow();
			const continentCell: HTMLTableCellElement =
				continentRow.insertCell();
			continentCell.colSpan = 1; // Ensuring the cell takes full width of the column.
			continentCell.innerHTML = `<div class="continent-name" id=${continent.toLowerCase()}>${continentFormattedNames[index]}</div>`;

			// Add the countries as subsequent rows.
			for (let i: number = 0; i < continentCountryCounts[index]; i++) {
				const country: Country = countries.getCountryByLocation([
					index,
					i,
				]);
				if (country.isOwned) continue;
				const row: HTMLTableRowElement = tableBody.insertRow();
				const cell: HTMLTableCellElement = row.insertCell();
				cell.innerHTML = `<div class="cell invisible" id="_${index}_${i}">${country.name}</div>`;
			}
		}
	});
}

export function changeCountryCellTo(
	state: "found" | "missed" | "invisible",
	countryIndex: number[]
): void {
	countryIndex.forEach((index) => {
		const countryElement: Country = getWorld().countryArray[index];
		const [continent, country] = countryElement.location;
		if (continent === 1) {
			console.debug("No antarctic!");
			return;
		}

		// Retrieve the container element where the tables are appended
		const container: HTMLTableElement = document.getElementById(
			"country-continent-name-container"
		) as HTMLTableElement;

		// Find the cell with the specific index in the table
		const cell: HTMLTableCellElement | null = container.querySelector(
			`div#_${continent}_${country}`
		);

		// console.log(cell);
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

function randomizedCountries(
	countries: Country[],
	continentIndex: number | undefined
): Country[] {
	const filteredCountries: Country[] = countries.filter(
		(country: Country) => {
			if (country.isOwned) return false; // skip if the country is not independent
			if (country.name === "Antarctica") return false; // skip Antarctica
			if (continentIndex && country.location[0] !== continentIndex)
				return false; // skip if the country is not in the wanted continent
			return true;
		}
	);

	// Shuffle the filteredCountries array
	for (let i = filteredCountries.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[filteredCountries[i], filteredCountries[j]] = [
			filteredCountries[j],
			filteredCountries[i],
		];
	}
	return filteredCountries;
}

export function populateFlags(continentIndex?: number): void {
	const flagContainer: HTMLElement | null =
		document.getElementById("item-list");
	if (!flagContainer) {
		return;
	}

	// Get the countries and shuffle them
	const countries: Country[] = getWorld().countryArray;
	const filteredCountries = randomizedCountries(countries, continentIndex);

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

export function createCurrencyTable(
	t: TFunction<"translation", undefined>
): void {
	// Retrieve the World object, which contains country data.
	const world: World = getWorld();
	// Reference to the container div where the tables will be placed.
	const container: HTMLTableElement = document.getElementById(
		"country-continent-name-container"
	) as HTMLTableElement;

	let table: HTMLTableElement = document.createElement("table");
	table.className = "grid-currency-item";
	table.ariaColSpan = "1";

	// Create the table body.
	let tableBody: HTMLTableSectionElement = table.createTBody();

	// Add the continent name as the first row.
	const titleRow: HTMLTableRowElement = tableBody.insertRow();
	const titleCell: HTMLTableCellElement = titleRow.insertCell();
	titleCell.colSpan = 2; // Ensuring the cell takes full width of the column.
	titleCell.innerHTML =
		`<div class="currency-title">` + t("currency") + `</div>`;
	let countryPerColumn = 0;
	world.currencyArray.forEach(
		(currency: CountryAttribute, index: number): void => {
			const locations = currency.locations;
			if ((countryPerColumn + locations.length) % 26 === 1) {
				console.log("Currency: ", currency.name);
				table = document.createElement("table");
				table.className = "grid-currency-item";
				table.ariaColSpan = "1";
				tableBody = table.createTBody();

				const titleRow: HTMLTableRowElement = tableBody.insertRow();
				const titleCell: HTMLTableCellElement = titleRow.insertCell();
				titleCell.colSpan = 2; // Ensuring the cell takes full width of the column.
				titleCell.innerHTML =
					`<div class="currency-title">` + t("currency") + `</div>`;
				container.appendChild(table);
				countryPerColumn = 0;
			}

			// Insert the first row with the currency name and the first country
			const firstRow: HTMLTableRowElement = tableBody.insertRow();
			const currencyCell: HTMLTableCellElement = firstRow.insertCell();
			currencyCell.rowSpan = locations.length; // Span across the number of locations
			currencyCell.innerHTML = `<div class="cell" id="${currency.name}">${currency.name}</div>`;

			const firstCountryCell: HTMLTableCellElement =
				firstRow.insertCell();
			firstCountryCell.innerHTML = `<div class="cell-text">${world.countryArray[locations[0]].name}</div>`;

			// Insert additional rows for the remaining countries
			for (let i = 1; i < locations.length; i++) {
				const row: HTMLTableRowElement = tableBody.insertRow();
				const countryCell: HTMLTableCellElement = row.insertCell();
				countryCell.innerHTML = `<div class="cell-text">${world.countryArray[locations[i]].name}</div>`;
			}
			countryPerColumn += locations.length;
		}
	);

	container.appendChild(table);
}

export function changeCACells(
	state: "found" | "missed" | "invisible",
	type: string
): void {
	switch (type) {
		case "currency":
			const currencyArray: CountryAttribute[] = getWorld().currencyArray;

			currencyArray.forEach((currency: CountryAttribute, index): void => {
				changeCACell(state, currency, index);
			});
			break;
		case "language":
			const languageArray: CountryAttribute[] = getWorld().languageArray;

			languageArray.forEach((language: CountryAttribute, index): void => {
				changeCACell(state, language, index);
			});
			break;
		default:
			console.error(`Country attribute of type ${type} unknown`);
	}
}

export function changeCACell(
	state: "found" | "missed" | "invisible",
	countryAttribute: CountryAttribute,
	index: number
): void {
	// Find the cell with the specific index in the table
	switch (countryAttribute.type) {
		case "currency":
			const cell = document.getElementById(countryAttribute.name);
			// console.log(cell);
			if (!cell) {
				console.error(
					`Cell with ID ${countryAttribute.name} not found.`
				);
				return;
			}

			// Change the cell's class based on the state
			cell.className = `cell ${state}`;
			break;
		case "language":
			const cells = document.getElementsByClassName(`_${index}`);
			console.log(cells);
			if (!cells) {
				console.error(`Cell with index ${index} not found.`);
				return;
			}

			for (let i = 0; i < cells.length; i++) {
				const cell = cells[i];
				cell.className = `cell _${index} ${state}`;
			}
			break;
		default:
			console.log(
				`Country attribute of type ${countryAttribute.type} unknown`
			);
			return;
	}
}

export function createLanguageTable(
	t: TFunction<"translation", undefined>
): void {
	// Retrieve the World object, which contains country data.
	const world: World = getWorld();
	// Reference to the container div where the tables will be placed.
	const container: HTMLTableElement = document.getElementById(
		"country-continent-name-container"
	) as HTMLTableElement;

	let table: HTMLTableElement = document.createElement("table");
	table.className = "grid-language-item";
	table.ariaColSpan = "1";

	// Create the table body.
	let tableBody: HTMLTableSectionElement = table.createTBody();

	// Add the table title as the first row.
	const titleRow: HTMLTableRowElement = tableBody.insertRow();
	const titleCell: HTMLTableCellElement = titleRow.insertCell();
	titleCell.colSpan = 2; // Ensuring the cell takes full width of the column.
	titleCell.innerHTML =
		`<div class="language-title">` + t("language") + `</div>`;

	let languagePerColumn = 0;

	world.countryArray.forEach((country: Country): void => {
		const languages = country.languages;
		if (!languages || languages.length === 0) return;

		// Add a new table every 10 languages to avoid overflow
		languagePerColumn += languages.length;

		if (languagePerColumn >= 50) {
			table = document.createElement("table");
			table.className = "grid-language-item";
			table.ariaColSpan = "1";
			tableBody = table.createTBody();

			const titleRow: HTMLTableRowElement = tableBody.insertRow();
			const titleCell: HTMLTableCellElement = titleRow.insertCell();
			titleCell.colSpan = 2; // Ensuring the cell takes full width of the column.
			titleCell.innerHTML =
				`<div class="language-title">` + t("language") + `</div>`;
			container.appendChild(table);
			languagePerColumn = 0;
		}

		// Insert the first row with the country name and the first language
		const firstRow: HTMLTableRowElement = tableBody.insertRow();

		const countryCell: HTMLTableCellElement = firstRow.insertCell();
		countryCell.innerHTML = `<div class="cell-text">${country.name}</div>`;
		countryCell.rowSpan = languages.length; // Span for the number of languages

		// Insert the first language into the same row
		const firstLanguageCell: HTMLTableCellElement = firstRow.insertCell();
		firstLanguageCell.innerHTML = `<div class="cell _${world.languageArray.findIndex(
			(l: CountryAttribute) => {
				return l.name === languages[0];
			}
		)}">${languages[0]}</div>`;

		// Insert additional rows for the remaining languages
		for (let i = 1; i < languages.length; i++) {
			const languageRow: HTMLTableRowElement = tableBody.insertRow();
			const languageCell: HTMLTableCellElement = languageRow.insertCell();
			languageCell.innerHTML = `<div class="cell _${world.languageArray.findIndex(
				(l: CountryAttribute) => {
					return l.name === languages[i];
				}
			)}">${languages[i]}</div>`;
		}
	});

	container.appendChild(table);
}
