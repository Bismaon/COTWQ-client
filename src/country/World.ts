// country/World.ts

import { Country } from "./Country";
import { Object3D, Vector3 } from "three";
import { getCountryMovement, getStateMaterial } from "../utils/countryUtils";
import { changeCountryCellTo } from "./countriesTable";
import { bounceAnimation } from "../utils/animation";
import { isAcceptedName } from "../controls/inputHandlers";
import { makeMaterialWithGradient } from "../utils/utilities";

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

export interface CountryAttribute {
	type: string;
	name: string;
	locations: number[];
	found: boolean;
}

/**
 * Number of country Object in each continent array
 */
const continentPopulation: number[] = [56, 3, 51, 46, 34, 19, 15];

export class World {
	private readonly _continents: Object3D[];
	private readonly _languageArray: CountryAttribute[];

	constructor() {
		this._countriesFound = 0;
		this._countryArray = [];
		this._continents = [];
		this._currencyArray = [];
		this._languageArray = [];
	}

	private _currencyArray: CountryAttribute[];

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

	public replaceCountries(newCountry: Country[]) {
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
				obj.state === "unknown" &&
				isAcceptedName(obj.acceptedNames, name)
					? index
					: -1
			)
			.filter((index: number): boolean => index !== -1);
	}

	public clearFound(): void {
		this._countryArray.forEach((country: Country): void => {
			if (country.isFound) {
				country.isFound = false;
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
		const index = this.countryArray.findIndex(
			(country: Country): boolean =>
				country.object === object || country.object === object.parent
		);
		return this.countryArray[index];
	}

	public setCountryAndConnectedState(index: number, state: string): void {
		const countriesIndex = this.getConnectedTerritories(index);
		countriesIndex.forEach((index) => {
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
		countriesIndex.forEach((index) => {
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
		countriesIndex.forEach((index) => {
			this.setCountryVisibility(index, visibility);
		});
	}

	public setCountryVisibility(index: number, visibility: boolean): void {
		const country: Country = this._countryArray[index];
		country.isVisible = visibility;
	}

	public applyFoundEffectsToCountry(index: number): void {
		const mainCountry: Country = this._countryArray[index];
		if (!mainCountry.isVisible) {
			// Hard mode
			this.setCountryAndConnectedVisibility(index, true);
		}
		this.setCountryAndConnectedIsFound(index, true);
		changeCountryCellTo("found", [index]);

		this.triggerCountryAnimation(index, "found", true);
	}

	public setCountryIsFound(index: number, found: boolean): void {
		const country: Country = this._countryArray[index];
		country.isFound = found;
		if (!country.isOwned) {
			this.incrementFound();
		}
	}

	public setCountryAndConnectedIsFound(index: number, found: boolean): void {
		const countryIndex: number[] = this.getConnectedTerritories(index);
		countryIndex.forEach((index: number) => {
			this.setCountryIsFound(index, found);
		});
	}

	public setUpCountries(
		hard: boolean,
		continentIndex: number,
		gameType: string
	): void {
		this._countryArray.forEach((country: Country, index: number) => {
			if (country.isOwned) {
				return;
			}
			if (
				continentIndex !== -1 &&
				country.location[0] !== continentIndex
			) {
				this.setCountryAndConnectedState(index, "unavailable");
			} else {
				if (hard) {
					this.setCountryAndConnectedVisibility(index, false);
				}
				this.setCountryAndConnectedState(index, "unknown");
			}
			if (gameType !== "currencies" && gameType !== "languages") {
				changeCountryCellTo("invisible", [index]);
			}
		});
	}

	public resetCountries(): void {
		this._countryArray.forEach((country: Country, index: number): void => {
			if (country.isOwned) return;
			this.setCountryAndConnectedVisibility(index, true);
			this.setCountryAndConnectedState(index, "unknown");
		});
	}

	public triggerCountryAnimation(
		index: number,
		state: string,
		complete: boolean
	): void {
		let percentage: number = 0;
		let countriesIndex: number[];
		if (complete) {
			countriesIndex = this.getConnectedTerritories(index);
		} else {
			countriesIndex = [index];
		}
		countriesIndex.forEach((index: number): void => {
			const country: Country = this._countryArray[index];
			const countryObj: Object3D = country.object;
			const [orgPos, targetPos]: Vector3[] = getCountryMovement(
				countryObj,
				100
			);
			if (state === "languages") {
				if (!country.languages) return;
				country.languages.forEach((lang: string) => {
					const langIndex = this._languageArray.findIndex(
						(l: CountryAttribute) => {
							return l.name === lang;
						}
					);
					if (this._languageArray[langIndex].found) {
						percentage++;
					}
				});
				percentage = (percentage / country.languages.length) * 100;
			}
			bounceAnimation(countryObj, orgPos, targetPos, () => {
				switch (state) {
					case "flags":
						this.setCountryFlag(index);
						break;
					case "languages":
						country.material = makeMaterialWithGradient(percentage);
						break;
					default:
						this.setCountryState(index, state);
						break;
				}
			});
		});
	}

	public addMissingCountryAttributeLong(
		type: string,
		attributeArray: any[],
		location: [number, number]
	): void {
		attributeArray.forEach((attributeName: any) => {
			this.addMissingCountryAttributeSingle(
				type,
				attributeName,
				location
			);
		});
	}

	public addMissingCountryAttributeSingle(
		type: string,
		attributeName: any,
		location: [number, number]
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
		const attributeIndex = countryAttributes.findIndex(
			(attribute: CountryAttribute) => {
				return attribute.name === attributeName;
			}
		);
		if (attributeIndex === -1) {
			countryAttributes.push({
				type: type,
				name: attributeName,
				locations: [this.getRealIndex(location)],
				found: false,
			});
		} else {
			countryAttributes[attributeIndex].locations.push(
				this.getRealIndex(location)
			);
		}
	}

	public allCountryAttributeFound(type: string): boolean {
		switch (type) {
			case "currency":
				return (
					this.getFoundCA(type).length === this._currencyArray.length
				);
			case "language":
				return (
					this.getFoundCA(type).length === this._currencyArray.length
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
					(currency: CountryAttribute) => {
						return currency.found;
					}
				);
				return foundArray;
			case "language":
				foundArray = this._languageArray.filter(
					(language: CountryAttribute) => {
						return language.found;
					}
				);
				return foundArray;
			default:
				console.error(`Country attribute of type ${type} unknown.`);
				return [];
		}
	}

	private getConnectedTerritories(index: number): number[] {
		let baseCountry: Country = this._countryArray[index];
		if (baseCountry.owner !== null) {
			baseCountry = this.getCountryByLocation(baseCountry.owner);
		}
		const connected: number[] = [this.getRealIndex(baseCountry.location)];

		baseCountry.territories.forEach((location: [number, number]) => {
			connected.push(this.getRealIndex(location));
		});
		return connected;
	}
}
