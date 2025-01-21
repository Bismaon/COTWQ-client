import { getCamera } from "../camera/camera";
import { getScene } from "../scene/sceneSetup";
import {
	Box3,
	Color,
	Intersection,
	Material,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	Raycaster,
	Vector2,
	Vector3,
} from "three";
import { getWorld } from "../scene/sceneManager";
import { Country } from "../country/Country";
import { World } from "../country/World";
import { AttributeStructure } from "../country/AttributeStructure";
import { countryLoc } from "./types";
import { FOUND } from "./constants";

/**
 * Processes a string by normalizing and removing diacritics, punctuation, spaces, and text within parentheses.
 * @param {string} name - The string to process.
 * @returns {string} The processed string.
 */
export function processText(name: string): string {
	name = name
		.toLowerCase()
		.normalize("NFD") // Normalize to NFD form to separate accents
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
		.replace(/\(.*?\)/g, "") // Remove text inside parentheses
		.replace(/[-,.'"_]/g, "") // Remove hyphens, commas, periods, apostrophes, quotes, and underscores
		.replace(/\s+/g, ""); // Remove all spaces
	return name;
}

/**
 * Returns the intersections of a raycast with objects in the scene.
 * @param {number} mouseX - The X coordinate of the mouse.
 * @param {number} mouseY - The Y coordinate of the mouse.
 * @returns {Intersection[]} An array of intersections.
 */
export function getIntersect(mouseX: number, mouseY: number): Intersection[] {
	const raycaster = new Raycaster();
	const mouseVector = new Vector2(mouseX, mouseY);
	raycaster.setFromCamera(mouseVector, getCamera());
	// visualizeRay(raycaster)
	return raycaster.intersectObjects(getScene().children, true);
}

/**
 * Checks if an object is a mesh.
 * @param {any} obj - The object to check.
 * @returns {boolean} True if the object is a mesh, otherwise false.
 */
export function isMesh(obj: any): obj is Mesh {
	return obj && obj instanceof Mesh;
}

/**
 * Changes the visibility of multiple HTML elements.
 * @param {HTMLElement[]} elementArray - The array of HTML elements.
 * @param {"hidden" | "visible"} visibility - The visibility state to apply.
 */
export function changeElementsVisibility(
	elementArray: HTMLElement[],
	visibility: "hidden" | "visible"
): void {
	elementArray.forEach((element: HTMLElement, index: number): void => {
		if (!element) {
			console.warn(
				"An element does not exist at index: ",
				index,
				", of array: ",
				elementArray
			);
			return;
		}
		element.style.visibility = visibility;
	});
}

/**
 * Calculates the center of a 3D object.
 * @param {Object3D} obj - The 3D object.
 * @returns {Vector3} The center position of the object.
 */
export function getObjCenter(obj: Object3D): Vector3 {
	const objBox: Box3 = new Box3().setFromObject(obj);
	const objCenter: Vector3 = new Vector3();
	objBox.getCenter(objCenter);
	return objCenter;
}

/**
 * Calculates the combined center of multiple 3D objects.
 * @param {Object3D[]} objects - The array of 3D objects.
 * @returns {Vector3} The combined center position of the objects.
 */
export function getCombinedCenter(objects: Object3D[]): Vector3 {
	const combinedBox: Box3 = new Box3();

	objects.forEach((obj: Object3D): void => {
		combinedBox.expandByObject(obj);
	});

	const combinedCenter: Vector3 = new Vector3();
	combinedBox.getCenter(combinedCenter);
	const distanceFromCenter: number = combinedCenter.length();
	if (distanceFromCenter < 70) {
		if (distanceFromCenter === 0) {
			combinedCenter.set(1, 0, 0);
		}
		const directionToCenter: Vector3 = combinedCenter.clone().normalize();
		const newCameraPosition: Vector3 = directionToCenter.multiplyScalar(70);

		combinedCenter.copy(newCameraPosition);
	}
	return combinedCenter;
}

/**
 * Generates a gradient color in HSL format based on a percentage.
 * @param {number} percentage - The percentage (0-100).
 * @returns {string} The HSL color string.
 */
export function getGradientColor(percentage: number): string {
	let hue: number = (percentage / 100) * 120;
	return `hsl(${hue}, 100%, 50%)`;
}

/**
 * Updates the state of countries associated with a CountryAttribute.
 * @param {AttributeStructure} ca - The CountryAttribute to modify.
 * @param {string} state - The state to apply.
 * @param {number} region - The region to filter by.
 */
export function changeCountryOfCountryAttribute(
	ca: AttributeStructure,
	state: string,
	region: number
): void {
	const world: World = getWorld();
	ca.territories.forEach((loc: countryLoc): void => {
		const index = world.getRealIndex(loc);
		const country: Country = world.countries.get(index) as Country;
		if (!country.isInRegion(region)) {
			return;
		}
		country.state = state;
		if (!country.visible) {
			world.setCountryVisibility(index, true);
		}
		world.triggerCountryAnimation(index, ca.type, state, false);
	});
	if (state === FOUND) {
		ca.found = true;
	}
}

/**
 * Creates a material with a gradient color based on a percentage.
 * @param {number} percentage - The percentage (0-100).
 * @returns {Material} The generated material.
 */ export function makeMaterialWithGradient(percentage: number): Material {
	const colorString: string = getGradientColor(percentage);
	const color = new Color(colorString);

	return new MeshStandardMaterial({
		color: color,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
}

/**
 * Checks if a country belongs to the specified continent.
 * @param {number} continentIndex - The index of the continent.
 * @param {Country} country - The country to check.
 * @returns {boolean} True if the country belongs to the continent, otherwise false.
 */
export function correctContinent(
	continentIndex: number,
	country: Country
): boolean {
	if (continentIndex !== -1) {
		return continentIndex === country.location[0];
	}
	return true;
}

/**
 * Retrieves the center position of a CountryAttribute's 3D object.
 * @param {number} continentIndex - The continent index.
 * @returns {Vector3} The center position.
 */
export function getCenterCA(continentIndex: number): Vector3 {
	const world: World = getWorld();
	const currItem: [number, any] = getNthItem(
		world.sequentialRandomMap,
		world.sequentialRandomIndex
	) as [number, any];
	const locations: countryLoc[] = currItem[1].locations;
	let firstCountryOfCAInCI: Country;
	let objCenter: Vector3 = new Vector3();
	locations.forEach((loc: countryLoc): void => {
		const index: number = world.getRealIndex(loc);
		const country: Country = world.countries.get(index) as Country;
		if (!correctContinent(continentIndex, country)) return;
		if (firstCountryOfCAInCI) return;
		firstCountryOfCAInCI = country;
		objCenter = getObjCenter(firstCountryOfCAInCI.object);
	});
	return objCenter;
}

/**
 * Formats a time string (HHMMSS) into a human-readable format.
 * @param {string} time - The time string to format.
 * @returns {string} The formatted time.
 */
export function formatTime(time: string): string {
	let hoursStr: string, minutesStr: string, secondsStr: string;
	const hours: number = Number(time.slice(0, 2));
	if (hours === 0) {
		hoursStr = "";
	} else {
		hoursStr = `${hours}h `;
	}
	const minutes: number = Number(time.slice(2, 4));
	if (minutes === 0) {
		minutesStr = "";
	} else if (minutes < 10 && hours !== 0) {
		minutesStr = `0${minutes}min `;
	} else {
		minutesStr = `${minutes}min `;
	}
	const seconds: number = Number(time.slice(4, 6));
	if (seconds === 0) {
		secondsStr = "";
	} else if (seconds < 10 && minutes !== 0) {
		secondsStr = `0${seconds}sec`;
	} else {
		secondsStr = `${seconds}sec `;
	}
	console.log("base: ", time);
	console.log("str: ", hoursStr + minutesStr + secondsStr);
	return hoursStr + minutesStr + secondsStr;
}

/**
 * Formats a game name string into a human-readable format.
 * @param {string} gameName - The game name string to format.
 * @returns {string} The formatted game name.
 */
export function formatGameName(gameName: string): string {
	console.log("Game name: ", gameName);
	const [region, normal, hard, gameType] = gameName.split("-");
	let regionStr: string = region.split("_").join(" ");
	regionStr = regionStr.charAt(0).toUpperCase() + regionStr.slice(1);
	let normalStr: string = normal.split("_").join(" ");
	normalStr = normalStr.charAt(0).toUpperCase() + normalStr.slice(1);
	let hardStr: string = hard === "true" ? "Hard" : "Easy";
	let gameTypeStr: string =
		gameType.charAt(0).toUpperCase() + gameType.slice(1);
	return (
		regionStr + " | " + normalStr + " | " + hardStr + " | " + gameTypeStr
	);
}

export function getIndexInMap<K, V>(
	map: Map<K, V>,
	condition: (value: V, key: K) => boolean
): number {
	let index: number = 0;
	for (const [key, value] of Array.from(map.entries())) {
		if (condition(value, key)) {
			return index;
		}
		index++;
	}
	return -1; // Return -1 if not found
}

export function getNthItem<K, V>(
	map: Map<K, V>,
	n: number
): [K, V] | undefined {
	const entries = Array.from(map.entries());
	return n >= 0 && n < entries.length ? entries[n] : undefined;
}

export function deleteNthItem<K, V>(map: Map<K, V>, n: number): void {
	let [index]: [K, V] = getNthItem(map, n) as [K, V];
	map.delete(index);
}

export function hasValue<K, V>(
	map: Map<K, V>,
	valueCheck: (value: V) => boolean
): number {
	let valueArray: V[] = Array.from(map.values());
	return valueArray.findIndex(valueCheck);
}
