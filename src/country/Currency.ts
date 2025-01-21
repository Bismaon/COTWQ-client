import { AttributeStructure } from "./AttributeStructure";
import { countryLoc } from "../utils/types";
import { CURRENCY } from "../utils/constants";

export class Currency extends AttributeStructure {
	private _regions: number[];

	public constructor(
		name: string,
		acceptedNames: string[],
		location: countryLoc
	) {
		super(name, acceptedNames, CURRENCY, [location]);
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
}
