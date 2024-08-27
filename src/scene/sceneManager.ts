// scene/sceneManager.ts
import {
	Box3,
	EdgesGeometry,
	LineBasicMaterial,
	LineSegments,
	Material,
	Mesh,
	Object3D,
	Scene,
	Vector3,
} from "three";
import { Countries } from "../country/Countries";
import { loadModel } from "../utils/loader";
import { animate } from "../utils/animation";
import { getRenderer } from "./sceneSetup";
import {
	changeCountryStateTo,
	changeCountryVisibilityTo,
	getConnected,
} from "../country/countryManager";
import {
	isFollowing,
	isPlaying,
	isRotating,
	toggleIsPlaying,
	toggleIsRotating,
} from "../controls/playingState";
import { cameraFaceTo, setCameraPosition } from "../camera/camera";
import { Country } from "../country/Country";
import { isMesh } from "../utils/utilities";

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
	//createTable(countries);
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
		const continents = globe.children[0];
		countries.setContinents(continents.children);
		console.log(countries.getContinents());

		countries.getCountriesArray().forEach((country: Country): void => {
			const location: [number, number] = country.getCountryLocation();
			const countryObj: Object3D =
				continents.children[location[0]].children[location[1]]; // need to get the pos of the parent for this one
			country.setCountryObj(countryObj);
			const meshes = countryObj.children[0];
			if (isMesh(meshes)) {
				country.setcountryMeshes(meshes);
			}
			changeCountryStateTo("unknown", countries, [location]);
			makeCountryOutline(country.getCountryMeshes());
		});
		animate(getRenderer(), modelParent);
	} catch (error: unknown) {
		console.error("An error occurred while loading the model:", error);
	}
}

/**
 * Resets the model state to its initial configuration.
 * Stops any ongoing game, toggles rotation state, clears found countries, and resets visibility and camera position.
 */
export function resetModel(): void {
	if (isPlaying()) toggleIsPlaying();
	if (!isRotating()) toggleIsRotating();
	if (isFollowing()) countries.clearFound();
	countries.getCountriesArray().forEach((country: Country): void => {
		const location: [number, number] = country.getCountryLocation();
		changeCountryStateTo("unknown", countries, [location]);
		changeCountryVisibilityTo(true, countries, [location]);
	});
	const basePosition: Vector3 = new Vector3(0, 0, 140);
	setCameraPosition(basePosition);
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
	// Countries states/visibility change
	if (isHard) {
		// Set countries to invisible to the eye
		countries.getCountriesArray().forEach((country: Country): void => {
			if (country.getOwnerLocation() === null) {
				changeCountryVisibilityTo(
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
				const countryLoc: [number, number] =
					country.getCountryLocation();
				if (countryLoc[0] !== continentIndex) {
					changeCountryStateTo(
						"unavailable",
						countries,
						getConnected(countryLoc, countries)
					);
				}
			}
		});
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
 * Creates an outline around a country object for better visibility.
 *
 * @param {Mesh} obj - The 3D object to add an outline to.
 */
function makeCountryOutline(obj: Mesh): void {
	if (obj.geometry) {
		// Create an EdgesGeometry for the outline
		const edgesGeometry = new EdgesGeometry(obj.geometry, 45);
		const edgeMaterial = new LineBasicMaterial({
			color: 0x000000,
		});

		const edgesMesh = new LineSegments(edgesGeometry, edgeMaterial);

		// Add the outline to the child Mesh
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
	const objPos = obj.position.clone();
	const direction = objPos.clone().normalize();

	// Calculate the target position by moving the object along the direction vector
	const targetPos = objPos.clone().addScaledVector(direction, distance);

	// const objCenter = getObjCenter(obj);

	// // Visualize the direction with an ArrowHelper
	// const arrowHelper = new ArrowHelper(
	// 	objCenter.clone().normalize(),
	// 	objCenter,
	// 	50,
	// 	0xff0000
	// );
	// getScene().add(arrowHelper);
	return [objPos, targetPos];
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
