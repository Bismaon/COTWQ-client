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
import { CountryAttribute, World } from "../country/World";

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
	const distanceFromCenter: number = combinedCenter.length();
	console.log("Before fix: ", combinedCenter);
	if (distanceFromCenter < 70) {
		if (distanceFromCenter === 0) {
			combinedCenter.set(1, 0, 0);
		}
		const directionToCenter: Vector3 = combinedCenter.clone().normalize();
		const newCameraPosition: Vector3 = directionToCenter.multiplyScalar(70);

		combinedCenter.copy(newCameraPosition);
	} //min distance to center
	console.log("After fix: ", combinedCenter);
	return combinedCenter;
}

export function getGradientColor(percentage: number): string {
	let hue: number = (percentage / 100) * 120;
	return `hsl(${hue}, 100%, 50%)`;
}

export function changeCountryOfCountryAttribute(
	ca: CountryAttribute,
	state: string,
	region: number
): void {
	const world: World = getWorld();
	ca.locations.forEach((index: number): void => {
		const country: Country = world.countryArray[index];
		if (region !== 7 && country.location[0] !== region) {
			return;
		}
		country.state = state;
		if (!country.visible) {
			world.setCountryVisibility(index, true);
		}
		world.triggerCountryAnimation(index, ca.type, state, false);
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

export function correctContinent(
	continentIndex: number,
	country: Country
): boolean {
	if (continentIndex !== -1) {
		return continentIndex === country.location[0];
	}
	return true;
}

export function getCenterCA(continentIndex: number): Vector3 {
	const world: World = getWorld();
	const currItem: CountryAttribute = world.sequentialRandomArray[
		world.sequentialRandomIndex
	] as CountryAttribute;
	const locations: number[] = currItem.locations;
	let firstCountryOfCAInCI: Country;
	let objCenter: Vector3 = new Vector3();
	locations.forEach((index: number): void => {
		const country: Country = world.countryArray[index];
		if (!correctContinent(continentIndex, country)) return;
		if (firstCountryOfCAInCI) return;
		firstCountryOfCAInCI = country;
		objCenter = getObjCenter(firstCountryOfCAInCI.object);
	});
	return objCenter;
}
