import { getCamera } from "../camera/camera";
import { getScene } from "../scene/sceneSetup";
import {
	Box3,
	BufferGeometry,
	Intersection,
	Line,
	LineBasicMaterial,
	Mesh,
	Object3D,
	Raycaster,
	Vector2,
	Vector3,
} from "three";

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
