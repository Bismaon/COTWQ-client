// lightning/hemisphereLight.ts
import * as THREE from "three";

let hemisphereLight: THREE.HemisphereLight;
export function setupHemisphereLight():void {
	hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.7);
}

export function getHemisphereLight():THREE.HemisphereLight {
	return hemisphereLight;
}
