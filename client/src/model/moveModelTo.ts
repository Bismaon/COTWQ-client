import * as THREE from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

export function moveModelTo(
	model: THREE.Object3D,
	x: number | null,
	y: number | null,
	z: number | null
): void {
	const targetPosition = {
		x: x !== null ? x : model.position.x,
		y: y !== null ? y : model.position.y,
		z: z !== null ? z : model.position.z,
	};

	new Tween(model.position)
		.to(targetPosition, 1500)
		.easing(Easing.Quadratic.Out)
		.start();
}
