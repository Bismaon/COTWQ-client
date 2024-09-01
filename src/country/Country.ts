// country/Country.ts
import { Material, Mesh, Object3D } from "three";
import { getColorsArray } from "../scene/sceneManager";

const colorsDict: { [key: string]: number } = {
	unknown: 0,
	found: 1,
	selected: 2,
	error: 3,
	unavailable: 4,
	water: 5,
};
/**
 * Represents a country.
 */
export class Country {
	private readonly _capital: string | null;
	private readonly _currency: string | null;
	private readonly _svgFlag: string;
	private readonly _languages: string[] | null;
	private readonly _isOwned: boolean;
	private readonly _meshes: Mesh;
	private readonly _object: Object3D;
	private readonly _location: [number, number];
	private readonly _territories: [number, number][] | null;
	private readonly _name: string;
	private readonly _acceptedNames: string[];
	private readonly _owner: [number, number] | null;
	private readonly _flagMaterial: Material;

	/**
	 * Creates an instance of Country.
	 */
	constructor(
		name: string,
		acceptedNames: string[],
		territories: [number, number][] | null,
		location: [number, number],
		owner: [number, number] | null,
		svgFlag: string,
		currency: string | null,
		capital: string | null,
		languages: string[] | null,
		meshes: Mesh,
		object: Object3D,
		flagMaterial:Material
	) {
		this._name = name;
		this._acceptedNames = acceptedNames;
		this._territories = territories;
		this._location = location;
		this._owner = owner;
		this._svgFlag = svgFlag;
		this._currency = currency;
		this._languages = languages;
		this._capital = capital;
		this._isFound = false;
		this._state = "unknown";
		this._isVisible = true;
		this._meshes = meshes;
		this._object = object;
		this._isOwned = owner !== null;
		this._flagMaterial = flagMaterial;
	}

	/**
	 * Get the indexes location of the country.
	 * @returns {[number, number]} The indexes location of the country.
	 */
	public get location(): [number, number] {
		return this._location;
	}

	/**
	 * Get the location of the country owning this country.
	 * @returns {number[]} The location of the owner.
	 */
	public get owner(): [number, number] | null {
		return this._owner;
	}

	/**
	 * Get the accepted names of the country.
	 * @returns {string[]} The accepted names of the country.
	 */
	public get acceptedNames(): string[] {
		return this._acceptedNames || [];
	}

	/**
	 * Get the locations of territories belonging to the country.
	 * @returns {[number, number][]} The locations of territories belonging to the country.
	 */
	public get territories(): [number, number][] {
		return this._territories || [];
	}

	private _state: string;

	public get state(): string {
		return this._state;
	}

	public set state(state: string) {
		const material = getColorsArray()[colorsDict[state]];
		this._meshes.material = material.clone();
		//material.needsUpdate = true;
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

	private _isVisible: boolean;

	public get isVisible(): boolean {
		return this._isVisible;
	}

	public set isVisible(visibility: boolean) {
		this._object.visible = visibility;
		this._isVisible = visibility;
	}

	public get meshes(): Mesh {
		return this._meshes;
	}

	public get object(): Object3D {
		return this._object;
	}

	/**
	 * Get the name of the country.
	 * @returns {string} The name of the country.
	 */
	public get name(): string {
		return this._name;
	}

	public get isOwned(): boolean {
		return this._isOwned;
	}
	public get svgFlag():string{
		return this._svgFlag;
	}

	public get flagMaterial():Material{
		return this._flagMaterial;
	}
}
