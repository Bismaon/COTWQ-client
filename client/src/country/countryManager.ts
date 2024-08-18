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

const colorDict: { [key: string]: number } = {
	unknown: 0,
	found: 1,
	unavailable: 2,
	error: 3,
	selected: 4,
	water: 5,
};
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
		const location: number[] = wantedCountry.getCountryLocation();
		setCountryIsFoundTo(wantedCountry, true, countries);
		changeColorTo(location, "found", countries);
		textBox.value = "";
		const allCountriesBody = getAllCountriesBody();
		const country =
			allCountriesBody.children[location[0]].children[location[1]];
		const countryPosition = new THREE.Vector3();
		country.getWorldPosition(countryPosition);
		if (isFollowing()) cameraFaceTo(countryPosition);
	}
	return countries.isAllFound("base");
}

export function changeVisibilityTo(
	locParameter: number[] | number,
	visibility: boolean,
	countries: Countries
): void {
	let location: number[];
	if (!Array.isArray(locParameter)) {
		location = countries
			.getCountriesArray()
			[locParameter].getCountryLocation();
	} else {
		location = locParameter;
	}
	const connectedLocations: number[][] = getConnected(location, countries);
	const allCountriesBody = getAllCountriesBody();
	const allCountriesCaps = getAllCountriesCaps();

	connectedLocations.forEach(([continent, country]) => {
		allCountriesCaps.children[continent].children[country].visible =
			visibility;
		allCountriesBody.children[continent].children[country].visible =
			visibility;
	});
}

function getConnected(location: number[], countries: Countries): number[][] {
	const connectedLocations: number[][] = [];
	const country: Country | null = countries.getCountryByLocation(location);

	if (!country) {
		console.error("ERROR: country is null");
		return connectedLocations;
	}

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

export function changeColorTo(
	locParameter: number[] | number,
	colorIndex: string,
	countries: Countries
): void {
	const materialCloned: THREE.Material =
		getColorsArray()[colorDict[colorIndex]].clone();
	let location: number[];
	if (!Array.isArray(locParameter)) {
		location = countries
			.getCountriesArray()
			[locParameter].getCountryLocation();
	} else {
		location = locParameter;
	}
	const connectedLocations: number[][] = getConnected(location, countries);
	const allCountriesBody = getAllCountriesBody();
	const allCountriesCaps = getAllCountriesCaps();
	connectedLocations.forEach(([continent, country]) => {
		const cap: THREE.Object3D =
			allCountriesCaps.children[continent].children[country];
		const body: THREE.Object3D =
			allCountriesBody.children[continent].children[country].children[0];
		if (cap instanceof THREE.Mesh) cap.material = materialCloned;
		if (body instanceof THREE.Mesh) body.material = materialCloned;
	});
	materialCloned.needsUpdate = true;
}
