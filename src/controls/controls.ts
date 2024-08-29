// controls/controls.ts
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PerspectiveCamera, WebGLRenderer } from "three";

let controls: OrbitControls;

export function initializeControls(
	camera: PerspectiveCamera,
	renderer: WebGLRenderer
): void {
	controls = new OrbitControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.zoomSpeed = 0.5;
	controls.panSpeed = 0.5;
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.enabled = false;
}

export function isControlsEnabled(state: boolean): void {
	controls.enabled = state;
}

export function updateControls(): void {
	controls.update();
}
