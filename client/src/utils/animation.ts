// utils/animation.ts
import * as THREE from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import { getCamera } from "../camera/camera";

export function CameraAnimation(
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
export function bounceAnimation(
	objBody: THREE.Object3D,
	objCap: THREE.Object3D,
	originalPosition: THREE.Vector3,
	targetPosition: THREE.Vector3,
	callback?: () => void,
	duration: number = 1000
): void {
	new Tween(objCap.position)
		.to(targetPosition, duration / 2)
		.easing(Easing.Cubic.Out)
		.onUpdate(() => {
			// The object position is directly updated by the Tween
			objBody.position.copy(objCap.position);
			objCap.position.copy(objCap.position);
		})
		.onComplete(() => {
			// If there's a callback, invoke it after the first half of the animation
			setTimeout(() => {
				if (callback) callback();
				new Tween(objCap.position)
					.to(originalPosition, duration / 2)
					.easing(Easing.Bounce.Out)
					.onUpdate(() => {
						// The object position is directly updated by the Tween
						objBody.position.copy(objCap.position);
						objCap.position.copy(objCap.position);
					})
					.start();
			}, 250);
			// Start the downward movement
		})
		.start();
}
