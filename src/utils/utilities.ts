import { getCamera } from '../camera/camera';
import { getScene } from '../scene/sceneSetup';
import { BufferGeometry, Intersection, Line, LineBasicMaterial, Raycaster, Vector2 } from 'three';

/**
 * Processes a string by converting it to lowercase, removing any text within
 * parentheses, and removing all whitespace.
 *
 * @param {string} name - The input string to be processed.
 * @returns {string} The processed string with lowercase characters, no parentheses, and no whitespace.
 */
export function processText(name: string): string {
	name = name
		.toLowerCase()
		.replace(/\(.*?\)/g, "")
		.replace(/\s+/g, "");
	return name;
}

/**
 * Performs a raycast based on the mouse coordinates to determine which objects
 * in the scene are intersected by the ray.
 *
 * @param {number} mouseX - The X coordinate of the mouse position (relative to the canvas).
 * @param {number} mouseY - The Y coordinate of the mouse position (relative to the canvas).
 * @returns {Intersection[]} An array of intersections where the ray intersects objects in the scene.
 */
export function getIntersect(mouseX: number, mouseY: number): Intersection[] {
	const raycaster = new Raycaster();
	const mouseVector = new Vector2(mouseX, mouseY);
	raycaster.setFromCamera(mouseVector, getCamera());
	//visualizeRay(raycaster)
	return raycaster.intersectObjects(getScene().children, true);
}

/**
 * Visualizes the ray from the raycaster as a red line in the scene. The line
 * starts at the ray's origin and extends in the direction of the ray for a specified length.
 *
 * @param {Raycaster} raycaster - The raycaster used to determine the ray's origin and direction.
 * @param {number} [length=100] - The length of the visualization line. Defaults to 100 units.
 */
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
