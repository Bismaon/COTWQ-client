import * as THREE from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import { getCamera } from "../camera/camera";

export function tweenCameraPosition(
	startPosition: THREE.Vector3,
	targetPosition: THREE.Vector3,
	lookAtVector: THREE.Vector3,
	duration: number = 1000
): void {
	new Tween(startPosition)
		.to(targetPosition, duration)
		.easing(Easing.Linear.In)
		.onUpdate(() => {
			const camera = getCamera();
			camera.position.copy(startPosition);
			camera.lookAt(lookAtVector);
		})
		.start();
}
