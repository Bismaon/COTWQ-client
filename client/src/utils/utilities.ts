import * as THREE from "three";
import { getCamera } from "../camera/camera";
import { getScene } from "../scene/sceneSetup";

export function processText(name: string): string {
	name = name
		.toLowerCase()
		.replace(/\(.*?\)/g, "")
		.replace(/\s+/g, "");
	return name;
}

export function getIntersect(
	mouseX: number,
	mouseY: number
): THREE.Intersection[] {
	const raycaster = new THREE.Raycaster();
	const mouseVector = new THREE.Vector2(mouseX, mouseY);
	raycaster.setFromCamera(mouseVector, getCamera());
	//visualizeRay(raycaster)
	return raycaster.intersectObjects(getScene().children, true);
}
function visualizeRay(raycaster: THREE.Raycaster, length: number = 100) {
    const rayDirection = raycaster.ray.direction.clone().normalize().multiplyScalar(length);
    const rayOrigin = raycaster.ray.origin.clone();

    // Create a geometry for the ray
    const geometry = new THREE.BufferGeometry().setFromPoints([rayOrigin, rayOrigin.clone().add(rayDirection)]);

    // Create a line material
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the line
    const line = new THREE.Line(geometry, material);

    // Add the line to the scene
    getScene().add(line);

    // Optionally, remove the line after a short delay
    setTimeout(() => {
        getScene().remove(line);
    }, 2000); // Remove after 2 seconds
}
