// countryUtils.ts
import {
	EdgesGeometry,
	LineBasicMaterial,
	LineSegments,
	Material,
	Mesh,
	Object3D,
	Vector3,
} from "three";
import { getColorsArray } from "../scene/sceneManager";

const colorsDict: { [key: string]: number } = {
	unknown: 0,
	found: 3,
	selected: 2,
	error: 1,
	unavailable: 4,
	water: 5,
};

export function createCountryOutline(mesh: Mesh): void {
	if (!mesh.geometry) {
		return;
	}
	const edgesGeometry = new EdgesGeometry(mesh.geometry, 45);
	const edgeMaterial = new LineBasicMaterial({ color: 0x000000 });
	const edgesMesh = new LineSegments(edgesGeometry, edgeMaterial);
	mesh.add(edgesMesh);
}

export function getCountryMovement(obj: Object3D, distance: number): Vector3[] {
	const objPos: Vector3 = obj.position.clone();
	const direction: Vector3 = objPos.clone().normalize();
	const targetPos: Vector3 = objPos
		.clone()
		.addScaledVector(direction, distance);
	return [objPos, targetPos];
}

export function getStateMaterial(state: string): Material {
	return getColorsArray()[colorsDict[state]].clone();
}
