// scene/animate.ts
import * as THREE from "three";
import { update as tweenUpdate } from "@tweenjs/tween.js";
import { getCamera, setCameraPosition } from "../camera/camera";
import { getIsRotating } from "../controls/playingState";
import { getScene } from "./sceneSetup";
import { update } from "../controls/controls";

export function animate(
	renderer: THREE.WebGLRenderer,
	model: THREE.Object3D
): void {
	let lastRenderTime: number = 0;

	function _animate(currentTime: number): void {
		if (getIsRotating()) {
			model.rotation.y += 0.0005;
		}

		const cameraPosition: THREE.Vector3 = new THREE.Vector3();
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
