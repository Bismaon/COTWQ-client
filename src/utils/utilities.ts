import { getCamera } from "../camera/camera";
import { getScene } from "../scene/sceneSetup";
import {
	Box3,
	BufferGeometry,
	Color,
	Intersection,
	Line,
	LineBasicMaterial,
	Material,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	Raycaster,
	Vector2,
	Vector3,
} from "three";
import { getWorld } from "../scene/sceneManager";

export function processText(name: string): string {
	name = name
		.toLowerCase()
		.normalize("NFD") // Normalize to NFD form to separate accents
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
		.replace(/\(.*?\)/g, "")
		.replace(/\s+/g, "");
	return name;
}

export function getIntersect(mouseX: number, mouseY: number): Intersection[] {
	const raycaster = new Raycaster();
	const mouseVector = new Vector2(mouseX, mouseY);
	raycaster.setFromCamera(mouseVector, getCamera());
	//visualizeRay(raycaster)
	return raycaster.intersectObjects(getScene().children, true);
}

function visualizeRay(raycaster: Raycaster, length: number = 100) {
	const rayDirection = raycaster.ray.direction
		.clone()
		.normalize()
		.multiplyScalar(length);
	const rayOrigin = raycaster.ray.origin.clone();

	// Create a geometry for the ray
	const geometry = new BufferGeometry().setFromPoints([
		rayOrigin,
		rayOrigin.clone().add(rayDirection),
	]);

	// Create a line material
	const material = new LineBasicMaterial({ color: 0xff0000 });

	// Create the line
	const line = new Line(geometry, material);

	// Add the line to the scene
	getScene().add(line);

	// Optionally, remove the line after a short delay
	setTimeout(() => {
		getScene().remove(line);
	}, 2000); // Remove after 2 seconds
}

export function isMesh(obj: any): obj is Mesh {
	return obj && obj instanceof Mesh;
}

export function changeElementsVisibility(
	elementArray: HTMLElement[],
	visibility: "hidden" | "visible"
): void {
	elementArray.forEach((element: HTMLElement) => {
		element.style.visibility = visibility;
	});
}

export function getObjCenter(obj: Object3D): Vector3 {
	const objBox: Box3 = new Box3().setFromObject(obj);
	const objCenter: Vector3 = new Vector3();
	objBox.getCenter(objCenter);
	return objCenter;
}

export function getGradientColor(percentage: number) {
	let hue = (percentage / 100) * 120;
	return `hsl(${hue}, 100%, 50%)`;
}

export function changeCountryOfCountryAttribute(
	indexCA: number,
	state: string,
	type: string
): void {
	const world = getWorld();
	switch (type) {
		case "currency":
			world.currencyArray[indexCA].locations.forEach((index: number) => {
				world.countryArray[index].state = state;
				world.triggerCountryAnimation(index, state, false);
			});
			break;
		case "language":
			world.languageArray[indexCA].locations.forEach((index: number) => {
				world.countryArray[index].state = state;
				world.triggerCountryAnimation(index, state, false);
			});
			break;
	}
}

// Function to apply gradient color to a material
export function makeMaterialWithGradient(percentage: number): Material {
	// Get the color in HSL and convert it to a THREE.js color
	const colorString = getGradientColor(percentage);
	const color = new Color(colorString);

	// Create a material and set the color
	return new MeshStandardMaterial({
		color: color,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
}
