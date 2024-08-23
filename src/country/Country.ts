// country/Country.ts
import { Object3D } from "three";

export interface countryDataInterface {
	_name: string;
	_location: [number, number];
	_territories: [number, number][] | null;
	_ownedLocation: [number, number] | null;
	_acceptedNames: string[];
	_flag: [string, string];
	_currency: string | null;
	_languages: string[] | null;
	_capital: string | null;
}

/**
 * Represents a country.
 */
export class Country implements countryDataInterface {
	_acceptedNames: string[];
	_capital: string | null;
	_currency: string | null;
	_flag: [string, string];
	_languages: string[] | null;
	_location: [number, number];
	_name: string;
	_ownedLocation: [number, number] | null;
	_territories: [number, number][] | null;
	private _isFound: boolean;
	private _state: string;
	private _visibility: boolean;
	private _countryMeshes: Object3D;
	private _countryObj: Object3D;

	/**
	 * Creates an instance of Country.
	 */
	constructor(
		name: string,
		acceptedNames: string[],
		territories: [number, number][] | null,
		location: [number, number],
		ownedLocation: [number, number] | null,
		flag: [string, string],
		currency: string | null,
		capital: string | null,
		languages: string[] | null
	) {
		this._name = name;
		this._acceptedNames = acceptedNames;
		this._territories = territories;
		this._location = location;
		this._ownedLocation = ownedLocation;
		this._flag = flag;
		this._currency = currency;
		this._languages = languages;
		this._capital = capital;
		this._isFound = false;
		this._state = "unknown";
		this._visibility = true;
		this._countryMeshes = new Object3D();
		this._countryObj = new Object3D();
	}

	public getcountryObj(): Object3D {
		return this._countryObj;
	}

	public setcountryMeshes(value: Object3D) {
		this._countryMeshes = value;
	}

	public setCountryObj(value: Object3D) {
		this._countryObj = value;
	}

	public getCountryMeshes(): Object3D {
		return this._countryMeshes;
	}

	/**
	 * Get the found status of the country.
	 * @returns {boolean} True if the country is found, otherwise false.
	 */
	public getFound(): boolean {
		return this._isFound;
	}

	/**
	 * Set the found status of the country.
	 * @param {boolean} isFound - The found status to set.
	 */
	public setFound(isFound: boolean): void {
		this._isFound = isFound;
	}

	/**
	 * Get the location of the country owning this country.
	 * @returns {number[]} The location of the owner.
	 */
	public getOwnerLocation(): [number, number] | null {
		return this._ownedLocation;
	}

	/**
	 * Set the location of the country owning this country.
	 * @param {[number, number]} ownedLocation - The location of the owner to set.
	 */
	public setOwnerLocation(ownedLocation: [number, number] | null): void {
		this._ownedLocation = ownedLocation;
	}

	/**
	 * Get the name of the country.
	 * @returns {string} The name of the country.
	 */
	public getCountryName(): string {
		return this._name;
	}

	/**
	 * Set the name of the country.
	 * @param {string} countryName - The name of the country to set.
	 */
	public setCountryName(countryName: string): void {
		this._name = countryName;
	}

	/**
	 * Get the accepted names of the country.
	 * @returns {string[]} The accepted names of the country.
	 */
	public getAcceptedNames(): string[] {
		return this._acceptedNames || [];
	}

	/**
	 * Set the accepted names of the country.
	 * @param {string[]} acceptedNames - The accepted names of the country to set.
	 */
	public setAcceptedNames(acceptedNames: string[]): void {
		this._acceptedNames = acceptedNames;
	}

	/**
	 * Get the indexes location of the country.
	 * @returns {[number, number]} The indexes location of the country.
	 */
	public getCountryLocation(): [number, number] {
		return this._location;
	}

	/**
	 * Set the indexes location of the country.
	 * @param {[number, number]} countryLocation - The indexes location of the country to set.
	 */
	public setCountryLocation(countryLocation: [number, number]): void {
		this._location = countryLocation;
	}

	/**
	 * Get the locations of territories belonging to the country.
	 * @returns {[number, number][]} The locations of territories belonging to the country.
	 */
	public getTerritories(): [number, number][] {
		return this._territories || [];
	}

	/**
	 * Set the locations of territories belonging to the country.
	 * @param {[number, number][]} territories - The locations of territories to set.
	 */
	public setTerritories(territories: [number, number][]): void {
		this._territories = territories;
	}

	public setState(state: string): void {
		this._state = state;
	}

	public getState(): string {
		return this._state;
	}

	public isVisible(): boolean {
		return this._visibility;
	}

	public setVisibility(visibility: boolean): void {
		this._countryObj.visible = visibility;
		this._visibility = visibility;
	}
}
