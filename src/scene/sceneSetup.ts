// scene/sceneSetup.ts
import {
	getHemisphereLight,
	setupHemisphereLight,
} from "../lighting/hemisphereLight";
import { getCamera, setupCamera } from "../camera/camera";
import { initializeControls } from "../controls/controls";
import {
	handleMouseDown,
	handleMouseUp,
	onMouseMove,
} from "../controls/mouseInteraction";
import { Scene, WebGLRenderer } from "three";

let renderer: WebGLRenderer;
let scene: Scene;

/**
 * Sets up the Three.js scene, including the canvas, renderer, camera, controls, and lighting.
 * Initializes event listeners for mouse interactions and configures the rendering environment.
 *
 * @throws {Error} Throws an error if the canvas element with the ID 'modelCanvas' is not found.
 */
export function setupScene(): void {
	const canvas: HTMLCanvasElement = document.getElementById(
		"modelCanvas"
	) as HTMLCanvasElement;

	// Attach event listeners
	canvas.addEventListener("mousedown", handleMouseDown);
	canvas.addEventListener("mouseup", handleMouseUp);
	canvas.addEventListener("mousemove", onMouseMove);
	const mainContainer: HTMLDivElement = document.getElementById(
		"main-container"
	) as HTMLDivElement;

	if (!canvas) {
		console.error("Canvas element 'modelCanvas' not found.");
		throw new Error("Canvas element not found");
	}

	const width: number = canvas.offsetWidth;
	const height: number = canvas.offsetHeight;

	renderer = new WebGLRenderer({ canvas });
	renderer.setSize(width, height);
	mainContainer.appendChild(renderer.domElement);

	scene = new Scene();
	// Set the background color to any color you prefer, e.g., white
	setupCamera(width, height);
	initializeControls(getCamera(), renderer);

	setupHemisphereLight();
	scene.add(getHemisphereLight());
}

/**
 * Retrieves the WebGL renderer used in the scene setup.
 *
 * @returns {WebGLRenderer} The WebGLRenderer instance used for rendering the scene.
 */
export function getRenderer(): WebGLRenderer {
	return renderer;
}

/**
 * Retrieves the Three.js scene object.
 *
 * @returns {Scene} The Scene instance used in the application.
 */
export function getScene(): Scene {
	return scene;
}
