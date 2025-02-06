// country/World.ts

import { Country } from "./Country";
import { Object3D, Vector3 } from "three";
import {
	changeCACells,
	changeCountryCellTo,
	shuffleMap,
} from "../utils/countryUtils";
import { bounceAnimation } from "../utils/animation";
import { isAcceptedName } from "../controls/inputHandlers";
import {
	changeCountryOfCountryAttribute,
	hasValue,
	makeMaterialWithGradient,
} from "../utils/utilities";
import {
	continentCountryCounts,
	countriesCountByRegion,
	CURRENCIES,
	CURRENCY,
	currencyByRegion,
	FLAGS,
	FOUND,
	LANGUAGE,
	languageByRegion,
	LANGUAGES,
	UNAVAILABLE,
	UNKNOWN,
} from "../utils/constants";
import { getStateMaterial } from "../utils/colorUtils";
import { getCountryMovement } from "../utils/renderUtils";
import { Language } from "./Language";
import { Currency } from "./Currency";
import { AttributeStructure } from "./AttributeStructure";
import { countryLoc } from "../utils/types";

export class World {
	private readonly _continents: Object3D[];

	constructor() {
		this._countriesFound = 0;
		this._continents = [];
		this._sequentialRandomIndex = 0;
	}

	private _languages: Map<number, Language> = new Map();

	public get languages(): Map<number, Language> {
		return this._languages;
	}

	private _currencies: Map<number, Currency> = new Map();

	public get currencies(): Map<number, Currency> {
		return this._currencies;
	}

	private _sequentialRandomMap: Map<number, AttributeStructure> = new Map();

	public get sequentialRandomMap(): Map<number, AttributeStructure> {
		return this._sequentialRandomMap;
	}

	public set sequentialRandomMap(value: Map<number, AttributeStructure>) {
		this._sequentialRandomMap = value;
	}

	private _sequentialRandomIndex: number;

	public get sequentialRandomIndex(): number {
		return this._sequentialRandomIndex;
	}

	public set sequentialRandomIndex(value: number) {
		this._sequentialRandomIndex = value;
	}

	private _countries: Map<number, Country> = new Map();

	public get countries(): Map<number, Country> {
		return this._countries;
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
	 * @param newCountries
	 */
	public replaceCountries(newCountries: Country[]): void {
		this.countries.clear();
		newCountries.forEach((country: Country, index: number): void => {
			this.countries.set(index, country);
		});
	}

	/**
	 * Retrieves all countries in a specified region.
	 * @param {number} regionNumber - The region index.
	 * @returns {Country[]} An array of countries in the specified region.
	 */
	public getRegionCountries(regionNumber: number): Map<number, Country> {
		if (regionNumber === 7) {
			return this._countries;
		}

		return new Map(
			Array.from(this._countries.entries()).filter(
				([_, country]: [number, Country]): boolean => {
					return country.location[0] === regionNumber;
				}
			)
		);
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
	public isAllFound(region: number): boolean {
		return countriesCountByRegion[region] === this._countriesFound;
	}

	/**
	 * Checks if a country exists based on its name.
	 * @param {string} name - The name of the country.
	 * @returns {number[]} An array of indices of countries matching the name.
	 */
	public exists(name: string): number[] {
		let possibility: number[] = [];
		this._countries.forEach((country: Country): void => {
			if (isAcceptedName(country.acceptedNames, name)) {
				possibility.push(this.getRealIndex(country.location));
			}
		});
		return possibility;
	}

	/**
	 * Clears the FOUND state of all countries.
	 */
	public clearFound(): void {
		this._countries.forEach((country: Country): void => {
			if (country.found) {
				country.found = false;
			}
		});
		this._countriesFound = 0;
	}

	/**
	 * Retrieves a country by its location coordinates.
	 * @param {countryLoc} location - The location coordinates.
	 * @returns {Country} The country at the specified location.
	 */
	public getCountryByLocation(location: countryLoc): Country {
		let key: number = this.getRealIndex(location);
		return this._countries.get(key) as Country;
	}

	/**
	 * Calculates the real index of a country based on its location.
	 * @param {countryLoc} location - The location coordinates.
	 * @returns {number} The real index of the country.
	 */
	public getRealIndex(location: countryLoc): number {
		let realIndex: number = 0;

		// Sum populations of previous continents up to the specified continent
		for (let i: number = 0; i < location[0]; i++) {
			realIndex += continentCountryCounts[i];
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
	public getCountryByObject(object: Object3D): Country | undefined {
		for (const country of Array.from(this._countries.values())) {
			if (country.object === object || country.object === object.parent) {
				return country;
			}
		}
		return undefined; // Return undefined if no match is found
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
		const country: Country = this._countries.get(index) as Country;
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
		const country: Country = this._countries.get(index) as Country;
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
			(this._countries.get(index) as Country).visible = visibility;
		});
	}

	/**
	 * Applies to FOUND effects to a country.
	 * @param {number} index - The index of the country.
	 */
	public applyFoundEffectsToCountry(index: number): void {
		const mainCountry: Country = this._countries.get(index) as Country;
		if (!mainCountry.visible) {
			// Hard mode
			this.setCountryAndConnectedVisibility(index, true);
		}
		this.setCountryAndConnectedIsFound(index, true); // because only called by flags/capital/names
		changeCountryCellTo(FOUND, [index]);

		this.triggerCountryAnimation(index, "", FOUND, true);
	}

	/**
	 * Sets the FOUND state for a single country.
	 * @param {number} index - The index of the country.
	 * @param {boolean} found - The found state.
	 */
	public setCountryIsFound(index: number, found: boolean): void {
		const country: Country = this._countries.get(index) as Country;
		country.found = found;
		if (!country.owned) {
			this.incrementFound();
		}
	}

	/**
	 * Sets the FOUND state for a country and its connected territories.
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
	 * @param region
	 * @param {string} gameType - The game type (e.g., FLAGS).
	 */
	public setUpCountries(
		hard: boolean,
		region: number,
		gameType: string
	): void {
		this._countries.forEach((country: Country, index: number): void => {
			if (country.owned) {
				return;
			}
			if (!country.isInRegion(region)) {
				this.setCountryAndConnectedState(index, UNAVAILABLE);
			} else {
				if (![CURRENCIES, LANGUAGES].includes(gameType)) {
					changeCountryCellTo(UNAVAILABLE, [index]);
				}
				if (hard) {
					this.setCountryAndConnectedVisibility(index, false);
				}
				this.setCountryAndConnectedState(index, UNKNOWN);
			}
		});
	}

	/**
	 * Resets the countries to their default state.
	 * @param {number} region - The index of the continent to reset.
	 */
	public resetCountries(region: number): void {
		this._countries.forEach((country: Country, index: number): void => {
			if (country.owned || !country.isInRegion(region)) return;
			this.setCountryAndConnectedVisibility(index, true);
			this.setCountryAndConnectedState(index, UNKNOWN);
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
			const country: Country = this._countries.get(
				countryIndex
			) as Country;
			const countryObj: Object3D = country.object;
			const [orgPos, targetPos]: Vector3[] = getCountryMovement(
				countryObj,
				100
			);

			if (type === LANGUAGE) {
				state = type;
			}

			// Execute bounce animation, and apply the state-specific logic after completion.
			bounceAnimation(countryObj, orgPos, targetPos, (): void => {
				this.applyState(countryIndex, state);
			});
		});
	}

	/**
	 * Checks if all country attributes of a specific type have been found in a region.
	 * @param {string} type - The type of the attribute (e.g., LANGUAGE).
	 * @param {number} region - The region index.
	 * @returns {boolean} True if all attributes are found, otherwise false.
	 */
	public allCountryAttributeFound(type: string, region: number): boolean {
		switch (type) {
			case CURRENCY:
				return (
					this.getFoundCA(type, region).size ===
					currencyByRegion[region]
				);
			case LANGUAGE:
				return (
					this.getFoundCA(type, region).size ===
					languageByRegion[region]
				);
			default:
				console.error(`Country attribute of type ${type} unknown.`);
				return false;
		}
	}

	/**
	 * Returns all country attributes of a specific type that have been found in a region.
	 * @param {string} type - The type of the attribute (e.g., LANGUAGE).
	 * @param {number} region - The region index.
	 * @returns {boolean} True if all attributes are found, otherwise false.
	 */
	public getFoundCA(type: any, region: number): Map<number, any> {
		let foundArray: Map<number, any> = new Map();

		switch (type) {
			case CURRENCY:
				this._currencies.forEach(
					(currency: Currency, index: number): void => {
						if (currency.found && currency.isInRegion(region)) {
							foundArray.set(index, currency);
						}
					}
				);
				return foundArray;
			case LANGUAGE:
				this.languages.forEach(
					(language: Language, index: number): void => {
						if (language.found && language.isInRegion(region)) {
							foundArray.set(index, language);
						}
					}
				);
				return foundArray;
			default:
				console.error(`Country attribute of type ${type} unknown.`);
				return new Map();
		}
	}

	/**
	 * Moves to the next item in the sequential array.
	 */
	public nextInSeqArr(): void {
		this._sequentialRandomIndex =
			(this.sequentialRandomIndex + 1) % this._sequentialRandomMap.size;
	}

	/**
	 * Moves to the previous item in the sequential array.
	 */
	public prevInSeqArr(): void {
		this._sequentialRandomIndex =
			(this.sequentialRandomIndex - 1 + this._sequentialRandomMap.size) %
			this._sequentialRandomMap.size;
	}

	/**
	 * Applies a state to a country based on the game type.
	 * @param {number} index - The index of the country.
	 * @param {string} state - The state to apply.
	 */
	public applyState(index: number, state: string): void {
		switch (state) {
			case FLAGS:
				this.setCountryFlag(index);
				return;
			case LANGUAGE:
				const country: Country = this._countries.get(index) as Country;
				const percentage: number =
					this.calculateLanguagePercentage(country);
				country.material = makeMaterialWithGradient(percentage);
				return;
			default:
				this.setCountryState(index, state);
				return;
		}
	}

	/**
	 * Completes the game for a specific type and region.
	 * @param {string} type - The game type (e.g., CURRENCIES).
	 * @param {number} region - The region index.
	 */
	public finishGame(type: string, region: number): void {
		switch (type) {
			case CURRENCIES:
				this._currencies.forEach((currency: Currency): void => {
					if (!currency.found && currency.isInRegion(region)) {
						changeCountryOfCountryAttribute(
							currency,
							FOUND,
							region
						);
					}
				});
				break;
			case LANGUAGES:
				this.languages.forEach((language: Language): void => {
					if (!language.found && language.isInRegion(region)) {
						changeCountryOfCountryAttribute(
							language,
							FOUND,
							region
						);
					}
				});
				break;
			default:
				this._countries.forEach((country: Country): void => {
					if (
						!country.owned &&
						!country.found &&
						country.isInRegion(region)
					) {
						this.applyFoundEffectsToCountry(
							this.getRealIndex(country.location)
						);
					}
				});
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
			case LANGUAGES:
				this._sequentialRandomMap = shuffleMap(this.languages);
				break;
			case CURRENCIES:
				this._sequentialRandomMap = shuffleMap(this._currencies);
				break;
			default:
				this._sequentialRandomMap = shuffleMap(this._countries);
				break;
		}
	}

	/**
	 * Resets country attributes for a specific game type.
	 * @param {string} gameType - The game type (e.g., "_languages").
	 */
	public resetCA(gameType: string): void {
		switch (gameType) {
			case LANGUAGES:
				this.languages.forEach((language: Language): void => {
					language.found = false;
				});
				changeCACells(UNAVAILABLE, LANGUAGE);

				break;
			case CURRENCIES:
				this._currencies.forEach((currency: Currency): void => {
					currency.found = false;
				});
				changeCACells(UNAVAILABLE, CURRENCY);
				break;
			default:
				break;
		}
	}

	public addLanguage(index: number, language: Language): void {
		let potIndex = hasValue(this._languages, (value: Language): boolean => {
			return value.name === language.name;
		});
		if (potIndex === -1) {
			this._languages.set(index, language);
		} else {
			let langBeforeMod: Language = this._languages.get(
				potIndex
			) as Language;
			langBeforeMod.addTerritory(language.territories[0]);
			if (!langBeforeMod.isInRegion(language.territories[0][0])) {
				langBeforeMod.addRegion(language.territories[0][0]);
			}
			this._languages.set(potIndex, langBeforeMod);
		}
	}

	public addCurrency(index: number, currency: Currency): void {
		let potIndex = hasValue(
			this._currencies,
			(value: Currency): boolean => {
				return value.name === currency.name;
			}
		);
		if (potIndex === -1) {
			this._currencies.set(index, currency);
		} else {
			let currBeforeMod: Currency = this._currencies.get(
				potIndex
			) as Currency;
			currBeforeMod.addTerritory(currency.territories[0]);
			this._currencies.set(potIndex, currBeforeMod);
		}
	}

	public getLanguage(name: string): Language | undefined {
		this._languages.forEach((language: Language): Language | undefined => {
			if (language.name === name) return language;
		});
		return undefined;
	}

	public getCurrency(name: string): Currency | undefined {
		this._currencies.forEach((currency: Currency): Currency | undefined => {
			if (currency.name === name) return currency;
		});
		return undefined;
	}

	public getLanguagesFrom(location: countryLoc): Map<number, Language> {
		let languages: Map<number, Language> = new Map();
		this._languages.forEach((language: Language, index: number): void => {
			if (language.isInCountry(location)) {
				languages.set(index, language);
			}
		});
		return languages;
	}

	public getCurrencyFrom(location: countryLoc): Map<number, Currency> {
		let currency: Map<number, Currency> = new Map();
		this._currencies.forEach((c1: Currency, i: number): void => {
			if (c1.isInCountry(location)) {
				currency.set(i, c1);
			}
		});
		return currency;
	}

	public getLanguagesEntriesFrom(
		location: countryLoc
	): IterableIterator<[number, Language]> {
		return this.getLanguagesFrom(location).entries();
	}

	public getLanguagesArrayFrom(location: countryLoc): [number, Language][] {
		return Array.from(this.getLanguagesEntriesFrom(location));
	}

	public getCurrencyEntriesFrom(
		location: countryLoc
	): IterableIterator<[number, Currency]> {
		return this.getCurrencyFrom(location).entries();
	}
	public getCurrencyArrayFrom(location: countryLoc): [number, Currency][] {
		return Array.from(this.getCurrencyEntriesFrom(location));
	}
	// Helper method to calculate the percentage of found _languages
	private calculateLanguagePercentage(country: Country): number {
		if (country.langAmount === 0) {
			return 0;
		}

		let langFound: number = 0;
		this._languages.forEach((language: Language): void => {
			if (language.isInCountry(country.location) && language.found) {
				langFound++;
			}
		});

		return (langFound / country.langAmount) * 100;
	}

	private getConnectedTerritories(index: number): number[] {
		let baseCountry: Country = this._countries.get(index) as Country;
		if (baseCountry.owner !== null) {
			baseCountry = this.getCountryByLocation(baseCountry.owner);
		}
		const connected: number[] = [this.getRealIndex(baseCountry.location)];

		baseCountry.territories.forEach((location: countryLoc): void => {
			connected.push(this.getRealIndex(location));
		});
		console.log("connected:", connected);
		return connected;
	}
}
