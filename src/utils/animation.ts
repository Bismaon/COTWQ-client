// utils/animation.ts
import { Easing, Tween } from '@tweenjs/tween.js';
import { getCamera } from '../camera/camera';
import { Object3D, PerspectiveCamera, Vector3 } from 'three';

/**
 * Animates the camera's position from a start position to a target position,
 * and makes the camera look at a specified vector.
 *
 * @param {Vector3} startPosition - The initial position of the camera.
 * @param {Vector3} targetPosition - The target position of the camera.
 * @param {Vector3} lookAtVector - The vector that the camera should look at.
 * @param {number} [duration=1000] - The duration of the animation in milliseconds.
 */
export function CameraAnimation(
	startPosition: Vector3,
	targetPosition: Vector3,
	lookAtVector: Vector3,
	duration: number = 1000
): void {
	new Tween(startPosition)
		.to(targetPosition, duration)
		.easing(Easing.Linear.In)
		.onUpdate((): void => {
			const camera: PerspectiveCamera = getCamera();
			camera.position.copy(startPosition);
			camera.lookAt(lookAtVector);
		})
		.start();
}

/**
 * Creates a bouncing animation for an object, moving it between an original
 * position and a target position.
 *
 * The animation is split into two phases:
 * 1. Moving from the original position to the target position with a cubic ease-out.
 * 2. Bouncing back from the target position to the original position with a bounce ease-out.
 *
 * @param {Object3D} obj - The object to animate.
 * @param {Vector3} orgPos - The original position of the object.
 * @param {Vector3} targetPos - The target position of the object.
 * @param {() => void} [callback] - Optional callback function to be called after the bounce-in phase completes.
 * @param {number} [duration=1000] - The total duration of the animation in milliseconds.
 */
export function bounceAnimation(
	obj: Object3D,
	orgPos: Vector3,
	targetPos: Vector3,
	callback?: () => void,
	duration: number = 1000
): void {
	const halfDuration: number = duration / 2;

	new Tween({ t: 0 })
		.to({ t: 1 }, halfDuration)
		.easing(Easing.Cubic.Out)
		.onUpdate(({ t }): void => {
			obj.position.lerpVectors(orgPos, targetPos, t);
		})
		.onComplete((): void => {
			setTimeout((): void => {
				if (callback) callback();
				new Tween({ t: 0 })
					.to({ t: 1 }, halfDuration)
					.easing(Easing.Bounce.Out)
					.onUpdate(({ t }): void => {
						obj.position.lerpVectors(targetPos, orgPos, t);
					})
					.start();
			}, 250);
		})
		.start();
}
