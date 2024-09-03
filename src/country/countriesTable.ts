// country/countriesTable.ts

import { World } from "./World";
import { Country } from "./Country";
import { getWorld } from "../scene/sceneManager";
import { handleImageClick } from "../controls/inputHandlers";

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
	countryIndex:number[]
): void {
	countryIndex.forEach((index)=>{
		console.log("Index: ", index)
		const countryElement:Country = getWorld().countryArray[index];
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
			console.error(`Cell with index _${continent}_${country} not found.`);
			return;
		}

		// Change the cell's class based on the state
		cell.className = `cell ${state}`;
	})
}

export function populateFlags(continentIndex?:number):void {
	const flagContainer: HTMLElement | null =
		document.getElementById("item-list");
	if (!flagContainer) {
		return;
	}

	const countries: Country[] = getWorld().countryArray;
	const baseURL = `${process.env.PUBLIC_URL}/assets/svg/flags/`;
	for (const country of countries) {
		if (country.isOwned) continue; // skip if the country is not independent
		if (country.name==="Antarctica") continue; //skip Antarctica
		if (continentIndex!==-1 && country.location[0]!==continentIndex) continue // skip if the country is not in the wanted continent
		const flagUrl: string = baseURL + country.svgFlag;

		const imgElement: HTMLImageElement = document.createElement("img");
		imgElement.src = flagUrl;
		imgElement.alt = `${country.location[0]}_${country.location[1]}`;

		// Attach click handler
		imgElement.addEventListener("click", handleImageClick);

		flagContainer.appendChild(imgElement);
	}
	const firstFlag = document.querySelector("img") as HTMLImageElement;

	firstFlag.classList.add("selected");
}
