// country/Countries.ts

import { Country } from "./Country";
import { XMLParser } from "fast-xml-parser";
import { Object3D } from "three";

// A map of game modes to the number of countries to be guessed in that mode.
export const countryToFind: { [key: string]: number } = {
	//! need to find the names of the game Modes
	base: 191,
};

/**
 * Represents the population of each continent.
 * The values correspond to the number of countries in each continent.
 */
const continentPopulation: number[] = [56, 49, 3, 52, 19, 45];

/**
 * Represents the real population of each continent.
 * The values are used for accessing country data in each continent.
 */
const continentRealPopulation: number[] = [53, 35, 3, 48, 13, 42];

/**
 * Names of the continents in the game.
 */
const continentNames: string[] = [
	"africa",
	"america",
	"antarctic",
	"asia",
	"oceania",
	"europe",
];

/**
 * Represents a collection of countries and provides methods to manage and query them.
 */
export class Countries {
	protected _countriesArray: Country[] = [];
	protected _countriesFound: number;
	protected _arraySize: number;
	private _continents: Object3D[] = [];

	/**
	 * Creates an instance of Countries.
	 * Initializes the found count and array size.
	 */
	constructor() {
		this._countriesFound = 0;
		this._arraySize = 0;
	}

	/**
	 * Retrieves the array of continent 3D objects.
	 *
	 * @returns {Object3D[]} - The array of continent 3D objects.
	 */
	public getContinents(): Object3D[] {
		return this._continents;
	}

	/**
	 * Sets the array of continent 3D objects.
	 *
	 * @param {Object3D[]} value - The array of continent 3D objects to set.
	 */
	public setContinents(value: Object3D[]) {
		this._continents = value;
	}

	/**
	 * Initializes the Countries object by loading country data from an XML file.
	 *
	 * @param {string} filePath - The path to the XML file containing country data.
	 * @returns {Promise<void>} - A promise that resolves when initialization is complete.
	 */
	public async initialize(filePath: string): Promise<void> {
		this._countriesArray = await this.loadCountryData(filePath);
		console.debug(this._countriesArray);
		this._arraySize = this._countriesArray.length;
	}

	/**
	 * Retrieves the array of Country objects.
	 *
	 * @returns {Country[]} - The array of Country objects.
	 */
	public getCountriesArray(): Country[] {
		return this._countriesArray;
	}

	/**
	 * Increment the count of found countries.
	 */
	public incrementFound(): void {
		this._countriesFound++;
	}

	/**
	 * Retrieves the size of the countries array.
	 *
	 * @returns {number} - The size of the countries array.
	 */
	public getSize(): number {
		return this._arraySize;
	}

	/**
	 * Retrieves the count of found countries.
	 *
	 * @returns {number} - The count of found countries.
	 */
	public getFound(): number {
		return this._countriesFound;
	}

	/**
	 * Checks if all countries required by the game mode have been found.
	 *
	 * @param {string} gameMode - The game mode to check.
	 * @returns {boolean} - True if all required countries are found, false otherwise.
	 */
	public isAllFound(gameMode: string): boolean {
		switch (gameMode) {
			case "fl":
				break;

			default:
				break;
		}
		return countryToFind[gameMode] === this._countriesFound;
	}

	/**
	 * Checks if a country exists by name and if it is in a valid state.
	 *
	 * @param {string} name - The name of the country to check.
	 * @returns {number[]} - An array of indexes where the country is found, or an empty array if not found.
	 */
	public exists(name: string): number[] {
		return this._countriesArray
			.map((obj: Country, index: number): number =>
				obj.getState() === "unknown" &&
				obj.getAcceptedNames().includes(name)
					? index
					: -1
			)
			.filter((index: number): boolean => index !== -1);
	}

	/**
	 * Clears the found status of all countries.
	 * Resets the count of found countries to zero.
	 */
	public clearFound(): void {
		for (let i: number = 0; i < this._countriesArray.length; i++) {
			if (this._countriesArray[i].getFound()) {
				this._countriesArray[i].setFound(false);
			}
		}
		this._countriesFound = 0;
	}

	/**
	 * Retrieves a Country object by its location index.
	 *
	 * @param {number[]} location - The location index of the country.
	 * @returns {Country} - The Country object at the specified location.
	 */
	public getCountryByLocation(location: [number, number]): Country {
		return this._countriesArray[this.getRealIndex(location)];
	}

	/**
	 * Calculates the real index of a country based on its continent and local index.
	 *
	 * @param {number[]} location - The continent and local index of the country.
	 * @returns {number} - The real index of the country.
	 */
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

	/**
	 * Loads country data from an XML file and returns an array of Country instances.
	 *
	 * @param {string} url - The URL of the XML file containing country data.
	 * @returns {Promise<Country[]>} - A promise that resolves to an array of Country instances.
	 */
	private async loadCountryData(url: string): Promise<Country[]> {
		try {
			// Fetch XML data from URL
			const response: Response = await fetch(url);
			const xmlData: string = await response.text();

			// Parse XML to JavaScript object
			const parser: XMLParser = new XMLParser();
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
							number,
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
}
