// country/World.ts

import { Country } from "./Country";
import { Object3D, Vector3 } from "three";
import { getCountryMovement, getStateMaterial } from "../utils/countryUtils";
import { changeCountryCellTo } from "./countriesTable";
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

export interface CountryAttribute {
	type: string;
	name: string;
	locations: number[];
	found: boolean;
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

	private _sequentialRandomArray: any[];

	public get sequentialRandomArray(): any[] {
		return this._sequentialRandomArray;
	}

	public set sequentialRandomArray(value: any[]) {
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

	public replaceCountries(newCountry: Country[]): void {
		this._countryArray = newCountry;
	}

	public incrementFound(): void {
		this._countriesFound++;
	}

	public isAllFound(region: string): boolean {
		return countriesCountByRegion[region] === this._countriesFound;
	}

	public exists(name: string): number[] {
		return this._countryArray
			.map((obj: Country, index: number): number =>
				isAcceptedName(obj.acceptedNames, name) ? index : -1
			)
			.filter((index: number): boolean => index !== -1);
	}

	public clearFound(): void {
		this._countryArray.forEach((country: Country): void => {
			if (country.found) {
				country.found = false;
			}
		});
		this._countriesFound = 0;
	}

	public getCountryByLocation(location: [number, number]): Country {
		return this._countryArray[this.getRealIndex(location)];
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

	public getCountryByObject(object: Object3D): Country {
		const index: number = this.countryArray.findIndex(
			(country: Country): boolean =>
				country.object === object || country.object === object.parent
		);
		return this.countryArray[index];
	}

	public setCountryAndConnectedState(index: number, state: string): void {
		const countriesIndex: number[] = this.getConnectedTerritories(index);
		countriesIndex.forEach((index): void => {
			this.setCountryState(index, state);
		});
	}

	public setCountryState(index: number, state: string): void {
		const country: Country = this._countryArray[index];
		country.state = state;
		country.material = getStateMaterial(state);
	}

	public setCountryAndConnectedFlag(index: number): void {
		const countriesIndex: number[] = this.getConnectedTerritories(index);
		countriesIndex.forEach((index: number): void => {
			this.setCountryFlag(index);
		});
	}

	public setCountryFlag(index: number): void {
		const country: Country = this._countryArray[index];
		country.material = country.flagMaterial;
	}

	public setCountryAndConnectedVisibility(
		index: number,
		visibility: boolean
	): void {
		const countriesIndex: number[] = this.getConnectedTerritories(index);
		countriesIndex.forEach((index: number): void => {
			this.setCountryVisibility(index, visibility);
		});
	}

	public setCountryVisibility(index: number, visibility: boolean): void {
		const country: Country = this._countryArray[index];
		country.visible = visibility;
	}

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

	public setCountryIsFound(index: number, found: boolean): void {
		const country: Country = this._countryArray[index];
		country.found = found;
		if (!country.owned) {
			this.incrementFound();
		}
	}

	public setCountryAndConnectedIsFound(index: number, found: boolean): void {
		const countryIndex: number[] = this.getConnectedTerritories(index);
		countryIndex.forEach((index: number): void => {
			this.setCountryIsFound(index, found);
		});
	}

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

	public resetCountries(): void {
		this._countryArray.forEach((country: Country, index: number): void => {
			if (country.owned) return;
			this.setCountryAndConnectedVisibility(index, true);
			this.setCountryAndConnectedState(index, "unknown");
		});
	}

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

	public allCountryAttributeFound(type: string, region: number): boolean {
		switch (type) {
			case "currency":
				return (
					this.getFoundCA(type).length === currencyByRegion[region]
				);
			case "language":
				return (
					this.getFoundCA(type).length === languageByRegion[region]
				);
			default:
				console.error(`Country attribute of type ${type} unknown.`);
				return false;
		}
	}

	public getFoundCA(type: any): CountryAttribute[] {
		let foundArray: CountryAttribute[];
		switch (type) {
			case "currency":
				foundArray = this._currencyArray.filter(
					(currency: CountryAttribute): boolean => {
						return currency.found;
					}
				);
				return foundArray;
			case "language":
				foundArray = this._languageArray.filter(
					(language: CountryAttribute): boolean => {
						return language.found;
					}
				);
				return foundArray;
			default:
				console.error(`Country attribute of type ${type} unknown.`);
				return [];
		}
	}

	public nextInSeqArr(): void {
		this._sequentialRandomIndex =
			(this.sequentialRandomIndex + 1) %
			this._sequentialRandomArray.length;
	}

	public prevInSeqArr(): void {
		this._sequentialRandomIndex =
			(this.sequentialRandomIndex -
				1 +
				this._sequentialRandomArray.length) %
			this._sequentialRandomArray.length;
	}

	// Helper method to apply state logic after animation
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

	public finishGame(type: string, region: number): void {
		switch (type) {
			case "currency":
				this._currencyArray.forEach(
					(attribute: CountryAttribute): void => {
						if (
							attribute.found ||
							!attribute.region.includes(region)
						) {
							return;
						}
						changeCountryOfCountryAttribute(
							attribute,
							"found",
							region
						);
					}
				);
				break;
			case "language":
				this._languageArray.forEach(
					(attribute: CountryAttribute): void => {
						if (
							attribute.found ||
							!attribute.region.includes(region)
						) {
							return;
						}
						changeCountryOfCountryAttribute(
							attribute,
							"found",
							region
						);
					}
				);
				break;
			default:
				this._countryArray.forEach(
					(country: Country, index: number): void => {
						if (
							country.owned ||
							country.found ||
							!(region === 7 || country.location[0] === region)
						) {
							return;
						}
						this.applyFoundEffectsToCountry(index);
					}
				);
				break;
		}
	}
}
