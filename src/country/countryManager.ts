// country/countryManager.ts
import { Countries } from "./Countries";
import { Material, Mesh, Object3D, Vector3 } from "three";
import { isFollowing } from "../controls/inputHandlers";
import { Country } from "./Country";
import {
	getColorsArray,
	getCountryMovement,
	getObjCenter,
} from "../scene/sceneManager";
import { cameraFaceTo } from "../camera/camera";
import { bounceAnimation } from "../utils/animation";

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
 * @param {Countries} countries - The Countries instance managing the collection of countries.
 */
export function setCountryIsFoundTo(
	wantedCountry: Country,
	found: boolean,
	countries: Countries
): void {
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
 * @param {Country} wantedCountry - The country that was searched for.
 * @param {HTMLInputElement} textBox - The input element containing the search text.
 * @param {Countries} countries - The Countries instance managing the collection of countries.
 * @returns {boolean} - True if all countries have been found according to the game mode, otherwise false.
 */
export function foundSearch(
	wantedCountry: Country,
	textBox: HTMLInputElement,
	countries: Countries
): boolean {
	if (!wantedCountry.getFound()) {
		textBox.value = "";

		const location: [number, number] = wantedCountry.getCountryLocation();
		const connectedLoc = getConnected(location, countries);
		setCountryIsFoundTo(wantedCountry, true, countries);
		if (!wantedCountry.isVisible()) {
			changeCountryVisibilityTo(true, countries, connectedLoc);
		}

		countryFoundAnimation(countries, connectedLoc);
		if (isFollowing()) {
			cameraFaceTo(getObjCenter(wantedCountry.getcountryObj()));
		}
	}
	return countries.isAllFound("base");
}

/**
 * Triggers an animation to indicate that a country has been found.
 *
 * @param {Countries} countries - The Countries instance managing the collection of countries.
 * @param {Array<[number, number]>} locations - The locations of the countries to animate.
 */
function countryFoundAnimation(
	countries: Countries,
	locations: [number, number][]
): void {
	locations.forEach((location: [number, number]): void => {
		const countryObj: Object3D = countries
			.getCountryByLocation([location[0], location[1]])
			.getcountryObj();
		const [bodyOrgPos, bodyTargetPos]: Vector3[] = getCountryMovement(
			countryObj,
			100
		);
		bounceAnimation(countryObj, bodyOrgPos, bodyTargetPos, (): void => {
			changeCountryStateTo("found", countries, [location]);
		});
	});
}

/**
 * Updates the visibility of countries at specified locations.
 *
 * @param {boolean} visibility - The visibility state to set for the countries.
 * @param {Countries} countries - The Countries instance managing the collection of countries.
 * @param {Array<[number, number]>} locations - The locations of the countries to update.
 */
export function changeCountryVisibilityTo(
	visibility: boolean,
	countries: Countries,
	locations: [number, number][]
): void {
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
 * @param {Countries} countries - The Countries instance managing the collection of countries.
 * @returns {Array<[number, number]>} - An array of connected locations.
 */
export function getConnected(
	location: [number, number],
	countries: Countries
): [number, number][] {
	const connectedLocations: [number, number][] = [];
	const country: Country = countries.getCountryByLocation(location);

	const ownerLocation: [number, number] | null = country.getOwnerLocation();
	if (ownerLocation) {
		const owner: Country = countries.getCountryByLocation(ownerLocation);
		connectedLocations.push(
			owner.getCountryLocation(),
			...owner.getTerritories() // contains country location
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
 * @param {Countries} countries - The Countries instance managing the collection of countries.
 * @param {Array<[number, number]>} locations - The locations of the countries to update.
 */
export function changeCountryStateTo(
	state: string,
	countries: Countries,
	locations: [number, number][]
): void {
	const materialCloned: Material = getColorsArray()[colorDict[state]].clone();

	locations.forEach(([continent, country]: number[]): void => {
		const countryElement: Country = countries.getCountryByLocation([
			continent,
			country,
		]);
		countryElement.setState(state);
		const countryMeshes: Object3D = countryElement.getCountryMeshes();
		if (countryMeshes instanceof Mesh)
			countryMeshes.material = materialCloned;
	});
	materialCloned.needsUpdate = true;
}
