import * as THREE from "three";

let hemisphereLight: THREE.HemisphereLight;
export function setupHemisphereLight() {
	hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.7);
}

export function getHemisphereLight() {
	return hemisphereLight;
}
