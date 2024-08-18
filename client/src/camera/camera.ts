import * as THREE from "three";
import { getHemisphereLight } from "../lighting/hemisphereLight";
import { tweenCameraPosition } from "../utils/tween";

let camera: THREE.PerspectiveCamera;
const minDistance = 70;

export function setupCamera(width: number, height: number) {
	camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	camera.position.set(0, 0, 140);
}

export function getCamera(): THREE.PerspectiveCamera {
	return camera;
}

export function cameraFaceTo(targetPosition: THREE.Vector3): void {
	const cameraPosition: THREE.Vector3 = new THREE.Vector3();
	camera.getWorldPosition(cameraPosition);

	const directionToCenter: THREE.Vector3 = targetPosition
		.clone()
		.normalize();
	targetPosition = directionToCenter.multiplyScalar(cameraPosition.length());
	
	getHemisphereLight().position.copy(targetPosition);
	tweenCameraPosition(cameraPosition, targetPosition, directionToCenter);
}

export function setCameraPosition(targetPosition: THREE.Vector3): void {
	const distanceToCenter: number = targetPosition.length();

	if (distanceToCenter < minDistance) {
		const directionToCenter: THREE.Vector3 = targetPosition
			.clone()
			.normalize();
		const newCameraPosition: THREE.Vector3 =
			directionToCenter.multiplyScalar(minDistance);
		camera.position.copy(newCameraPosition);
	}
	getHemisphereLight().position.copy(targetPosition);
}
