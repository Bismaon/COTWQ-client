// country/Country.ts
import { Material, Mesh, Object3D } from "three";
import { AttributeStructure } from "./AttributeStructure";
import { countryLoc } from "../utils/types";
import { COUNTRY, UNKNOWN } from "../utils/constants";

export class Country extends AttributeStructure {
	// Holds the capital of the country as a string
	private readonly _capital: string | null;
	private readonly _svgFlag: string;
	// true if the country is not independent
	private readonly _owned: boolean;
	// contains the Object3D Mesh of the country (colors/flag)
	private readonly _meshes: Mesh;
	// The object of the country in the model
	private readonly _object: Object3D;
	// continent index and index of the country in that continent array
	private readonly _location: countryLoc;
	// location of the country which is parent to `this`
	private readonly _owner: countryLoc | null;
	// Material of the flag resulting from the svg
	private readonly _flagMaterial: Material;
	private readonly _langAmount: number;

	constructor(
		name: string,
		acceptedNames: string[],
		territories: countryLoc[],
		location: countryLoc,
		owner: countryLoc | null,
		svgFlag: string,
		meshes: Mesh,
		object: Object3D,
		flagMaterial: Material,
		capital: string | null,
		langNumber: number
	) {
		super(name, acceptedNames, COUNTRY, territories);
		this._location = location;
		this._owner = owner;
		this._svgFlag = svgFlag;
		this._capital = capital;
		this._state = UNKNOWN;
		this._visible = true;
		this._meshes = meshes;
		this._object = object;
		this._owned = owner !== null || acceptedNames.length === 0;
		this._flagMaterial = flagMaterial;
		this._material = meshes.material as Material;
		this._langAmount = langNumber;
	}

	public get langAmount(): number {
		return this._langAmount;
	}

	// Current material of the country object
	private _material: Material;

	public get material(): Material {
		return this._material;
	}

	public set material(newMaterial: Material) {
		newMaterial.needsUpdate = true; //!TODO not sure this is a good idea works for now
		this.meshes.material = newMaterial;
		this._material = newMaterial;
	}

	/**
	 * Get the indexes location of the country.
	 * @returns {countryLoc} The indexes location of the country.
	 */
	public get location(): countryLoc {
		return this._location;
	}

	/**
	 * Get the location of the country owning this country.
	 * @returns {number[]} The location of the owner.
	 */
	public get owner(): countryLoc | null {
		return this._owner;
	}

	/**
	 * Get the locations of territories belonging to the country.
	 * @returns {countryLoc[]} The locations of territories belonging to the country.
	 */

	private _state: string;

	public get state(): string {
		return this._state;
	}

	public set state(state: string) {
		this._state = state;
	}

	private _visible: boolean;

	public get visible(): boolean {
		return this._visible;
	}

	public set visible(visibility: boolean) {
		this._object.visible = visibility;
		this._visible = visibility;
	}

	public get meshes(): Mesh {
		return this._meshes;
	}

	public get object(): Object3D {
		return this._object;
	}

	public get owned(): boolean {
		return this._owned;
	}

	public get svgFlag(): string {
		return this._svgFlag;
	}

	public get flagMaterial(): Material {
		return this._flagMaterial;
	}

	public get capital(): string | null {
		return this._capital;
	}

	public isInRegion(region: number): boolean {
		return region === 7 || region === this.location[0];
	}
}
