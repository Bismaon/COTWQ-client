// scene/sceneManager.ts
import * as THREE from "three";
import { createTable } from "../country/countriesTable";
import { Countries } from "../country/Countries";
import { loadModel } from "../utils/loader";
import { animate } from "./animate";
import { getRenderer } from "./sceneSetup";
import {
	changeCountryStateTo,
	changeCountryVisibilityTo,
	getConnected,
} from "../country/countryManager";
import {
	getIsPlaying,
	getIsRotating,
	toggleIsPlaying,
	toggleIsRotating,
} from "../controls/playingState";
import { cameraFaceTo, setCameraPosition } from "../camera/camera";
import { Country } from "../country/Country";

const countries: Countries = new Countries();
let modelParent: THREE.Object3D;
let globe: THREE.Object3D;
let allCountriesCaps: THREE.Object3D;
let allCountriesBody: THREE.Object3D;
const colorsArray: THREE.Material[] = [];

export async function setupSceneModel(scene: THREE.Scene): Promise<void> {
	await countries.initialize("static/xml/countries_data.xml");
	await loadAndInitializeModel(scene);
	createTable(countries);
}

async function loadAndInitializeModel(scene: THREE.Scene): Promise<void> {
	try {
		modelParent = await loadModel(scene, colorsArray);
		globe = modelParent.children[0];
		allCountriesCaps = globe.children[1];
		allCountriesBody = globe.children[0];
		for (let i: number = 0; i < countries.getSize(); i++) {
			changeCountryStateTo(i, "unknown", countries, []);
		}
		animate(getRenderer(), modelParent);
	} catch (error) {
		console.error("An error occurred while loading the model:", error);
	}
}

export function resetModel(): void {
	if (getIsPlaying()) toggleIsPlaying();
	if (!getIsRotating()) toggleIsRotating();
	countries.clearFound();
	countries.getCountriesArray().forEach((country: Country): void => {
		const location: number[] = country.getCountryLocation();
		changeCountryStateTo(location, "unknown", countries, []);
		changeCountryVisibilityTo(location, true, countries, []);
	});
	const basePosition: THREE.Vector3 = new THREE.Vector3(0, 0, 140);
	setCameraPosition(basePosition);
}

export function setupModelForGame(
	isHard: boolean,
	continentIndex: number
): void {
	// Countries states/visibility change
	if (isHard) {
		// Set countries to invisible to the eye
		countries.getCountriesArray().forEach((country: Country): void => {
			if (country.getOwnerLocation() === null) {
				changeCountryVisibilityTo(
					country.getCountryLocation(),
					false,
					countries,
					getConnected(country.getCountryLocation(), countries)
				);
			}
		});
	}
	if (continentIndex !== -1) {
		// Change all countries not in the continent to unavailable color/state
		countries.getCountriesArray().forEach((country: Country): void => {
			if (country.getOwnerLocation() === null) {
				const countryLoc: number[] = country.getCountryLocation();
				if (countryLoc[0] !== continentIndex) {
					changeCountryStateTo(
						countryLoc,
						"unavailable",
						countries,
						getConnected(countryLoc, countries)
					);
				}
			}
		});
		const continentCapsObject: THREE.Object3D =
			getAllCountriesCaps().children[continentIndex];
		const continentBox: THREE.Box3 = new THREE.Box3().setFromObject(
			continentCapsObject
		);
		const continentCenter: THREE.Vector3 = continentBox.getCenter(
			new THREE.Vector3()
		);
		cameraFaceTo(continentCenter);
	}
	if (getIsRotating()) toggleIsRotating();
}

export function getAllCountriesCaps(): THREE.Object3D {
	return allCountriesCaps;
}

export function getAllCountriesBody(): THREE.Object3D {
	return allCountriesBody;
}

export function getGlobe(): THREE.Object3D {
	return globe;
}

export function getColorsArray(): THREE.Material[] {
	return colorsArray;
}

export function getCountries(): Countries {
	return countries;
}
