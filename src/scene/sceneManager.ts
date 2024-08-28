// scene/sceneManager.ts
import { Box3, Material, Object3D, Scene, Vector3 } from "three";
import { Countries, countryToFind } from "../country/Countries";
import { loadModel } from "../utils/loader";
import { animate } from "../utils/animation";
import { getRenderer } from "./sceneSetup";
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
import { Timer } from "../utils/Timer";
import { handlePauseStart } from "../controls/inputHandlers";
import { changeCountryCellTo } from "../country/countriesTable";
import {
	changeCountryStateTo,
	changeCountryVisibilityTo,
	getConnected,
	initializeCountries,
	resetCountries,
} from "../utils/countryUtils";

const countries: Countries = new Countries();
let modelParent: Object3D;
let globe: Object3D;
let water: Object3D;
const colorsArray: Material[] = [];

/**
 * Initializes the scene model by loading country data and the 3D model.
 * Also sets up the countries table.
 *
 * @param {Scene} scene - The Three.js scene where the model will be added.
 * @returns {Promise<void>} A promise that resolves when the setup is complete.
 */
export async function setupSceneModel(scene: Scene): Promise<void> {
	await countries.initialize("assets/xml/countries_data.xml");
	await loadAndInitializeModel(scene);
}

/**
 * Loads and initializes the 3D model for the scene.
 * Sets up the globe and water objects and configures the countries.
 *
 * @param {Scene} scene - The Three.js scene where the model will be added.
 * @returns {Promise<void>} A promise that resolves when the model is successfully loaded and initialized.
 */
async function loadAndInitializeModel(scene: Scene): Promise<void> {
	try {
		modelParent = await loadModel(scene, colorsArray);
		globe = modelParent.children[0];
		water = globe.children[1];
		water.receiveShadow = true;
		const continents: Object3D = globe.children[0];
		countries.setContinents(continents.children);
		console.debug(countries.getContinents());

		initializeCountries(continents);
		animate(getRenderer(), modelParent);
	} catch (error: unknown) {
		console.error("An error occurred while loading the model:", error);
	}
}

/**
 * Resets the model to its initial state.
 * Stops any ongoing game, enables rotation state, clears found countries, and resets visibility and camera position.
 */
export function resetModel(): void {
	if (isPlaying()) toggleIsPlaying();
	if (!isRotating()) toggleIsRotating();
	if (isFollowing()) toggleIsFollowing();
	countries.clearFound();
	resetCountries();
	setCameraPosition(new Vector3(0, 0, 118));
}

/**
 * Configures the model for the game based on difficulty and continent index.
 * Changes country states and visibility based on the game mode.
 *
 * @param {boolean} isHard - If true, sets countries to invisible if not owned.
 * @param {number} continentIndex - The index of the continent to focus on. If -1, no specific continent is focused.
 */
export function setupModelForGame(
	isHard: boolean,
	continentIndex: number
): void {
	// Change all countries not in the continent to unavailable color/state
	countries.getCountryArray().forEach((country: Country): void => {
		if (country.getOwnerLocation() === null) {
			const countryLoc: [number, number] = country.getCountryLocation();
			if (continentIndex !== -1 && countryLoc[0] !== continentIndex) {
				changeCountryStateTo("unavailable", getConnected(countryLoc));
			} else {
				if (isHard) {
					changeCountryVisibilityTo(false, getConnected(countryLoc));
				}
				changeCountryStateTo("unknown", getConnected(countryLoc));
			}
			changeCountryCellTo("invisible", countryLoc);
		}
	});
	if (continentIndex !== -1) {
		const continentObj: Object3D =
			countries.getContinents()[continentIndex];
		cameraFaceTo(getObjCenter(continentObj));
	}

	if (isRotating()) toggleIsRotating();
}

/**
 * Retrieves the globe object from the scene.
 *
 * @returns {Object3D} The globe object.
 */
export function getGlobe(): Object3D {
	return globe;
}

/**
 * Retrieves the array of materials used for coloring countries.
 *
 * @returns {Material[]} The array of materials.
 */
export function getColorsArray(): Material[] {
	return colorsArray;
}

/**
 * Retrieves the Countries instance that manages the country data.
 *
 * @returns {Countries} The Countries instance.
 */
export function getCountries(): Countries {
	return countries;
}

/**
 * Computes the center position of a 3D object.
 *
 * @param {Object3D} obj - The 3D object to compute the center for.
 * @returns {Vector3} The center position of the object.
 */
export function getObjCenter(obj: Object3D): Vector3 {
	const objBox: Box3 = new Box3().setFromObject(obj);
	const objCenter: Vector3 = new Vector3();
	objBox.getCenter(objCenter);
	return objCenter;
}

export function restartQuiz(
	continentIndex: number,
	timer: Timer,
	isHard: boolean,
	restartButton: HTMLButtonElement
): void {
	const countryCounter: HTMLDivElement = document.getElementById(
		"country-counter"
	) as HTMLDivElement;
	const pauseStart: HTMLButtonElement = document.getElementById(
		"quiz-stop-start"
	) as HTMLButtonElement;
	const countries: Countries = getCountries();
	countries.clearFound();
	countryCounter.textContent =
		String(countries.getFound()) +
		"\u00A0/\u00A0" +
		countryToFind["base"] +
		" guessed";
	setupModelForGame(isHard, continentIndex);
	timer.reset();
	toggleIsPlaying();
	handlePauseStart(false, timer);
	pauseStart.style.visibility = "visible";
	restartButton.remove();
}
