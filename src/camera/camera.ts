// camera/camera.ts
import { getHemisphereLight } from "../lighting/hemisphereLight";
import { CameraAnimation } from "../utils/animation";
import { PerspectiveCamera, Vector3 } from "three";

let camera: PerspectiveCamera;
const minDistance: 70 = 70;
const maxDistance: 118 = 118;

/**
 * Sets up the camera with a perspective projection.
 * @param {number} width - The width of the rendering area (usually the canvas).
 * @param {number} height - The height of the rendering area (usually the canvas).
 */
export function setupCamera(width: number, height: number): void {
	const ratio: number = width / height;
	camera = new PerspectiveCamera(75, ratio, 0.1, 1000);
	camera.position.set(0, 0, 118);
}

/**
 * Returns the current camera instance.
 * @returns {PerspectiveCamera} The camera instance.
 */
export function getCamera(): PerspectiveCamera {
	return camera;
}

/**
 * Orients the camera to face towards a specific target position.
 * Also positions the hemisphere light based on the target position.
 * @param {Vector3} targetPosition - The position in the world space where the camera should look at.
 */
export function cameraFaceTo(targetPosition: Vector3): void {
	const cameraPosition: Vector3 = new Vector3();
	camera.getWorldPosition(cameraPosition);

	const directionToCenter: Vector3 = targetPosition.clone().normalize();
	targetPosition = directionToCenter.multiplyScalar(cameraPosition.length());

	getHemisphereLight().position.copy(targetPosition);
	CameraAnimation(cameraPosition, targetPosition, directionToCenter);
}

/**
 * Sets the camera position while ensuring it doesn't go below a minimum distance from the origin.
 * Also positions the hemisphere light based on the camera's new position.
 * @param {Vector3} targetPosition - The new desired position for the camera.
 */
export function setCameraPosition(targetPosition: Vector3): void {
	const distanceToCenter: number = targetPosition.length();

	if (distanceToCenter < minDistance) {
		const directionToCenter: Vector3 = targetPosition.clone().normalize();
		const newCameraPosition: Vector3 =
			directionToCenter.multiplyScalar(minDistance);
		camera.position.copy(newCameraPosition);
	} else if (distanceToCenter > maxDistance) {
		const directionToCenter: Vector3 = targetPosition.clone().normalize();
		const newCameraPosition: Vector3 =
			directionToCenter.multiplyScalar(maxDistance);
		camera.position.copy(newCameraPosition);
	}
	getHemisphereLight().position.copy(targetPosition);
}
