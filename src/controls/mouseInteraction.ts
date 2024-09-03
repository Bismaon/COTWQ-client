// interaction/mouseInteraction.ts
import { Intersection, Object3D } from "three";
import { getIntersect } from "../utils/utilities";
import { Country } from "../country/Country";
import { getWorld } from "../scene/sceneManager";
import { isPlaying } from "./playingState";

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

export function updateCountryName(countryName: string): void {
	const countryNameElement: HTMLDivElement = document.getElementById(
		"country-name-container"
	) as HTMLDivElement;

	if (!countryNameElement) return; // meh
	countryNameElement.textContent = countryName;
}
export function isValidObject(intersectedObject: Object3D): [boolean, string] {
	const objName: string = intersectedObject.name;
	if (objName === "water" || objName === "") return [false, ""];

	const countryObj: Object3D | null = intersectedObject.parent;
	if (!countryObj) {
		return [false, ""];
	}

	const country: Country = getWorld().getCountryByObject(countryObj);
	const validity =
		country.isFound || (!isPlaying() && country.state === "error");
	return [validity, country.name];
}



