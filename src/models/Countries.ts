// Countries.ts

import {Country} from "./Country";
import {countriesData} from "../typescripts/countriesData";

/**
 * Represents a collection of countries.
 */
export class Countries {

	protected countriesArray: Country[];
	protected countriesFound: number;
	protected arraySize: number;

	/**
	 * Creates an instance of Countries.
	 */
	constructor() {
		this.countriesArray = this.setCountries();
		this.arraySize = this.countriesArray.length;
		this.countriesFound = 0;
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
	public isAllFound(): boolean {
		return this.countriesFound === this.arraySize;
	}

	/**
	 * Check if a country exists by name.
	 * @param {string} name The name of the country.
	 * @returns {number} The index of the country if found, otherwise -1.
	 */
	public exists(name: string): number {
		return this.countriesArray.findIndex(obj => (obj.getAcceptedNames().includes(name)));
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
	}

	/**
	 * Initialize and populate the countries array.
	 * @returns {Country[]} The populated countries array.
	 */
	private setCountries(): Country[] {
		const newCountries: Country[] = [];
		for (let i:number = 0; i < countriesData.length; i++) {
			const countryData: countriesData = countriesData[i];

			const countryName: string = countryData.name;
			const countryLocation: number[] = countryData.location;
			const countryTerritoriesLocation: number[][] | null = countryData.territories;
			const ownedLocation: number[] | null = countryData.ownedLocation;
			const acceptedNames: string[] = countryData.acceptedNames;

			const newCountry: Country = new Country(countryName, acceptedNames, countryTerritoriesLocation, countryLocation, ownedLocation);
			newCountries.push(newCountry);
		}
		return newCountries;
	}
}
