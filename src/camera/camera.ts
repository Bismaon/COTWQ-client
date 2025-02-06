// camera/camera.ts
import { getHemisphereLight } from "../lighting/hemisphereLight";
import { CameraAnimation } from "../utils/animation";
import { PerspectiveCamera, Vector3 } from "three";

let camera: PerspectiveCamera;
const minDistance: 70 = 70;
const maxDistance: 118 = 118;

export function setupCamera(width: number, height: number): void {
	const ratio: number = width / height;
	camera = new PerspectiveCamera(75, ratio, 0.1, 1000);
	camera.position.set(0, 0, 118);
}

export function getCamera(): PerspectiveCamera {
	return camera;
}

export function cameraFaceTo(targetPosition: Vector3): void {
	const cameraPosition: Vector3 = new Vector3();
	camera.getWorldPosition(cameraPosition);

	const directionToCenter: Vector3 = targetPosition.clone().normalize();
	targetPosition = directionToCenter.multiplyScalar(cameraPosition.length());

	getHemisphereLight().position.copy(targetPosition);
	CameraAnimation(cameraPosition, targetPosition, directionToCenter);
}

export function setCameraPosition(targetPosition: Vector3): void {
	const distToCenter: number = targetPosition.length();
	const dirToCenter: Vector3 = targetPosition.clone().normalize();
	let newCameraPosition: Vector3 = targetPosition;
	if (distToCenter < minDistance) {
		newCameraPosition = dirToCenter.multiplyScalar(minDistance);
	} else if (distToCenter > maxDistance) {
		newCameraPosition = dirToCenter.multiplyScalar(maxDistance);
	}
	camera.position.copy(newCameraPosition);
	getHemisphereLight().position.copy(targetPosition);
}
