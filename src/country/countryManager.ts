// country/countryManager.ts
import { Countries } from "./Countries";
import { Material, Mesh, Object3D, Vector3 } from "three";
import { isFollowing } from "../controls/playingState";
import { Country } from "./Country";
import {
	getColorsArray,
	getCountries,
	getCountryMovement,
	getObjCenter,
} from "../scene/sceneManager";
import { cameraFaceTo } from "../camera/camera";
import { bounceAnimation } from "../utils/animation";
import { changeCountryCellTo } from "./countriesTable";

const colorDict: { [key: string]: number } = {
	unknown: 0,
	found: 1,
	selected: 2,
	error: 3,
	unavailable: 4,
	water: 5,
};

/**
 * Marks a country as found and updates related territories.
 *
 * @param {Country} wantedCountry - The country to mark as found.
 * @param {boolean} found - Indicates whether the country is found or not.
 */
export function setCountryIsFoundTo(
	wantedCountry: Country,
	found: boolean
): void {
	const countries: Countries = getCountries();
	wantedCountry.setFound(found);
	countries.incrementFound();
	wantedCountry
		.getTerritories()
		.forEach((location: [number, number]): void => {
			countries.getCountryByLocation(location).setFound(true);
		});
}

/**
 * Handles the search for a country based on user input and updates the game state.
 *
 * @param {Country} country - The country that was searched for.
 * @param {HTMLInputElement} textBox - The input element containing the search text.
 * @returns {boolean} - True if all countries have been found according to the game mode, otherwise false.
 */
export function foundSearch(
	country: Country,
	textBox: HTMLInputElement
): boolean {
	if (!country.getFound()) {
		textBox.value = "";

		const location: [number, number] = country.getCountryLocation();
		const connectedLoc: [number, number][] = getConnected(location);
		setCountryIsFoundTo(country, true);
		changeCountryCellTo(location[0], location[1], "found");
		if (!country.isVisible()) {
			changeCountryVisibilityTo(true, connectedLoc);
		}

		countryFoundAnimation(connectedLoc);
		if (isFollowing()) {
			cameraFaceTo(getObjCenter(country.getcountryObj()));
		}
	}
	return getCountries().isAllFound("base");
}

/**
 * Triggers an animation to indicate that a country has been found.
 *
 * @param {Array<[number, number]>} locations - The locations of the countries to animate.
 */
function countryFoundAnimation(locations: [number, number][]): void {
	const countries: Countries = getCountries();
	locations.forEach((location: [number, number]): void => {
		const countryObj: Object3D = countries
			.getCountryByLocation([location[0], location[1]])
			.getcountryObj();
		const [bodyOrgPos, bodyTargetPos]: Vector3[] = getCountryMovement(
			countryObj,
			100
		);
		bounceAnimation(countryObj, bodyOrgPos, bodyTargetPos, (): void => {
			changeCountryStateTo("found", [location]);
		});
	});
}

/**
 * Updates the visibility of countries at specified locations.
 *
 * @param {boolean} visibility - The visibility state to set for the countries.
 * @param {Array<[number, number]>} locations - The locations of the countries to update.
 */
export function changeCountryVisibilityTo(
	visibility: boolean,
	locations: [number, number][]
): void {
	const countries: Countries = getCountries();
	locations.forEach(([continent, country]: number[]): void => {
		countries
			.getCountryByLocation([continent, country])
			.setVisibility(visibility);
	});
}

/**
 * Retrieves locations connected to a given country.
 *
 * @param {Array<number, number>} location - The location of the country to find connected locations from.
 * @returns {Array<[number, number]>} - An array of connected locations.
 */
export function getConnected(location: [number, number]): [number, number][] {
	const countries: Countries = getCountries();
	const connectedLocations: [number, number][] = [];
	const country: Country = countries.getCountryByLocation(location);

	const ownerLocation: [number, number] | null = country.getOwnerLocation();
	if (ownerLocation) {
		const owner: Country = countries.getCountryByLocation(ownerLocation);
		connectedLocations.push(
			owner.getCountryLocation(),
			...owner.getTerritories()
		);
	} else {
		connectedLocations.push(
			country.getCountryLocation(), // contains country location
			...country.getTerritories()
		);
	}
	return connectedLocations;
}

/**
 * Changes the state of countries at specified locations and updates their material color.
 *
 * @param {string} state - The new state to set for the countries.
 * @param {Array<[number, number]>} locations - The locations of the countries to update.
 */
export function changeCountryStateTo(
	state: string,
	locations: [number, number][]
): void {
	const countries: Countries = getCountries();
	const materialCloned: Material = getColorsArray()[colorDict[state]].clone();

	locations.forEach(([continent, country]: number[]): void => {
		const countryElement: Country = countries.getCountryByLocation([
			continent,
			country,
		]);
		countryElement.setState(state);
		const countryMeshes: Mesh = countryElement.getCountryMeshes();
		countryMeshes.material = materialCloned;
	});
	materialCloned.needsUpdate = true;
}
