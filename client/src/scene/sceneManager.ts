import * as THREE from "three";
import { createTable } from "../country/countriesTable";
import { Countries } from "../country/Countries";
import { loadModel } from "../utils/loader";
import { animate } from "./animate";
import { getRenderer } from "./sceneSetup";
import { changeColorTo, changeVisibilityTo } from "../country/countryManager";
import { getIsPlaying, toggleIsPlaying } from "../controls/toggleControls";
import { setCameraPosition } from "../camera/camera";

const countries: Countries = new Countries();
let modelParent: THREE.Object3D;
let globe: THREE.Object3D;
let allCountriesCaps: THREE.Object3D;
let allCountriesBody: THREE.Object3D;
const colorsArray: THREE.Material[] = [];

export async function setupSceneModel(scene: THREE.Scene): Promise<void> {
	countries.initialize("static/xml/countries_data.xml");
	await loadAndInitializeModel(scene);
	createTable(countries);
}

async function loadAndInitializeModel(scene: THREE.Scene): Promise<void> {
	try {
		modelParent = await loadModel(scene, colorsArray);
		globe = modelParent.children[0];
		allCountriesCaps = globe.children[1];
		allCountriesBody = globe.children[0];
		for (let i = 0; i < countries.getSize(); i++) {
			changeColorTo(i, "unknown", countries);
		}
		animate(getRenderer(), modelParent);
	} catch (error) {
		console.error("An error occurred while loading the model:", error);
	}
}

export function resetModel() {
	if (getIsPlaying()) toggleIsPlaying();
	countries.clearFound();
	for (let i = 0; i < countries.getSize(); i++) {
		changeColorTo(i, "unknown", countries);
	}
	const basePosition: THREE.Vector3 = new THREE.Vector3(0, 0, 140);
	setCameraPosition(basePosition);
}

export function setupModelForGame(isHard: boolean, continentIndex: number) {
	if (isHard) {
		// Set countries to invisible to the eye
		for (let i = 0; i < countries.getSize(); i++) {
			changeVisibilityTo(i, false, countries);
		}
	} else if (continentIndex !== -1) {
		// Change all countries not in the continent to unavailable color
		const minIndex = countries.getRealIndex([continentIndex, 0]);
		const maxIndex =
			continentIndex === 5
				? countries.getSize()
				: countries.getRealIndex([continentIndex + 1, 0]);
		console.log(minIndex);
		console.log(maxIndex);
		for (let i = 0; i < minIndex; i++) {
			changeColorTo(i, "unavailable", countries);
		}
		for (let i = maxIndex; i < countries.getSize(); i++) {
			changeColorTo(i, "unavailable", countries);
		}
		//TODO
	}
}

export function getAllCountriesCaps() {
	return allCountriesCaps;
}

export function getAllCountriesBody() {
	return allCountriesBody;
}

export function getGlobe() {
	return globe;
}
export function getColorsArray() {
	return colorsArray;
}

export function getCountries(){
	return countries;
}