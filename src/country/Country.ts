// country/Country.ts
import { Mesh, Object3D } from "three";

/**
 * Represents a country.
 */
export class Country {
	private _capital: string | null;
	private _currency: string | null;
	private _flag: [string, string];
	private _languages: string[] | null;
	private readonly _isOwned: boolean;

	/**
	 * Creates an instance of Country.
	 */
	constructor(
		name: string,
		acceptedNames: string[],
		territories: [number, number][] | null,
		location: [number, number],
		ownerLocation: [number, number] | null,
		flag: [string, string],
		currency: string | null,
		capital: string | null,
		languages: string[] | null
	) {
		this._name = name;
		this._acceptedNames = acceptedNames;
		this._territories = territories;
		this._location = location;
		this._ownerLocation = ownerLocation;
		this._flag = flag;
		this._currency = currency;
		this._languages = languages;
		this._capital = capital;
		this._isFound = false;
		this._state = "unknown";
		this._visibility = true;
		this._meshes = new Mesh();
		this._object = new Object3D();
		this._isOwned = ownerLocation !== null;
	}

	private _location: [number, number];

	/**
	 * Get the indexes location of the country.
	 * @returns {[number, number]} The indexes location of the country.
	 */
	public get location(): [number, number] {
		return this._location;
	}

	/**
	 * Set the indexes location of the country.
	 * @param {[number, number]} countryLocation - The indexes location of the country to set.
	 */
	public set location(countryLocation: [number, number]) {
		this._location = countryLocation;
	}

	private _ownerLocation: [number, number] | null;

	/**
	 * Get the location of the country owning this country.
	 * @returns {number[]} The location of the owner.
	 */
	public get ownerLocation(): [number, number] | null {
		return this._ownerLocation;
	}

	/**
	 * Set the location of the country owning this country.
	 * @param {[number, number]} ownedLocation - The location of the owner to set.
	 */
	public set ownerLocation(ownedLocation: [number, number] | null) {
		this._ownerLocation = ownedLocation;
	}

	private _acceptedNames: string[];

	/**
	 * Get the accepted names of the country.
	 * @returns {string[]} The accepted names of the country.
	 */
	public get acceptedNames(): string[] {
		return this._acceptedNames || [];
	}

	/**
	 * Set the accepted names of the country.
	 * @param {string[]} acceptedNames - The accepted names of the country to set.
	 */
	public set acceptedNames(acceptedNames: string[]) {
		this._acceptedNames = acceptedNames;
	}

	private _territories: [number, number][] | null;

	/**
	 * Get the locations of territories belonging to the country.
	 * @returns {[number, number][]} The locations of territories belonging to the country.
	 */
	public get territories(): [number, number][] {
		return this._territories || [];
	}

	/**
	 * Set the locations of territories belonging to the country.
	 * @param {[number, number][]} territories - The locations of territories to set.
	 */
	public set territories(territories: [number, number][]) {
		this._territories = territories;
	}

	private _state: string;

	public get state(): string {
		return this._state;
	}

	public set state(state: string) {
		this._state = state;
	}

	private _isFound: boolean;

	/**
	 * Get the found status of the country.
	 * @returns {boolean} True if the country is found, otherwise false.
	 */
	public get isFound(): boolean {
		return this._isFound;
	}

	/**
	 * Set the found status of the country.
	 * @param {boolean} isFound - The found status to set.
	 */
	public set isFound(isFound: boolean) {
		this._isFound = isFound;
	}

	private _visibility: boolean;

	public get visibility(): boolean {
		return this._visibility;
	}

	public set visibility(visibility: boolean) {
		this._object.visible = visibility;
		this._visibility = visibility;
	}

	private _meshes: Mesh;

	public get meshes(): Mesh {
		return this._meshes;
	}

	public set meshes(value: Mesh) {
		this._meshes = value;
	}

	private _object: Object3D;

	public get object(): Object3D {
		return this._object;
	}

	public set object(value: Object3D) {
		this._object = value;
	}

	private _name: string;

	/**
	 * Get the name of the country.
	 * @returns {string} The name of the country.
	 */
	public get name(): string {
		return this._name;
	}

	/**
	 * Set the name of the country.
	 * @param {string} countryName - The name of the country to set.
	 */
	public set name(countryName: string) {
		this._name = countryName;
	}

	public get isOwned(): boolean {
		return this._isOwned;
	}
}
