// country/Countries.ts

import { Country } from "./Country";
import { XMLParser } from "fast-xml-parser";

export const countryToFind: { [key: string]: number } = {
	//! need to find the names of the game Modes
	base: 191,
};
/** Represents the population of each continent. */
const continentPopulation: number[] = [56, 49, 3, 52, 19, 45];

/** Represents the real population of each continent. */
const continentRealPopulation: number[] = [53, 35, 3, 48, 13, 42];

const continentNames: string[] = [
	"africa",
	"america",
	"antarctic",
	"asia",
	"oceania",
	"europe",
];

/**
 * Represents a collection of Country.
 */
export class Countries {
	protected countriesArray: Country[] = [];
	protected countriesFound: number;
	protected arraySize: number;

	/**
	 * Creates an instance of Countries.
	 */
	constructor() {
		this.countriesFound = 0;
		this.arraySize = 0;
	}

	/**
	 * Initialize the Countries object by loading data from the XML file.
	 * @param {string} filePath The path to the XML file.
	 */
	public async initialize(filePath: string): Promise<void> {
		this.countriesArray = await this.loadCountryData(filePath);
		console.debug(this.countriesArray);
		this.arraySize = this.countriesArray.length;
	}

	/**
	 * Get the array of countries.
	 * @returns {Country[]} The array of countries.
	 */
	public getCountriesArray(): Country[] {
		return this.countriesArray;
	}

	/**
	 * Increment the count of found countries.
	 */
	public incrementFound(): void {
		this.countriesFound++;
	}

	/**
	 * Get the size of the countries array.
	 * @returns {number} The size of the countries array.
	 */
	public getSize(): number {
		return this.arraySize;
	}

	/**
	 * Get the count of found countries.
	 * @returns {number} The count of found countries.
	 */
	public getFound(): number {
		return this.countriesFound;
	}

	/**
	 * Check if all countries are found.
	 * @returns {boolean} True if all countries are found, false otherwise.
	 */
	public isAllFound(gameMode: string): boolean {
		switch (gameMode) {
			case "fl":
				
				break;
		
			default:
				break;
		}
		return countryToFind[gameMode] === this.countriesFound;
	}

	/**
	 * Check if a country exists by name and if it is in a valid state.
	 * @param {string} name The name of the country.
	 * @returns {number} The array of the indeces of the country/ies if found, otherwise [].
	 */
	public exists(name: string): number[] {
		return this.countriesArray
			.map((obj, index) =>
				obj.getState() === "unknown" &&
				obj.getAcceptedNames().includes(name)
					? index
					: -1
			)
			.filter((index) => index !== -1);
	}

	/**
	 * Clear the found status of all countries.
	 */
	public clearFound(): void {
		for (let i = 0; i < this.countriesArray.length; i++) {
			if (this.countriesArray[i].getFound()) {
				this.countriesArray[i].setFound(false);
			}
		}
		this.countriesFound = 0;
	}

	public getCountryByLocation(location: number[]): Country {
		return this.countriesArray[this.getRealIndex(location)];
	}

	/** Loads the static XML country data and returns a Country instance Array */
	private async loadCountryData(url: string): Promise<Country[]> {
		try {
			// Fetch XML data from URL
			const response = await fetch(url);
			const xmlData = await response.text();

			// Parse XML to JavaScript object
			const parser = new XMLParser();
			const parsedData = parser.parse(xmlData);

			// Map parsed data to instances of the Country class
			return parsedData.countries.country.map((country: any): Country => {
				let territories = country.territories?.territory || null;
				let languages = country.languages?.language || null;
				let acceptedNames = country.acceptedNames?.name || null;
				// makes sure territories/languages/acceptedNames are in array form
				if (typeof territories === "string") {
					territories = [territories];
				}
				if (typeof languages === "string") {
					languages = [languages];
				}
				if (typeof acceptedNames === "string") {
					acceptedNames = [acceptedNames];
				}

				let ownedLocation = country.ownedLocation
					? (country.ownedLocation.split(",").map(Number) as [
							number,
							number
					  ])
					: null;

				return new Country(
					country.name,
					acceptedNames,
					territories?.map(
						(loc: string) =>
							loc.split(",").map(Number) as [number, number]
					) || null,
					country.location.split(",").map(Number) as [number, number],
					ownedLocation,
					[country.flag.png, country.flag.svg],
					country.currency || null,
					country.capital || null,
					languages
				);
			});
		} catch (error) {
			console.error("Error parsing country data: ", error);
			return [];
		}
	}
	public getRealIndex(location: number[]): number {
		let realIndex: number = 0;

		// Sum populations of previous continents up to the specified continent
		for (let i: number = 0; i < location[0]; i++) {
			realIndex += continentPopulation[i];
		}

		// Add local index within the specified continent
		realIndex += location[1];
		return realIndex;
	}
}
