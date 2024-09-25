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

export function getIntersect(mouseX: number, mouseY: number): Intersection[] {
	const raycaster = new Raycaster();
	const mouseVector = new Vector2(mouseX, mouseY);
	raycaster.setFromCamera(mouseVector, getCamera());
	// visualizeRay(raycaster)
	return raycaster.intersectObjects(getScene().children, true);
}

export function isMesh(obj: any): obj is Mesh {
	return obj && obj instanceof Mesh;
}

export function changeElementsVisibility(
	elementArray: HTMLElement[],
	visibility: "hidden" | "visible"
): void {
	elementArray.forEach((element: HTMLElement): void => {
		element.style.visibility = visibility;
	});
}

export function getObjCenter(obj: Object3D): Vector3 {
	const objBox: Box3 = new Box3().setFromObject(obj);
	const objCenter: Vector3 = new Vector3();
	objBox.getCenter(objCenter);
	return objCenter;
}

export function getCombinedCenter(objects: Object3D[]): Vector3 {
	const combinedBox: Box3 = new Box3();

	objects.forEach((obj: Object3D): void => {
		combinedBox.expandByObject(obj);
	});

	const combinedCenter: Vector3 = new Vector3();
	combinedBox.getCenter(combinedCenter);
	return combinedCenter;
}

export function getGradientColor(percentage: number) {
	let hue = (percentage / 100) * 120;
	return `hsl(${hue}, 100%, 50%)`;
}

export function changeCountryOfCountryAttribute(
	indexCA: number,
	state: string,
	type: string,
	region: number
): void {
	const world: World = getWorld();
	let countryAttribute;
	switch (type) {
		case "currency":
			countryAttribute = world.currencyArray[indexCA];
			break;
		case "language":
			state = type;
			countryAttribute = world.languageArray[indexCA];
			break;
		default:
			return;
	}
	countryAttribute.locations.forEach((index: number): void => {
		const country: Country = world.countryArray[index];
		if (country.owned || (region !== 7 && country.location[0] !== region)) {
			return;
		}
		country.state = state;
		if (!country.visible) {
			world.setCountryAndConnectedVisibility(index, true);
		}
		world.triggerCountryAnimation(index, state, false);
	});
}

// Function to apply gradient color to a material
export function makeMaterialWithGradient(percentage: number): Material {
	// Get the color in HSL and convert it to a THREE.js color
	const colorString: string = getGradientColor(percentage);
	const color = new Color(colorString);

	// Create a material and set the color
	return new MeshStandardMaterial({
		color: color,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
}
