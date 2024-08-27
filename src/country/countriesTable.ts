// country/countriesTable.ts

import { Countries } from "./Countries";
import { Country } from "./Country";
import { getCountries } from "../scene/sceneManager";

/** Represents the number of countries in each continent for table layout purposes. */
const continentCountryCounts: [number, number, number, number, number, number] =
	[56, 49, 3, 52, 19, 45];

/** Defines the names of the continents. */
const continentNames: string[] = [
	"africa",
	"america",
	"antarctic",
	"asia",
	"oceania",
	"europe",
];

/**
 * Creates and populates separate tables for each continent.
 * Each table starts with the continent name, followed by the countries within that continent.
 *
 * @returns {void}
 */
export function createTable(): void {
	// Retrieve the Countries object, which contains country data.
	const countries: Countries = getCountries();

	// Reference to the container div where the tables will be placed.
	const container: HTMLTableElement = document.getElementById(
		"country-continent-name-container"
	) as HTMLTableElement;

	// Iterate over each continent to create a separate table.
	continentNames.forEach((continent: string, index: number): void => {
		// Skip "Antarctic" as per requirements.
		if (continent === "antarctic") return;

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
		continentCell.innerHTML = `<div class="continent-name" id=${continent.toLowerCase()}>${continent}</div>`;

		// Add the countries as subsequent rows.
		for (let i: number = 0; i < continentCountryCounts[index]; i++) {
			const country: Country = countries.getCountryByLocation([index, i]);
			if (country.getOwnerLocation() !== null) continue;
			const row: HTMLTableRowElement = tableBody.insertRow();
			const cell: HTMLTableCellElement = row.insertCell();
			cell.innerHTML = `<div class="cell invisible" id="_${i}">${country.getCountryName()}</div>`;
		}

		// Append the table to the container div.
		container.appendChild(table);
	});
}

/**
 *
 * @param {number} continentIndex
 * @param {number} index
 * @param {"found" | "missed" | "invisible"} state
 */
export function changeCountryCellTo(
	continentIndex: number,
	index: number,
	state: "found" | "missed" | "invisible"
): void {
	if (continentIndex === 2) {
		console.error("Antarctic index not a possibility for now...");
	} else if (continentIndex > 2) continentIndex -= 1;
	// Retrieve the container element where the tables are appended
	const container: HTMLTableElement = document.getElementById(
		"country-continent-name-container"
	) as HTMLTableElement;

	// Find the table for the specified continent
	const table: HTMLTableElement | null = container.children[
		continentIndex
	] as HTMLTableElement;

	if (!table) {
		console.error(
			`Table for continent ${continentNames[continentIndex]} not found.`
		);
		return;
	}

	// Find the cell with the specific index in the table
	const cell: HTMLTableCellElement | null = table.querySelector(
		`div#_${index}`
	);

	if (!cell) {
		console.error(`Cell with index ${index} not found.`);
		return;
	}

	// Change the cell's class based on the state
	cell.className = `cell ${state}`;
}
