// controls/controls.ts
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PerspectiveCamera, WebGLRenderer } from "three";

let controls: OrbitControls;

/**
 * Initializes the OrbitControls for a given camera and renderer.
 * This function sets up the controls with custom rotation, zoom, and pan speeds.
 * It also enables damping and disables panning by default.
 *
 * @param {PerspectiveCamera} camera - The camera to be controlled.
 * @param {WebGLRenderer} renderer - The renderer whose DOM element will be used for the controls.
 */
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

/**
 * Updates the enabled state of the controls based on the `state` flag.
 * If `state` is true, controls are enabled; otherwise, they are disabled.
 *
 * @param {boolean} state - A flag indicating whether the controls should be enabled.
 */
export function isControlsEnabled(state: boolean): void {
	controls.enabled = state;
}

/**
 * Updates the controls. This method should be called in the animation loop
 * to apply damping and other effects if enabled.
 */
export function updateControls(): void {
	controls.update();
}
