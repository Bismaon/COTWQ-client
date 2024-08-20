// camera/camera.ts
import * as THREE from "three";
import { getHemisphereLight } from "../lighting/hemisphereLight";
import { CameraAnimation } from "../utils/animation";

let camera: THREE.PerspectiveCamera;
const minDistance = 70;

export function setupCamera(width: number, height: number) {
	const ratio: number = width / height;
	camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 1000);
	camera.position.set(0, 0, 140);
}

export function getCamera(): THREE.PerspectiveCamera {
	return camera;
}

export function cameraFaceTo(targetPosition: THREE.Vector3): void {
	const cameraPosition: THREE.Vector3 = new THREE.Vector3();
	camera.getWorldPosition(cameraPosition);

	const directionToCenter: THREE.Vector3 = targetPosition.clone().normalize();
	targetPosition = directionToCenter.multiplyScalar(cameraPosition.length());

	getHemisphereLight().position.copy(targetPosition);
	CameraAnimation(cameraPosition, targetPosition, directionToCenter);
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
