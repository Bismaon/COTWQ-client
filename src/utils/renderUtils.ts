import {
	EdgesGeometry,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	Object3D,
	Vector3,
} from "three";

/**
 * Creates an outline for a country mesh using its geometry.
 * Adds a black edge outline to the given mesh.
 * @param {Mesh} mesh - The 3D mesh of the country.
 */
export function createCountryOutline(mesh: Mesh): void {
	if (!mesh.geometry) {
		return;
	}
	const edgesGeometry = new EdgesGeometry(mesh.geometry, 45);
	const edgeMaterial = new LineBasicMaterial({ color: 0x000000 });
	const edgesMesh = new LineSegments(edgesGeometry, edgeMaterial);
	mesh.add(edgesMesh);
}

/**
 * Calculates the current position and target position for a country's movement.
 * The target position is determined by moving the object along its normalized direction vector.
 * @param {Object3D} obj - The 3D object representing the country.
 * @param {number} distance - The distance to move the object.
 * @returns {Vector3[]} An array containing the object's current position and target position.
 */
export function getCountryMovement(obj: Object3D, distance: number): Vector3[] {
	const objPos: Vector3 = obj.position.clone();
	const direction: Vector3 = objPos.clone().normalize();
	const targetPos: Vector3 = objPos
		.clone()
		.addScaledVector(direction, distance);
	return [objPos, targetPos];
}
