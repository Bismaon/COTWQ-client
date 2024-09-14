import { Easing, Group, Tween } from "@tweenjs/tween.js";
import { getCamera, setCameraPosition } from "../camera/camera";
import { Object3D, PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { isRotating } from "../controls/playingState";
import { getRenderer, getScene } from "../scene/sceneSetup";
import { updateControls } from "../controls/controls";

const group: Group = new Group(); // Contains the current tween updates

export function animate(model: Object3D): void {
	let lastRenderTime: number = 0;
	const renderer: WebGLRenderer = getRenderer();
	function _animate(currentTime: number): void {
		if (isRotating()) {
			model.rotation.y += 0.0005;
		}

		const cameraPosition: Vector3 = new Vector3();
		getCamera().getWorldPosition(cameraPosition);
		setCameraPosition(cameraPosition);

		if (currentTime - lastRenderTime >= 16) {
			renderer.render(getScene(), getCamera());
			lastRenderTime = currentTime;
		}

		group.update();

		updateControls();
		requestAnimationFrame(_animate);
	}

	_animate(0);
}

export function CameraAnimation(
	startPosition: Vector3,
	targetPosition: Vector3,
	lookAtVector: Vector3,
	duration: number = 1000
): void {
	const tweenCam: Tween = new Tween(startPosition)
		.to(targetPosition, duration)
		.easing(Easing.Linear.In)
		.onUpdate((): void => {
			const camera: PerspectiveCamera = getCamera();
			camera.position.copy(startPosition);
			camera.lookAt(lookAtVector);
		})
		.onComplete((): void => {
			group.remove(tweenCam);
		});
	group.add(tweenCam.start());
}

export function bounceAnimation(
	obj: Object3D,
	orgPos: Vector3,
	targetPos: Vector3,
	callback?: () => void,
	duration: number = 1000
): void {
	const halfDuration: number = duration / 2;

	const tweenUp: Tween = new Tween({ t: 0 })
		.to({ t: 1 }, halfDuration)
		.easing(Easing.Cubic.Out)
		.onUpdate(({ t }): void => {
			obj.position.lerpVectors(orgPos, targetPos, t);
		})
		.onComplete((): void => {
			setTimeout((): void => {
				if (callback) callback();
				group.add(tweenDown.start());
			}, 250);
			group.remove(tweenUp);
		});
	const tweenDown: Tween = new Tween({ t: 0 })
		.to({ t: 1 }, halfDuration)
		.easing(Easing.Bounce.Out)
		.onUpdate(({ t }): void => {
			obj.position.lerpVectors(targetPos, orgPos, t);
		})
		.onComplete((): void => {
			group.remove(tweenDown);
		});
	group.add(tweenUp.start());
}
