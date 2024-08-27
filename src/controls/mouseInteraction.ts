// interaction/mouseInteraction.ts
import { Intersection, Object3D } from "three";
import { getIntersect } from "../utils/utilities";
import { isPlaying } from "./playingState";
import { getCountries } from "../scene/sceneManager";
import { Countries } from "../country/Countries";
import { Country } from "../country/Country";

/**
 * Handles the mouse move event. Calculates the normalized device coordinates (NDC)
 * from the mouse position and checks for intersections with objects in the scene.
 * Updates the displayed country name based on the intersected object.
 *
 * @param {MouseEvent} event - The mouse event object.
 */
export function onMouseMove(event: MouseEvent): void {
	const canvas: HTMLCanvasElement = document.getElementById(
		"modelCanvas"
	) as HTMLCanvasElement;

	const countries: Countries = getCountries();
	const mouseX: number = (event.offsetX / canvas.width) * 2 - 1;
	const mouseY: number = -(event.offsetY / canvas.height) * 2 + 1;
	const intersects: Intersection[] = getIntersect(mouseX, mouseY);
	if (intersects.length > 0) {
		const intersectedObject: Object3D = intersects[0].object;
		if (isValidObject(intersectedObject, countries)) {
			updateCountryName(intersectedObject, countries);
		} else {
			updateCountryName(null, countries);
		}
	} else {
		updateCountryName(null, countries);
	}
}

/**
 * Determines if the intersected object is a valid country object.
 * An object is considered valid if it is not water, has a valid parent structure,
 * and the country is marked as found while the game is playing.
 *
 * @param {Object3D} intersectedObject - The object that was intersected by the mouse ray.
 * @param {Countries} countries - The Countries instance containing country data.
 * @returns {boolean} - True if the object is valid, otherwise false.
 */
function isValidObject(
	intersectedObject: Object3D,
	countries: Countries
): boolean {
	const objName = intersectedObject.name;
	if (objName === "water" || objName === "") return false;

	const countryObj: Object3D | null = intersectedObject.parent;
	if (!countryObj) {
		return false;
	}

	const continentObj: Object3D | null = countryObj.parent;
	if (!continentObj) {
		return false;
	}
	const continent: number = getIndexFromObject3D(continentObj);
	const country: number = getIndexFromObject3D(countryObj);
	const countryElement: Country = countries.getCountryByLocation([
		continent,
		country,
	]);
	return (
		(countryElement.getFound() && isPlaying()) ||
		(!isPlaying() && ["error", "found"].includes(countryElement.getState()))
	);
}

/**
 * Updates the country name displayed on the screen based on the intersected object.
 * If no valid object is intersected, it clears the displayed country name.
 *
 * @param {Object3D | null} intersectedObject - The intersected object or null if none.
 * @param {Countries} countries - The Countries instance containing country data.
 */
function updateCountryName(
	intersectedObject: Object3D | null,
	countries: Countries
): void {
	const countryNameElement: HTMLElement | null = document.getElementById(
		"country-name-container"
	);
	if (countryNameElement) {
		if (
			intersectedObject == null ||
			intersectedObject.parent == null ||
			intersectedObject.parent.parent == null
		) {
			countryNameElement.textContent = "";
		} else {
			const continent: number = getIndexFromObject3D(
				intersectedObject.parent.parent
			);
			const country: number = getIndexFromObject3D(
				intersectedObject.parent
			);
			countryNameElement.textContent = countries
				.getCountryByLocation([continent, country])
				.getCountryName(); // Display country name
		}
	}
}

/**
 * Retrieves the index of the given object within its parent's children array.
 * Returns -1 if the object is not found in its parent's children.
 *
 * @param {Object3D} object - The object for which to find the index.
 * @returns {number} - The index of the object within its parent's children array.
 */
function getIndexFromObject3D(object: Object3D): number {
	const parentObj: Object3D | null = object.parent;
	if (!parentObj) return -1;
	return parentObj.children.findIndex(
		(obj: Object3D): boolean => obj === object
	);
}
