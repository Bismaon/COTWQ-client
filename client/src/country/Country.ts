// country/Country.ts

export interface countryDataInterface {
	name: string;
	location: [number, number];
	territories: [number, number][] | null;
	ownedLocation: [number, number] | null;
	acceptedNames: string[];
	flag: [string, string];
	currency: string | null;
	languages: string[] | null;
	capital: string | null;
}
/**
 * Represents a country.
 */
export class Country implements countryDataInterface {
	name: string;
	location: [number, number];
	territories: [number, number][] | null;
	ownedLocation: [number, number] | null;
	acceptedNames: string[];
	flag: [string, string];
	currency: string | null;
	languages: string[] | null;
	capital: string | null;
	protected isFound: boolean;
	protected state: string;
	protected visibility: boolean;

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
		this.name = name;
		this.acceptedNames = acceptedNames;
		this.territories = territories;
		this.location = location;
		this.ownedLocation = ownedLocation;
		this.flag = flag;
		this.currency = currency;
		this.languages = languages;
		this.capital = capital;
		this.isFound = false;
		this.state = "unknown";
		this.visibility = true;
	}

	/**
	 * Get the found status of the country.
	 * @returns {boolean} True if the country is found, otherwise false.
	 */
	public getFound(): boolean {
		return this.isFound;
	}

	/**
	 * Set the found status of the country.
	 * @param {boolean} isFound - The found status to set.
	 */
	public setFound(isFound: boolean): void {
		this.isFound = isFound;
	}

	/**
	 * Get the location of the country owning this country.
	 * @returns {number[]} The location of the owner.
	 */
	public getOwnerLocation(): number[] | null {
		return this.ownedLocation;
	}

	/**
	 * Set the location of the country owning this country.
	 * @param {number[]} ownedLocation - The location of the owner to set.
	 */
	public setOwnerLocation(ownedLocation: [number, number] | null): void {
		this.ownedLocation = ownedLocation;
	}

	/**
	 * Get the name of the country.
	 * @returns {string} The name of the country.
	 */
	public getCountryName(): string {
		return this.name;
	}

	/**
	 * Set the name of the country.
	 * @param {string} countryName - The name of the country to set.
	 */
	public setCountryName(countryName: string): void {
		this.name = countryName;
	}

	/**
	 * Get the accepted names of the country.
	 * @returns {string[]} The accepted names of the country.
	 */
	public getAcceptedNames(): string[] {
		return this.acceptedNames || [];
	}

	/**
	 * Set the accepted names of the country.
	 * @param {string[]} acceptedNames - The accepted names of the country to set.
	 */
	public setAcceptedNames(acceptedNames: string[]): void {
		this.acceptedNames = acceptedNames;
	}

	/**
	 * Get the indexes location of the country.
	 * @returns {number[]} The indexes location of the country.
	 */
	public getCountryLocation(): number[] {
		return this.location;
	}

	/**
	 * Set the indexes location of the country.
	 * @param {number[]} countryLocation - The indexes location of the country to set.
	 */
	public setCountryLocation(countryLocation: [number, number]): void {
		this.location = countryLocation;
	}

	/**
	 * Get the locations of territories belonging to the country.
	 * @returns {number[][]} The locations of territories belonging to the country.
	 */
	public getTerritories(): [number, number][] {
		return this.territories || [];
	}

	/**
	 * Set the locations of territories belonging to the country.
	 * @param {number[][]} territories - The locations of territories to set.
	 */
	public setTerritories(territories: [number, number][]): void {
		this.territories = territories;
	}
	public setState(state: string): void {
		this.state = state;
	}
	public getState(): string {
		return this.state;
	}
	public isVisible(): boolean {
		return this.visibility;
	}
	public setVisibility(visibility: boolean): void {
		this.visibility = visibility;
	}
}
