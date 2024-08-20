// interaction/mouseInteraction.ts
import * as THREE from "three";
import { getIntersect } from "../utils/utilities";
import {
	getIsPlaying,
	getIsRotating,
	toggleIsRotating,
} from "../controls/playingState";
import { getCountries } from "../scene/sceneManager";
import { Countries } from "../country/Countries";

export function handleMouseUp(event: MouseEvent): void {
	if (event.button === 0 && !getIsPlaying() && !getIsRotating())
		toggleIsRotating();
}

export function handleMouseDown(event: MouseEvent): void {
	if (event.button === 0 && getIsPlaying() && getIsRotating())
		toggleIsRotating();
}
export function onMouseMove(event: MouseEvent): void {
	const canvas: HTMLCanvasElement = document.getElementById(
		"modelCanvas"
	) as HTMLCanvasElement;

	const countries = getCountries();
	const mouseX: number = (event.offsetX / canvas.width) * 2 - 1;
	const mouseY: number = -(event.offsetY / canvas.height) * 2 + 1;
	const intersects: THREE.Intersection[] = getIntersect(mouseX, mouseY);
	if (intersects.length > 0) {
		const intersectedObject = intersects[0].object;
		if (isValidObject(intersectedObject, countries)) {
			updateCountryName(intersectedObject, countries);
		} else {
			updateCountryName(null, countries);
		}
	} else {
		updateCountryName(null, countries);
	}
}

function isValidObject(
	intersectedObject: THREE.Object3D,
	countries: Countries
): boolean {
	if (intersectedObject.name === "water") return false;
	const parentObj: THREE.Object3D | null = intersectedObject.parent;
	if (
		!parentObj ||
		parentObj.name ===
			intersectedObject.name.slice(0, parentObj.name.length)
	)
		return false;

	const continent: number = getIndexFromObject3D(parentObj);
	const country: number = getIndexFromObject3D(intersectedObject);
	return (
		countries.getCountryByLocation([continent, country]).getFound() &&
		getIsPlaying()
	);
}

function updateCountryName(
	intersectedObject: THREE.Object3D | null,
	countries: Countries
): void {
	const countryNameElement: HTMLElement | null = document.getElementById(
		"country-name-container"
	);
	if (countryNameElement) {
		if (intersectedObject == null || intersectedObject.parent == null) {
			countryNameElement.textContent = "";
		} else {
			const continent: number = getIndexFromObject3D(
				intersectedObject.parent
			);
			const country: number = getIndexFromObject3D(intersectedObject);
			countryNameElement.textContent = countries
				.getCountryByLocation([continent, country])
				.getCountryName(); // Display country name
		}
	}
}

function getIndexFromObject3D(object: THREE.Object3D): number {
	const parentObj: THREE.Object3D | null = object.parent;
	if (!parentObj) return -1;
	return parentObj.children.findIndex((obj) => obj === object);
}
