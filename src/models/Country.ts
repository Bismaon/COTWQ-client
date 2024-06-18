// Country.ts

/**
 * Represents a country.
 */
export class Country {
	protected countryName: string;
	protected acceptedNames: string[];
	protected territoriesLocation: number[][] | null;
	protected countryLocation: number[];
	protected ownerLocation: number[] | null;
	protected isFound: boolean;

	/**
	 * Creates an instance of Country.
	 * @param {string} countryName - The name of the country.
	 * @param {string[]} acceptedNames - The accepted names of the country.
	 * @param {number[][] | null} territoriesLocation - The locations of territories (if any) belonging to the country.
	 * @param {number[]} countryLocation - The indexes location of the country.
	 * @param {number[] | null} ownerLocation - The location of the owner (if any) of the country.
	 */
	constructor(countryName: string, acceptedNames: string[], territoriesLocation: number[][] | null, countryLocation: number[], ownerLocation: number[] | null) {
		this.countryName = countryName;
		this.acceptedNames = acceptedNames;
		this.territoriesLocation = territoriesLocation;
		this.countryLocation = countryLocation;
		this.ownerLocation = ownerLocation;
		this.isFound = false;
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
		return this.ownerLocation;
	}

	/**
	 * Set the location of the country owning this country.
	 * @param {number[]} ownedLocation - The location of the owner to set.
	 */
	public setOwnerLocation(ownedLocation: number[] | null): void {
		this.ownerLocation = ownedLocation;
	}

	/**
	 * Get the name of the country.
	 * @returns {string} The name of the country.
	 */
	public getCountryName(): string {
		return this.countryName;
	}

	/**
	 * Set the name of the country.
	 * @param {string} countryName - The name of the country to set.
	 */
	public setCountryName(countryName: string): void {
		this.countryName = countryName;
	}

	/**
	 * Get the accepted names of the country.
	 * @returns {string[]} The accepted names of the country.
	 */
	public getAcceptedNames(): string[] {
		return this.acceptedNames;
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
		return this.countryLocation;
	}

	/**
	 * Set the indexes location of the country.
	 * @param {number[]} countryLocation - The indexes location of the country to set.
	 */
	public setCountryLocation(countryLocation: number[]): void {
		this.countryLocation = countryLocation;
	}

	/**
	 * Get the locations of territories belonging to the country.
	 * @returns {number[][]} The locations of territories belonging to the country.
	 */
	public getTerritoriesLocation(): number[][] {
		return this.territoriesLocation || [];
	}

	/**
	 * Set the locations of territories belonging to the country.
	 * @param {number[][]} territoriesLocation - The locations of territories to set.
	 */
	public setTerritoriesLocation(territoriesLocation: number[][]): void {
		this.territoriesLocation = territoriesLocation;
	}
}
