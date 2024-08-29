// scene/sceneManager.ts
import { Material, Object3D, Vector3 } from "three";
import { Countries } from "../country/Countries";
import { loadModel } from "../utils/loader";
import { animate } from "../utils/animation";
import {
	isFollowing,
	isPlaying,
	isRotating,
	toggleIsFollowing,
	toggleIsPlaying,
	toggleIsRotating,
} from "../controls/playingState";
import { cameraFaceTo, setCameraPosition } from "../camera/camera";
import { Country } from "../country/Country";
import { changeCountryCellTo } from "../country/countriesTable";
import {
	changeCountryStateTo,
	changeCountryVisibilityTo,
	getConnected,
	initializeCountries,
	resetCountries,
} from "../utils/countryUtils";
import { isControlsEnabled } from "../controls/controls";
import { getObjCenter } from "../utils/utilities";

const countries: Countries = new Countries();
let modelParent: Object3D;
let modelScene: Object3D;
let water: Object3D;
const colorsArray: Material[] = [];

export async function setupSceneModel(): Promise<void> {
	await countries.initialize("assets/xml/countries_data.xml");
	await loadAndInitializeModel();
}

async function loadAndInitializeModel(): Promise<void> {
	try {
		modelParent = await loadModel();
		modelScene = modelParent.children[0];
		water = modelScene.children[1];
		water.receiveShadow = true;
		const globe: Object3D = modelScene.children[0];
		countries.continents = globe.children;
		console.debug(countries.continents);

		initializeCountries();
		animate(modelParent);
	} catch (error: unknown) {
		console.error("An error occurred while loading the model:", error);
	}
}

export function resetModel(): void {
	if (isPlaying()) toggleIsPlaying();
	if (!isRotating()) toggleIsRotating();
	if (isFollowing()) toggleIsFollowing();
	isControlsEnabled(isPlaying());
	countries.clearFound();
	resetCountries();
	setCameraPosition(new Vector3(0, 0, 118));
}

export function setupModelForGame(
	isHard: boolean,
	continentIndex: number
): void {
	// Change all countries not in the continent to unavailable color/state
	countries.countryArray.forEach((country: Country): void => {
		if (country.ownerLocation === null) {
			const location: [number, number] = country.location;
			const locations: [number, number][] = getConnected(
				country.location
			);
			if (continentIndex !== -1 && location[0] !== continentIndex) {
				changeCountryStateTo("unavailable", locations);
			} else {
				if (isHard) {
					changeCountryVisibilityTo(false, locations);
				}
				changeCountryStateTo("unknown", locations);
			}
			changeCountryCellTo("invisible", location);
		}
	});
	if (continentIndex !== -1) {
		const continentObj: Object3D = countries.continents[continentIndex];
		cameraFaceTo(getObjCenter(continentObj));
	}

	if (isRotating()) toggleIsRotating();
}

export function getColorsArray(): Material[] {
	return colorsArray;
}

export function getCountries(): Countries {
	return countries;
}
