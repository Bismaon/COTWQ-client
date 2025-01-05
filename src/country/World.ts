// country/World.ts

import { Country } from "./Country";
import { Object3D, Vector3 } from "three";
import { getCountryMovement, getStateMaterial } from "../utils/countryUtils";
import {
	changeCACells,
	changeCountryCellTo,
	shuffleArray,
} from "./countriesTable";
import { bounceAnimation } from "../utils/animation";
import { isAcceptedName } from "../controls/inputHandlers";
import {
	changeCountryOfCountryAttribute,
	correctContinent,
	makeMaterialWithGradient,
} from "../utils/utilities";

export const countriesCountByRegion: { [region: string]: number } = {
	africa: 53,
	antarctic: 1,
	asia: 47,
	europe: 43,
	north_america: 23,
	oceania: 13,
	south_america: 12,
	all_regions: 191,
};
export const currencyByRegion: number[] = [41, 0, 46, 20, 16, 9, 12, 146];
export const languageByRegion: number[] = [40, 0, 40, 41, 4, 13, 8, 136];

export interface BaseItem {
	type: string;
	found: boolean;
}
export interface CountryAttribute extends BaseItem {
	name: string;
	locations: number[];
	region: number[];
	selected: boolean;
}

/**
 * Number of country Object in each continent array
 */
const continentPopulation: number[] = [56, 3, 51, 46, 34, 19, 15];

export class World {
	private readonly _continents: Object3D[];
	private readonly _languageArray: CountryAttribute[];
	private readonly _currencyArray: CountryAttribute[];

	constructor() {
		this._countriesFound = 0;
		this._countryArray = [];
		this._continents = [];
		this._currencyArray = [];
		this._languageArray = [];
		this._sequentialRandomArray = [];
		this._sequentialRandomIndex = 0;
	}

	private _sequentialRandomArray: BaseItem[];

	public get sequentialRandomArray(): BaseItem[] {
		return this._sequentialRandomArray;
	}

	public set sequentialRandomArray(value: BaseItem[]) {
		this._sequentialRandomArray = value;
	}

	private _sequentialRandomIndex: number;

	public get sequentialRandomIndex(): number {
		return this._sequentialRandomIndex;
	}

	public set sequentialRandomIndex(value: number) {
		this._sequentialRandomIndex = value;
	}

	public get currencyArray(): CountryAttribute[] {
		return this._currencyArray;
	}

	private _countryArray: Country[];

	public get countryArray(): Country[] {
		return this._countryArray;
	}

	public get languageArray(): CountryAttribute[] {
		return this._languageArray;
	}

	public get continents(): Object3D[] {
		return this._continents;
	}

	private _countriesFound: number;

	public get countriesFound(): number {
		return this._countriesFound;
	}

	/**
	 * Replaces the existing countries in the world with a new array.
	 * @param {Country[]} newCountry - The new array of countries.
	 */
	public replaceCountries(newCountry: Country[]): void {
		this._countryArray = newCountry;
	}

	/**
	 * Retrieves all countries in a specified region.
	 * @param {number} regionNumber - The region index.
	 * @returns {Country[]} An array of countries in the specified region.
	 */
	public getRegionCountries(regionNumber: number): Country[] {
		if (regionNumber === 7) {
			return this._countryArray;
		}

		return this._countryArray.filter((country) => {
			return country.location[0] === regionNumber;
		});
	}

	/**
	 * Increments the count of found countries.
	 */
	public incrementFound(): void {
		this._countriesFound++;
	}

	/**
	 * Checks if all countries in a region have been found.
	 * @param {string} region - The region name.
	 * @returns {boolean} True if all countries are found, otherwise false.
	 */
	public isAllFound(region: string): boolean {
		return countriesCountByRegion[region] === this._countriesFound;
	}

	/**
	 * Checks if a country exists based on its name.
	 * @param {string} name - The name of the country.
	 * @returns {number[]} An array of indices of countries matching the name.
	 */
	public exists(name: string): number[] {
		return this._countryArray
			.map((obj: Country, index: number): number =>
				isAcceptedName(obj.acceptedNames, name) ? index : -1
			)
			.filter((index: number): boolean => index !== -1);
	}

	/**
	 * Clears the "found" state of all countries.
	 */
	public clearFound(): void {
		this._countryArray.forEach((country: Country): void => {
			if (country.found) {
				country.found = false;
			}
		});
		this._countriesFound = 0;
	}

	/**
	 * Retrieves a country by its location coordinates.
	 * @param {[number, number]} location - The location coordinates.
	 * @returns {Country} The country at the specified location.
	 */
	public getCountryByLocation(location: [number, number]): Country {
		return this._countryArray[this.getRealIndex(location)];
	}

	/**
	 * Calculates the real index of a country based on its location.
	 * @param {number[]} location - The location coordinates.
	 * @returns {number} The real index of the country.
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
	 * Retrieves a country based on its 3D object.
	 * @param {Object3D} object - The 3D object representing the country.
	 * @returns {Country} The country corresponding to the object.
	 */
	public getCountryByObject(object: Object3D): Country {
		const index: number = this.countryArray.findIndex(
			(country: Country): boolean =>
				country.object === object || country.object === object.parent
		);
		return this.countryArray[index];
	}

	/**
	 * Sets the state for a country and its connected territories.
	 * @param {number} index - The index of the country.
	 * @param {string} state - The state to set.
	 */
	public setCountryAndConnectedState(index: number, state: string): void {
		const countriesIndex: number[] = this.getConnectedTerritories(index);
		countriesIndex.forEach((index): void => {
			this.setCountryState(index, state);
		});
	}

	/**
	 * Sets the state for a single country.
	 * @param {number} index - The index of the country.
	 * @param {string} state - The state to set.
	 */
	public setCountryState(index: number, state: string): void {
		const country: Country = this._countryArray[index];
		country.state = state;
		country.material = getStateMaterial(state);
	}

	/**
	 * Sets the flag material for a country and its connected territories.
	 * @param {number} index - The index of the country.
	 */
	public setCountryAndConnectedFlag(index: number): void {
		const countriesIndex: number[] = this.getConnectedTerritories(index);
		countriesIndex.forEach((index: number): void => {
			this.setCountryFlag(index);
		});
	}

	/**
	 * Sets the flag material for a single country.
	 * @param {number} index - The index of the country.
	 */
	public setCountryFlag(index: number): void {
		const country: Country = this._countryArray[index];
		country.material = country.flagMaterial;
	}

	/**
	 * Toggles the visibility of a country and its connected territories.
	 * @param {number} index - The index of the country.
	 * @param {boolean} visibility - The visibility state.
	 */
	public setCountryAndConnectedVisibility(
		index: number,
		visibility: boolean
	): void {
		const countriesIndex: number[] = this.getConnectedTerritories(index);
		countriesIndex.forEach((index: number): void => {
			this.setCountryVisibility(index, visibility);
		});
	}

	/**
	 * Toggles the visibility of a single country.
	 * @param {number} index - The index of the country.
	 * @param {boolean} visibility - The visibility state.
	 */
	public setCountryVisibility(index: number, visibility: boolean): void {
		const country: Country = this._countryArray[index];
		country.visible = visibility;
	}

	/**
	 * Applies "found" effects to a country.
	 * @param {number} index - The index of the country.
	 */
	public applyFoundEffectsToCountry(index: number): void {
		const mainCountry: Country = this._countryArray[index];
		if (!mainCountry.visible) {
			// Hard mode
			this.setCountryAndConnectedVisibility(index, true);
		}
		this.setCountryAndConnectedIsFound(index, true); // because only called by flags/capital/names
		changeCountryCellTo("found", [index]);

		this.triggerCountryAnimation(index, "", "found", true);
	}

	/**
	 * Sets the "found" state for a single country.
	 * @param {number} index - The index of the country.
	 * @param {boolean} found - The found state.
	 */
	public setCountryIsFound(index: number, found: boolean): void {
		const country: Country = this._countryArray[index];
		country.found = found;
		if (!country.owned) {
			this.incrementFound();
		}
	}

	/**
	 * Sets the "found" state for a country and its connected territories.
	 * @param {number} index - The index of the country.
	 * @param {boolean} found - The found state.
	 */
	public setCountryAndConnectedIsFound(index: number, found: boolean): void {
		const countryIndex: number[] = this.getConnectedTerritories(index);
		countryIndex.forEach((index: number): void => {
			this.setCountryIsFound(index, found);
		});
	}

	/**
	 * Configures the countries for a specific game type and difficulty.
	 * @param {boolean} hard - Whether the game is in hard mode.
	 * @param {number} continentIndex - The index of the continent.
	 * @param {string} gameType - The game type (e.g., "flags").
	 */
	public setUpCountries(
		hard: boolean,
		continentIndex: number,
		gameType: string
	): void {
		this._countryArray.forEach((country: Country, index: number): void => {
			if (country.owned) {
				return;
			}
			if (!correctContinent(continentIndex, country)) {
				this.setCountryAndConnectedState(index, "unavailable");
			} else {
				if (!["currencies", "languages"].includes(gameType)) {
					changeCountryCellTo("unavailable", [index]);
				}
				if (hard) {
					this.setCountryAndConnectedVisibility(index, false);
				}
				this.setCountryAndConnectedState(index, "unknown");
			}
		});
	}

	/**
	 * Resets the countries to their default state.
	 * @param {number} continentIndex - The index of the continent to reset.
	 */
	public resetCountries(continentIndex: number): void {
		this._countryArray.forEach((country: Country, index: number): void => {
			if (country.owned) return;
			if (continentIndex !== -1 && country.location[0] !== continentIndex)
				return;
			this.setCountryAndConnectedVisibility(index, true);
			this.setCountryAndConnectedState(index, "unknown");
		});
	}

	/**
	 * Animates a country's movement with a bounce effect.
	 * @param {number} index - The index of the country.
	 * @param {string} type - The type of animation.
	 * @param {string} state - The state to apply after animation.
	 * @param {boolean} complete - Whether to apply to connected territories.
	 */
	public triggerCountryAnimation(
		index: number,
		type: string,
		state: string,
		complete: boolean
	): void {
		const countriesIndex: number[] = complete
			? this.getConnectedTerritories(index)
			: [index];

		countriesIndex.forEach((countryIndex: number): void => {
			const country: Country = this._countryArray[countryIndex];
			const countryObj: Object3D = country.object;
			const [orgPos, targetPos]: Vector3[] = getCountryMovement(
				countryObj,
				100
			);

			if (type === "language") {
				state = type;
			}

			// Execute bounce animation, and apply the state-specific logic after completion.
			bounceAnimation(countryObj, orgPos, targetPos, (): void => {
				this.applyState(countryIndex, state);
			});
		});
	}

	/**
	 * Adds a long-form country attribute to the world.
	 * @param {string} type - The type of the attribute (e.g., "language").
	 * @param {any[]} attributeArray - The array of attributes.
	 * @param {[number, number]} location - The location of the country.
	 * @param {boolean} owned - Whether the country is owned.
	 */
	public addMissingCountryAttributeLong(
		type: string,
		attributeArray: any[],
		location: [number, number],
		owned: boolean
	): void {
		attributeArray.forEach((attributeName: any): void => {
			this.addMissingCountryAttributeSingle(
				type,
				attributeName,
				location,
				owned
			);
		});
	}

	/**
	 * Adds a single country attribute to the world.
	 * @param {string} type - The type of the attribute (e.g., "currency").
	 * @param {any} attributeName - The name of the attribute.
	 * @param {[number, number]} location - The location of the country.
	 * @param {boolean} owned - Whether the country is owned.
	 */
	public addMissingCountryAttributeSingle(
		type: string,
		attributeName: any,
		location: [number, number],
		owned: boolean
	): void {
		if (attributeName === "") {
			return;
		}
		let countryAttributes;
		switch (type) {
			case "currency":
				countryAttributes = this._currencyArray;
				break;
			case "language":
				countryAttributes = this._languageArray;
				break;
			default:
				console.error(`Country attribute of ${type} unknown.`);
				return;
		}
		const attributeIndex: number = countryAttributes.findIndex(
			(attribute: CountryAttribute): boolean => {
				return attribute.name === attributeName;
			}
		);
		const countryIndex: number = this.getRealIndex(location);
		const region: number[] = owned ? [7] : [location[0]];

		if (attributeIndex === -1) {
			if (region[0] !== 7) {
				region.push(7);
			}
			countryAttributes.push({
				type: type,
				name: attributeName,
				locations: [countryIndex],
				found: false,
				region: region,
				selected: false,
			});
		} else {
			const countryAttribute: CountryAttribute =
				countryAttributes[attributeIndex];
			if (!countryAttribute.region.includes(region[0])) {
				countryAttribute.region.push(region[0]);
			}

			countryAttribute.locations.push(this.getRealIndex(location));
		}
	}

	/**
	 * Checks if all country attributes of a specific type have been found in a region.
	 * @param {string} type - The type of the attribute (e.g., "language").
	 * @param {number} region - The region index.
	 * @returns {boolean} True if all attributes are found, otherwise false.
	 */
	public allCountryAttributeFound(type: string, region: number): boolean {
		switch (type) {
			case "currency":
				return (
					this.getFoundCA(type, region).length ===
					currencyByRegion[region]
				);
			case "language":
				return (
					this.getFoundCA(type, region).length ===
					languageByRegion[region]
				);
			default:
				console.error(`Country attribute of type ${type} unknown.`);
				return false;
		}
	}

	/**
	 * Checks if all country attributes of a specific type have been found in a region.
	 * @param {string} type - The type of the attribute (e.g., "language").
	 * @param {number} region - The region index.
	 * @returns {boolean} True if all attributes are found, otherwise false.
	 */
	public getFoundCA(type: any, region: number): CountryAttribute[] {
		let foundArray: CountryAttribute[];
		switch (type) {
			case "currency":
				foundArray = this._currencyArray.filter(
					(currency: CountryAttribute): boolean => {
						return (
							currency.found && currency.region.includes(region)
						);
					}
				);
				return foundArray;
			case "language":
				foundArray = this._languageArray.filter(
					(language: CountryAttribute): boolean => {
						return (
							language.found && language.region.includes(region)
						);
					}
				);
				return foundArray;
			default:
				console.error(`Country attribute of type ${type} unknown.`);
				return [];
		}
	}

	/**
	 * Moves to the next item in the sequential array.
	 */
	public nextInSeqArr(): void {
		this._sequentialRandomIndex =
			(this.sequentialRandomIndex + 1) %
			this._sequentialRandomArray.length;
	}

	/**
	 * Moves to the previous item in the sequential array.
	 */
	public prevInSeqArr(): void {
		this._sequentialRandomIndex =
			(this.sequentialRandomIndex -
				1 +
				this._sequentialRandomArray.length) %
			this._sequentialRandomArray.length;
	}

	/**
	 * Applies a state to a country based on the game type.
	 * @param {number} index - The index of the country.
	 * @param {string} state - The state to apply.
	 */
	public applyState(index: number, state: string): void {
		switch (state) {
			case "flags":
				this.setCountryFlag(index);
				return;
			case "language":
				const country: Country = this._countryArray[index];
				const percentage: number =
					this.calculateLanguagePercentage(country);
				this._countryArray[index].material =
					makeMaterialWithGradient(percentage);
				return;
			default:
				this.setCountryState(index, state);
				return;
		}
	}

	/**
	 * Completes the game for a specific type and region.
	 * @param {string} type - The game type (e.g., "currencies").
	 * @param {number} region - The region index.
	 */
	public finishGame(type: string, region: number): void {
		switch (type) {
			case "currencies":
				this._currencyArray.forEach(
					(attribute: CountryAttribute): void => {
						if (
							!attribute.found &&
							attribute.region.includes(region)
						) {
							changeCountryOfCountryAttribute(
								attribute,
								"found",
								region
							);
						}
					}
				);
				break;
			case "languages":
				this._languageArray.forEach(
					(attribute: CountryAttribute): void => {
						if (
							!attribute.found &&
							attribute.region.includes(region)
						) {
							changeCountryOfCountryAttribute(
								attribute,
								"found",
								region
							);
						}
					}
				);
				break;
			default:
				this._countryArray.forEach(
					(country: Country, index: number): void => {
						if (
							!country.owned &&
							!country.found &&
							(region === 7 || country.location[0] === region)
						) {
							this.applyFoundEffectsToCountry(index);
						}
					}
				);
				break;
		}
	}

	/**
	 * Resets items for sequential game modes.
	 * @param {boolean} sequentialRandom - Whether sequential mode is active.
	 * @param {string} gameType - The game type.
	 */
	public resetSequentialItems(
		sequentialRandom: boolean,
		gameType: string
	): void {
		if (!sequentialRandom) return;
		this._sequentialRandomIndex = 0;
		switch (gameType) {
			case "languages":
				this._sequentialRandomArray = shuffleArray(this._languageArray);
				break;
			case "currencies":
				this._sequentialRandomArray = shuffleArray(this._currencyArray);
				break;
			default:
				this._sequentialRandomArray = shuffleArray(this._countryArray);
				break;
		}
	}

	/**
	 * Resets country attributes for a specific game type.
	 * @param {string} gameType - The game type (e.g., "languages").
	 */
	public resetCA(gameType: string): void {
		switch (gameType) {
			case "languages":
				this._languageArray.forEach((language: CountryAttribute) => {
					language.found = false;
				});
				changeCACells("unavailable", "language");

				break;
			case "currencies":
				this._currencyArray.forEach((currency: CountryAttribute) => {
					currency.found = false;
				});
				changeCACells("unavailable", "currency");
				break;
			default:
				break;
		}
	}

	// Helper method to calculate the percentage of found languages
	private calculateLanguagePercentage(country: Country): number {
		if (!country.languages) return 0;

		const foundLanguages: number = country.languages.filter(
			(lang: string): CountryAttribute | undefined =>
				this._languageArray.find(
					(l: CountryAttribute): boolean => l.name === lang && l.found
				)
		).length;

		return (foundLanguages / country.languages.length) * 100;
	}

	private getConnectedTerritories(index: number): number[] {
		let baseCountry: Country = this._countryArray[index];
		if (baseCountry.owner !== null) {
			baseCountry = this.getCountryByLocation(baseCountry.owner);
		}
		const connected: number[] = [this.getRealIndex(baseCountry.location)];

		baseCountry.territories.forEach((location: [number, number]): void => {
			connected.push(this.getRealIndex(location));
		});
		return connected;
	}
}
