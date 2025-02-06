import { countryLoc } from "../utils/types";

export abstract class AttributeStructure {
	private readonly _type: string;
	private readonly _name: string;
	private readonly _acceptedNames: string[];
	private readonly _territories: countryLoc[];

	protected constructor(
		name: string,
		acceptedNames: string[],
		type: string,
		territories: countryLoc[]
	) {
		this._name = name;
		this._acceptedNames = acceptedNames;
		this._selected = false;
		this._type = type;
		this._found = false;
		this._territories = territories;
	}

	public get territories(): countryLoc[] {
		return this._territories;
	}

	private _selected: boolean;

	public get selected(): boolean {
		return this._selected;
	}

	public set selected(selected: boolean) {
		this._selected = selected;
	}

	private _found: boolean;

	public get found(): boolean {
		return this._found;
	}

	public set found(value: boolean) {
		this._found = value;
	}

	public get name(): string {
		return this._name;
	}

	public get type(): string {
		return this._type;
	}

	public get acceptedNames(): string[] {
		return this._acceptedNames;
	}

	public isCorrect(name: string): boolean {
		return this._acceptedNames.includes(name);
	}

	abstract isInRegion(region: number): boolean;

	public addTerritory(territory: countryLoc): void {
		this._territories.push(territory);
	}
}
