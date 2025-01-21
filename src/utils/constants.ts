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
export const continentCountryCounts: number[] = [
	56, 3, 51, 46, 34, 19, 15, 191,
];
export const currencyByRegion: number[] = [41, 0, 46, 20, 16, 9, 12, 146];
export const languageByRegion: number[] = [40, 0, 40, 41, 4, 13, 8, 136];

export const regionNamesUNFtoFORMap: Map<string, string> = new Map([
	["africa", "Africa"],
	["antarctica", "Antarctica"],
	["asia", "Asia"],
	["europe", "Europe"],
	["north_america", "North America"],
	["oceania", "Oceania"],
	["south_america", "South America"],
]);

export const colorsDict: { [key: string]: number } = {
	UNKNOWN: 0,
	FOUND: 3,
	SELECTED: 2,
	ERROR: 1,
	UNAVAILABLE: 4,
	WATER: 5,
};

export const UNKNOWN: string = "UNKNOWN";
export const UNAVAILABLE: string = "UNAVAILABLE";
export const SELECTED: string = "SELECTED";
export const WATER: string = "water";
export const GLOBE: string = "globe";
export const FOUND: string = "FOUND";
export const ERROR: string = "ERROR";
export const LANGUAGE: string = "LANGUAGE";
export const COUNTRY: string = "COUNTRY";
export const CURRENCY: string = "CURRENCY";
export const FLAGS: string = "flags";
export const LANGUAGES: string = "languages";
export const CURRENCIES: string = "currencies";
export const CAPITALS: string = "capitals";
export const NAMES: string = "names";
export const regionMap: Map<string, number> = new Map([
	["all_regions", -1],
	["africa", 0],
	["antarctica", 1],
	["asia", 2],
	["europe", 3],
	["north_america", 4],
	["oceania", 5],
	["south_america", 6],
]);
