// country/Countries.ts

import { Country } from "./Country";
import { Object3D } from "three";

// A map of game modes to the number of countries to be guessed in that mode.
export const countryToFind: { [gameMode: string]: number } = {
	africa: 53,
	antarctic: 1,
	asia: 47,
	europe: 43,
	north_america: 23,
	oceania: 13,
	south_america: 12,
	base: 191,
};

/**
 * Represents the population of each continent.
 * The values correspond to the number of countries in each continent.
 */
const continentPopulation: number[] = [56, 3, 51, 46, 34, 19, 15];

/**
 * Represents a collection of countries and provides methods to manage and query them.
 */
export class Countries {
	private _countriesArray: Country[] = [];

	/**
	 * Creates an instance of Countries.
	 * Initializes the found count and array size.
	 */
	constructor() {
		this._countriesFound = 0;
	}

	private _continents: Object3D[] = [];

	/**
	 * Retrieves the array of continent 3D objects.
	 *
	 * @returns {Object3D[]} - The array of continent 3D objects.
	 */
	public get continents(): Object3D[] {
		return this._continents;
	}

	/**
	 * Sets the array of continent 3D objects.
	 *
	 * @param {Object3D[]} value - The array of continent 3D objects to set.
	 */
	public set continents(value: Object3D[]) {
		this._continents = value;
	}

	private _countriesFound: number;

	/**
	 * Retrieves the count of found countries.
	 *
	 * @returns {number} - The count of found countries.
	 */
	public get countriesFound(): number {
		return this._countriesFound;
	}

	/**
	 * Retrieves the array of Country objects.
	 *
	 * @returns {Country[]} - The array of Country objects.
	 */
	public get countryArray(): Country[] {
		return this._countriesArray;
	}

	/**
	 * Increment the count of found countries.
	 */
	public incrementFound(): void {
		this._countriesFound++;
	}

	/**
	 * Checks if all countries required by the game mode have been found.
	 *
	 * @param {string} gameMode - The game mode to check.
	 * @returns {boolean} - True if all required countries are found, false otherwise.
	 */
	public isAllFound(gameMode: string): boolean {
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
				obj.state === "unknown" && obj.acceptedNames.includes(name)
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
		this._countriesArray.forEach((country: Country): void => {
			if (country.isFound) {
				country.isFound = false;
			}
		});
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
	public getCountryByObject(object:Object3D):Country{
		const index = this.countryArray.findIndex(
			(country: Country): boolean => country.object===object
		);
		return this.countryArray[index];
	}
}
