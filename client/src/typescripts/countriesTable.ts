// countriesTable.ts

import { Country } from "../models/Country";

/** Represents the population of each continent. */
const continentPopulation: [number, number, number, number, number, number] = [56, 49, 3, 52, 19, 45];

/** Represents the real population of each continent. */
const continentRealPopulation: [number, number, number, number, number, number] = [53, 35, 3, 48, 13, 42];

/**
 * Creates a table displaying countries grouped by continent.
 * @param {Country[]} data - An array of Country objects containing country data.
 * @returns {void}
 */
export function createTable(data: Country[]): void {
	// Reference to the container div where the table will be placed
	const tableContainer: HTMLElement | null = document.getElementById("country-continent-name-container");

	if (!tableContainer) {
		console.error("Table container not found!");
		return;
	}

	// Define the continent names
	const continentNames: string[] = ["Africa", "America", "Antarctic", "Asia", "Oceania", "Europe"];

	// Create a container for the tables
	const tablesContainer: HTMLTableElement = document.createElement("table");
	tablesContainer.classList.add("tables-container");
	const tableRow: HTMLTableRowElement = tablesContainer.createTBody().insertRow();

	// Loop through each continent and create a table
	continentNames.forEach((continent: string, index: number):void => {
		if (continent === "Antarctic") {
			return;
		}
		const body: HTMLTableCellElement = tableRow.insertCell();
		body.classList.add("continent-table");

		// Create a table element
		const table: HTMLTableElement = document.createElement("table");

		// Create a table header row
		const bodyRow: HTMLTableRowElement = table.createTBody().insertRow();
		const cell: HTMLTableCellElement = bodyRow.insertCell();
		cell.textContent = continent;
		cell.className = continent.toLowerCase();

		let className: string = "cell";

		// Loop through the maximum items per column to populate rows
		for (let i: number = 0; i < continentPopulation[index]; i++) {
			const newRow: HTMLTableRowElement = table.insertRow();

			// Get the country index
			const countryIndex: number = getIndexFromLocation(index, i);
			const country: Country = data[countryIndex];
			if (country.getAcceptedNames().length === 0) {
				continue;
			}

			// Create and insert cells into the row
			const countryCell: HTMLTableCellElement = newRow.insertCell();
			countryCell.textContent = country.getCountryName();
			countryCell.className = i < continentRealPopulation[index] ? className : className + "-invisible";
		}
		// Append the table to the container div
		body.appendChild(table);
	});

	tableContainer.appendChild(tablesContainer);
}

/**
 * Gets the real index of a country based on its continent and local index.
 * @param {number} continent - The continent index.
 * @param {number} index - The local index of the country within its continent.
 * @returns {number} The real index of the country.
 */
export function getIndexFromLocation(continent: number, index: number): number {
	let realIndex: number = 0;

	// Sum populations of previous continents up to the specified continent
	for (let i: number = 0; i < continent; i++) {
		realIndex += continentPopulation[i];
	}

	
	// Add local index within the specified continent
	realIndex += index;
	
	return realIndex;
}
