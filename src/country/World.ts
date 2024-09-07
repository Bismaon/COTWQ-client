// country/World.ts

import { Country } from "./Country";
import { Object3D, Vector3 } from "three";
import { getCountryMovement, getStateMaterial } from "../utils/countryUtils";
import { changeCountryCellTo } from "./countriesTable";
import { bounceAnimation } from "../utils/animation";

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

/**
 * Number of country Object in each continent array
 */
const continentPopulation: number[] = [56, 3, 51, 46, 34, 19, 15];

export class World {
	private readonly _countriesArray: Country[];
	private readonly _continents: Object3D[];

	constructor() {
		this._countriesFound = 0;
		this._countriesArray = [];
		this._continents = [];
	}

	public get continents(): Object3D[] {
		return this._continents;
	}

	private _countriesFound: number;

	public get countriesFound(): number {
		return this._countriesFound;
	}

	public get countryArray(): Country[] {
		return this._countriesArray;
	}

	public incrementFound(): void {
		this._countriesFound++;
	}

	public isAllFound(region: string): boolean {
		return countriesCountByRegion[region] === this._countriesFound;
	}

	public exists(name: string): number[] {
		return this._countriesArray
			.map((obj: Country, index: number): number =>
				obj.state === "unknown" && obj.acceptedNames.includes(name)
					? index
					: -1
			)
			.filter((index: number): boolean => index !== -1);
	}

	public clearFound(): void {
		this._countriesArray.forEach((country: Country): void => {
			if (country.isFound) {
				country.isFound = false;
			}
		});
		this._countriesFound = 0;
	}

	public getCountryByLocation(location: [number, number]): Country {
		return this._countriesArray[this.getRealIndex(location)];
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
			(country: Country): boolean => country.object === object
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
		const country: Country = this._countriesArray[index];
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
		const country: Country = this._countriesArray[index];
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
		const country: Country = this._countriesArray[index];
		country.isVisible = visibility;
	}

	public applyFoundEffectsToCountry(index: number): void {
		const mainCountry: Country = this._countriesArray[index];
		if (!mainCountry.isVisible) {
			// Hard mode
			this.setCountryAndConnectedVisibility(index, true);
		}
		this.setCountryAndConnectedIsFound(index, true);
		changeCountryCellTo("found", [index]);

		this.triggerCountryAnimation(index, "found");
	}

	public setCountryIsFound(index: number, found: boolean): void {
		const country: Country = this._countriesArray[index];
		country.isFound = found;
		console.log("Country: ", country);
		if (!country.isOwned) {
			this.incrementFound();
		}
		console.log("World: ", this);
	}

	public setCountryAndConnectedIsFound(index: number, found: boolean): void {
		const countryIndex: number[] = this.getConnectedTerritories(index);
		countryIndex.forEach((index: number) => {
			this.setCountryIsFound(index, found);
		});
	}

	public setUpCountries(hard: boolean, continentIndex: number): void {
		this._countriesArray.forEach((country: Country, index: number) => {
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
			changeCountryCellTo("invisible", [index]);
		});
	}

	public resetCountries(): void {
		this._countriesArray.forEach(
			(country: Country, index: number): void => {
				if (country.isOwned) return;
				this.setCountryAndConnectedVisibility(index, true);
				this.setCountryAndConnectedState(index, "unknown");
			}
		);
	}

	public triggerCountryAnimation(index: number, state: string): void {
		const countriesIndex: number[] = this.getConnectedTerritories(index);
		countriesIndex.forEach((index: number): void => {
			const country: Country = this._countriesArray[index];
			const countryObj: Object3D = country.object;
			const [orgPos, targetPos]: Vector3[] = getCountryMovement(
				countryObj,
				100
			);
			bounceAnimation(countryObj, orgPos, targetPos, () => {
				if (state === "flags") {
					// flag quiz type
					this.setCountryFlag(index);
				} else {
					// normal quiz type
					this.setCountryState(index, state);
				}
			});
		});
	}

	private getConnectedTerritories(index: number): number[] {
		let baseCountry: Country = this._countriesArray[index];
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
