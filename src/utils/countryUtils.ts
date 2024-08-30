// countryUtils.ts
import {
	EdgesGeometry,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	Object3D,
	Vector3,
} from "three";
import { Country } from "../country/Country";
import { getObjCenter } from "./utilities";
import { getCountries } from "../scene/sceneManager";
import { Countries } from "../country/Countries";
import { bounceAnimation } from "./animation";
import { isFollowing } from "../controls/playingState";
import { cameraFaceTo } from "../camera/camera";
import { changeCountryCellTo } from "../country/countriesTable";

export function setCountryIsFoundTo(country: Country, found: boolean): void {
	const countries: Countries = getCountries();
	country.isFound = found;
	countries.incrementFound();
	country.territories.forEach((location: [number, number]): void => {
		countries.getCountryByLocation(location).isFound = true;
	});
}

export function changeCountryVisibilityTo(
	visibility: boolean,
	locations: [number, number][]
): void {
	const countries: Countries = getCountries();
	locations.forEach(([continent, country]: number[]): void => {
		countries.getCountryByLocation([continent, country]).isVisible =
			visibility;
	});
}

export function changeCountryStateTo(
	state: string,
	locations: [number, number][]
): void {
	const countries: Countries = getCountries();

	locations.forEach((location: [number, number]): void => {
		countries.getCountryByLocation(location).state = state;
	});
}


export function resetCountries(): void {
	getCountries().countryArray.forEach((country: Country): void => {
		const location: [number, number] = country.location;
		changeCountryStateTo("unknown", [location]);
		changeCountryVisibilityTo(true, [location]);
	});
}

export function createCountryOutline(mesh: Mesh): void {
	if (mesh.geometry) {
		const edgesGeometry = new EdgesGeometry(mesh.geometry, 45);
		const edgeMaterial = new LineBasicMaterial({ color: 0x000000 });
		const edgesMesh = new LineSegments(edgesGeometry, edgeMaterial);
		mesh.add(edgesMesh);
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
		const countryObj: Object3D = countries.getCountryByLocation([
			location[0],
			location[1],
		]).object;
		const [orgPos, targetPos]: Vector3[] = getCountryMovement(
			countryObj,
			100
		);
		bounceAnimation(countryObj, orgPos, targetPos, (): void => {
			changeCountryStateTo("found", [location]);
		});
	});
}

export function foundSearch(country: Country, gameMode: string): boolean {
	if (!country.isFound) {
		const location: [number, number] = country.location;
		const connectedLoc: [number, number][] = getConnected(location);
		setCountryIsFoundTo(country, true);
		changeCountryCellTo("found", location);
		if (!country.isVisible) {
			changeCountryVisibilityTo(true, connectedLoc);
		}

		triggerCountryFoundAnimation(connectedLoc);
		if (isFollowing()) {
			cameraFaceTo(getObjCenter(country.object));
		}
	}
	return getCountries().isAllFound(gameMode);
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

	// console.log(country.countryObj);
	const ownerLocation: [number, number] | null = country.owner;
	if (ownerLocation) {
		const owner: Country = countries.getCountryByLocation(ownerLocation);
		connectedLocations.push(owner.location, ...owner.territories);
	} else {
		connectedLocations.push(country.location, ...country.territories);
	}
	return connectedLocations;
}
