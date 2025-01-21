import { AttributeStructure } from "./AttributeStructure";
import { countryLoc } from "../utils/types";
import { LANGUAGE } from "../utils/constants";

export class Language extends AttributeStructure {
	public _translations: { [lang: string]: string };
	private _regions: number[];

	public constructor(
		name: string,
		translations: { [lang: string]: string },
		acceptedNames: string[],
		location: countryLoc
	) {
		super(name, acceptedNames, LANGUAGE, [location]);
		this._translations = translations;
		this._regions = [-1, location[0]];
	}

	public isInRegion(region: number): boolean {
		return this._regions.includes(region);
	}

	public isInCountry(location: countryLoc): boolean {
		return this.territories.some(
			(territory: countryLoc): boolean =>
				territory[0] === location[0] && territory[1] === location[1]
		);
	}

	public getTranslation(lang: string): string {
		return this._translations[lang] || this.name;
	}

	public addRegion(region: number): void {
		this._regions.push(region);
	}
}
