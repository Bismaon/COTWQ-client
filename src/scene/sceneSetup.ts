// scene/sceneSetup.ts
import * as THREE from "three";
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

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;

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

	renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(width, height);
	mainContainer.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	setupCamera(width, height);
	initializeControls(getCamera(), renderer);

	setupHemisphereLight();
	scene.add(getHemisphereLight());
}

export function getRenderer(): THREE.WebGLRenderer {
	return renderer;
}

export function getScene(): THREE.Scene {
	return scene;
}
