// lightning/hemisphereLight.ts
import { HemisphereLight } from "three";

let hemisphereLight: HemisphereLight;

export function setupHemisphereLight(): void {
	hemisphereLight = new HemisphereLight();
}

export function getHemisphereLight(): HemisphereLight {
	return hemisphereLight;
}
