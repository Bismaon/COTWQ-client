// interaction/mouseInteraction.ts
import { Intersection, Object3D } from "three";
import { getIntersect } from "../utils/utilities";
import { Country } from "../country/Country";
import { getWorld } from "../scene/sceneManager";
import { isPlaying } from "./playingState";

/**
 * Handles mouse hover events over the 3D model.
 * Determines if the mouse is over a valid country and updates the country name display.
 * @param {MouseEvent} event - The mouse event containing position data.
 */
export function mouseHover(event: MouseEvent): void {
	const canvas: HTMLCanvasElement = document.getElementById(
		"modelCanvas"
	) as HTMLCanvasElement;

	const mouseX: number = (event.offsetX / canvas.width) * 2 - 1;
	const mouseY: number = -(event.offsetY / canvas.height) * 2 + 1;
	const intersects: Intersection[] = getIntersect(mouseX, mouseY);
	if (intersects.length > 0) {
		const intersectedObject: Object3D = intersects[0].object;
		const [validity, countryName]: [boolean, string] =
			isValidObject(intersectedObject);
		if (validity) {
			updateCountryName(countryName);
		} else {
			updateCountryName("");
		}
	} else {
		updateCountryName("");
	}
}

/**
 * Updates the displayed country name in the UI.
 * @param {string} countryName - The name of the country to display.
 */
export function updateCountryName(countryName: string): void {
	const countryNameElement: HTMLDivElement = document.getElementById(
		"country-name-container"
	) as HTMLDivElement;

	if (!countryNameElement) return; // meh
	countryNameElement.textContent = countryName;
}

/**
 * Determines if an intersected object is a valid country object.
 * @param {Object3D} intersectedObject - The object intersected by the mouse ray.
 * @returns {[boolean, string]} A tuple containing validity (true/false) and the country's name.
 */
export function isValidObject(intersectedObject: Object3D): [boolean, string] {
	const objName: string = intersectedObject.name;
	if (objName === "water" || objName === "") return [false, ""];

	const countryObj: Object3D | null = intersectedObject.parent;
	if (!countryObj) {
		return [false, ""];
	}

	const country: Country = getWorld().getCountryByObject(countryObj);
	const validity: boolean =
		country.found || (!isPlaying() && country.state === "error");
	return [validity, country.name];
}
