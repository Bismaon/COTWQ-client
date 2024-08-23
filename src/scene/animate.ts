// scene/animate.ts
import { update as tweenUpdate } from '@tweenjs/tween.js';
import { getCamera, setCameraPosition } from '../camera/camera';
import { getIsRotating } from '../controls/playingState';
import { getScene } from './sceneSetup';
import { update } from '../controls/controls';
import { Object3D, Vector3, WebGLRenderer } from 'three';

/**
 * Main animation loop function that updates the scene and renders it.
 *
 * @param {WebGLRenderer} renderer - The renderer used to render the scene.
 * @param {Object3D} model - The 3D model to be animated.
 */
export function animate(renderer: WebGLRenderer, model: Object3D): void {
	let lastRenderTime: number = 0;

	/**
	 * Internal animation function that performs updates and rendering.
	 *
	 * @param {number} currentTime - The current time in milliseconds since the start of the animation.
	 */
	function _animate(currentTime: number): void {
		if (getIsRotating()) {
			model.rotation.y += 0.0005;
		}

		const cameraPosition: Vector3 = new Vector3();
		getCamera().getWorldPosition(cameraPosition);
		setCameraPosition(cameraPosition);

		if (currentTime - lastRenderTime >= 16) {
			renderer.render(getScene(), getCamera());
			lastRenderTime = currentTime;
		}

		requestAnimationFrame(_animate);
		tweenUpdate();
		update();
	}

	_animate(0);
}
