// countryUtils.ts
import {
	EdgesGeometry,
	LineBasicMaterial,
	LineSegments,
	Material,
	Mesh,
	Object3D,
	Vector3,
} from "three";
import { Country } from "../country/Country";
import { isMesh } from "./utilities";
import {
	getColorsArray,
	getCountries,
	getObjCenter,
} from "../scene/sceneManager";
import { Countries } from "../country/Countries";
import { bounceAnimation } from "./animation";
import { isFollowing } from "../controls/playingState";
import { cameraFaceTo } from "../camera/camera";
import { changeCountryCellTo } from "../country/countriesTable";

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
 * @param {Country} country - The country to mark as found.
 * @param {boolean} found - Indicates whether the country is found or not.
 */
export function setCountryIsFoundTo(country: Country, found: boolean): void {
	const countries: Countries = getCountries();
	country.setFound(found);
	countries.incrementFound();
	country.getTerritories().forEach((location: [number, number]): void => {
		countries.getCountryByLocation(location).setFound(true);
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

export function initializeCountries(continents: Object3D): void {
	getCountries()
		.getCountryArray()
		.forEach((country: Country): void => {
			const location: [number, number] = country.getCountryLocation();
			const countryObj: Object3D =
				continents.children[location[0]].children[location[1]];
			country.setCountryObj(countryObj);
			const meshes: Object3D = countryObj.children[0];
			if (isMesh(meshes)) {
				country.setcountryMeshes(meshes);
			}
			changeCountryStateTo("unknown", [location]);
			createCountryOutline(country.getCountryMeshes());
		});
}

export function resetCountries(): void {
	getCountries()
		.getCountryArray()
		.forEach((country: Country): void => {
			const location: [number, number] = country.getCountryLocation();
			changeCountryStateTo("unknown", [location]);
			changeCountryVisibilityTo(true, [location]);
		});
}

/**
 * Creates an outline around a country object for better visibility.
 *
 * @param {Mesh} obj - The 3D object to add an outline to.
 */

export function createCountryOutline(obj: Mesh): void {
	if (obj.geometry) {
		const edgesGeometry = new EdgesGeometry(obj.geometry, 45);
		const edgeMaterial = new LineBasicMaterial({ color: 0x000000 });
		const edgesMesh = new LineSegments(edgesGeometry, edgeMaterial);
		obj.add(edgesMesh);
	}
}

/**
 * Calculates the starting and target positions for animating a country object.
 *
 * @param {Object3D} obj - The 3D object to animate.
 * @param {number} distance - The distance to move the object.
 * @returns {Vector3[]} An array with the original position and the target position.
 */
export function getCountryMovement(obj: Object3D, distance: number): Vector3[] {
	const objPos: Vector3 = obj.position.clone();
	const direction: Vector3 = objPos.clone().normalize();
	const targetPos: Vector3 = objPos
		.clone()
		.addScaledVector(direction, distance);
	return [objPos, targetPos];
}

/**
 * Triggers an animation to indicate that a country has been found.
 *
 * @param {Array<[number, number]>} locations - The locations of the countries to animate.
 */
function triggerCountryFoundAnimation(locations: [number, number][]): void {
	const countries: Countries = getCountries();
	locations.forEach((location: [number, number]): void => {
		const countryObj: Object3D = countries
			.getCountryByLocation([location[0], location[1]])
			.getcountryObj();
		const [orgPos, targetPos]: Vector3[] = getCountryMovement(
			countryObj,
			100
		);
		bounceAnimation(countryObj, orgPos, targetPos, (): void => {
			changeCountryStateTo("found", [location]);
		});
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
		changeCountryCellTo("found", location);
		if (!country.isVisible()) {
			changeCountryVisibilityTo(true, connectedLoc);
		}

		triggerCountryFoundAnimation(connectedLoc);
		if (isFollowing()) {
			cameraFaceTo(getObjCenter(country.getcountryObj()));
		}
	}
	return getCountries().isAllFound("base");
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
