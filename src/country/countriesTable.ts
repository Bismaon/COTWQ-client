// country/countriesTable.ts

import { Currency, World } from "./World";
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
	world.currencyArray.forEach((currency: Currency, index: number): void => {
		if (index % 15 === 0) {
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
		}
		const row: HTMLTableRowElement = tableBody.insertRow();
		const currencyCell: HTMLTableCellElement = row.insertCell();
		currencyCell.innerHTML = `<div class="cell invisible" id="${currency.name}">${currency.name}</div>`;

		const countryName: string[] = [];
		currency.locations.forEach((index: number): void => {
			countryName.push(world.countryArray[index].name);
		});
		const associatedNames: string = countryName.join(", ");
		const textCell: HTMLTableCellElement = row.insertCell();
		textCell.innerHTML = `<div class="cell-text">${associatedNames}</div>`;
	});

	container.appendChild(table);
}

export function changeCurrenciesCell(
	state: "found" | "missed" | "invisible"
): void {
	const currencyArray: Currency[] = getWorld().currencyArray;

	currencyArray.forEach((currency: Currency): void => {
		changeCurrencyCell(state, currency.name);
	});
}

export function changeCurrencyCell(
	state: "found" | "missed" | "invisible",
	currency: string
): void {
	// Find the cell with the specific index in the table
	const cell: HTMLElement | null = document.getElementById(currency);

	// console.log(cell);
	if (!cell) {
		console.error(`Cell with ID ${currency} not found.`);
		return;
	}

	// Change the cell's class based on the state
	cell.className = `cell ${state}`;
}
