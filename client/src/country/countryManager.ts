// country/countryManager.ts
import { Countries } from "./Countries";
import * as THREE from "three";
import { isFollowing } from "../controls/inputHandlers";
import { Country } from "./Country";
import {
	getAllCountriesBody,
	getAllCountriesCaps,
	getColorsArray,
} from "../scene/sceneManager";
import { cameraFaceTo } from "../camera/camera";
import { bounceAnimation } from "../utils/animation";

const colorDict: { [key: string]: number } = {
	unknown: 0,
	found: 1,
	unavailable: 2,
	error: 3,
	selected: 4,
	water: 5,
};

const globeCenter = new THREE.Vector3(0, 0, 0);

export function setCountryIsFoundTo(
	wantedCountry: Country,
	found: boolean,
	countries: Countries
): void {
	wantedCountry.setFound(found);
	countries.incrementFound();
	wantedCountry.getTerritories().forEach((location: number[]) => {
		const country = countries.getCountryByLocation(location);
		country.setFound(true);
	});
}

export function foundSearch(
	wantedCountry: Country,
	textBox: HTMLInputElement,
	countries: Countries
): boolean {
	if (!wantedCountry.getFound()) {
		textBox.value = "";

		const location: number[] = wantedCountry.getCountryLocation();
		const connectedLoc: number[][] = getConnected(location, countries);
		setCountryIsFoundTo(wantedCountry, true, countries);
		if (!wantedCountry.isVisible()) {
			changeCountryVisibilityTo(location, true, countries, connectedLoc);
		}

		countryFoundAnimation(location, countries, connectedLoc);
		if (isFollowing()) {
			const worldPosition = new THREE.Vector3();
			getAllCountriesBody().children[location[0]].children[
				location[1]
			].getWorldPosition(worldPosition);
			cameraFaceTo(worldPosition);
		}
	}
	return countries.isAllFound("base");
}

function countryFoundAnimation(
	countryLoc: number[],
	countries: Countries,
	connectedLoc: number[][]
) {
	if (connectedLoc.length === 0) {
		connectedLoc.push(countryLoc);
	}
	const allCountriesBody = getAllCountriesBody();
	const allCountriesCaps = getAllCountriesCaps();
	const direction = new THREE.Vector3();

	connectedLoc.forEach((location) => {
		const countryBodyObject =
			allCountriesBody.children[location[0]].children[location[1]];
		const countryCapObject =
			allCountriesCaps.children[location[0]].children[location[1]];

		// Calculate the direction from the globe center to the object
		direction
			.subVectors(countryCapObject.position, globeCenter)
			.normalize();

		// Calculate the original position
		const originalPosition = countryCapObject.position.clone();

		// Calculate the "up" position by moving the object along the direction vector
		const targetPosition = originalPosition
			.clone()
			.addScaledVector(direction, 50);

		bounceAnimation(
			countryBodyObject,
			countryCapObject,
			originalPosition,
			targetPosition,
			() => {
				changeCountryStateTo(location, "found", countries, []);
			}
		);
	});
}

export function changeCountryVisibilityTo(
	countryLoc: number[] | number,
	visibility: boolean,
	countries: Countries,
	connectedLoc: number[][]
): void {
	if (connectedLoc.length === 0) {
		if (!Array.isArray(countryLoc)) {
			connectedLoc.push(
				countries.getCountriesArray()[countryLoc].getCountryLocation()
			);
		} else {
			connectedLoc.push(countryLoc);
		}
	}
	const allCountriesBody = getAllCountriesBody();
	const allCountriesCaps = getAllCountriesCaps();

	connectedLoc.forEach(([continent, country]) => {
		const countryElement: Country = countries.getCountryByLocation([
			continent,
			country,
		]);
		countryElement.setVisibility(visibility);
		allCountriesCaps.children[continent].children[country].visible =
			visibility;
		allCountriesBody.children[continent].children[country].visible =
			visibility;
	});
}

export function getConnected(
	location: number[],
	countries: Countries
): number[][] {
	const connectedLocations: number[][] = [];
	const country: Country = countries.getCountryByLocation(location);

	const ownerLocation: number[] | null = country.getOwnerLocation();
	if (ownerLocation) {
		const owner: Country = countries.getCountryByLocation(ownerLocation);
		connectedLocations.push(
			owner.getCountryLocation(),
			...owner.getTerritories()
		);
	} else {
		connectedLocations.push(
			country.getCountryLocation(),
			...country.getTerritories()
		);
	}
	return connectedLocations;
}

export function changeCountryStateTo(
	countryLoc: number[] | number,
	state: string,
	countries: Countries,
	connectedLoc: number[][]
): void {
	const materialCloned: THREE.Material =
		getColorsArray()[colorDict[state]].clone();

	if (connectedLoc.length === 0) {
		if (!Array.isArray(countryLoc)) {
			connectedLoc.push(
				countries.getCountriesArray()[countryLoc].getCountryLocation()
			);
		} else {
			connectedLoc.push(countryLoc);
		}
	}

	const allCountriesBody = getAllCountriesBody();
	const allCountriesCaps = getAllCountriesCaps();
	connectedLoc.forEach(([continent, country]) => {
		const countryElement: Country = countries.getCountryByLocation([
			continent,
			country,
		]);
		countryElement.setState(state);
		const cap: THREE.Object3D =
			allCountriesCaps.children[continent].children[country];
		const body: THREE.Object3D =
			allCountriesBody.children[continent].children[country].children[0];
		if (cap instanceof THREE.Mesh) cap.material = materialCloned;
		if (body instanceof THREE.Mesh) body.material = materialCloned;
	});
	materialCloned.needsUpdate = true;
}
