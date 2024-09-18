// scene/sceneSetup.ts
import {
	getHemisphereLight,
	setupHemisphereLight,
} from "../lighting/hemisphereLight";
import { getCamera, setupCamera } from "../camera/camera";
import { initializeControls } from "../controls/controls";
import { mouseHover } from "../controls/mouseInteraction";
import { Scene, WebGLRenderer } from "three";

let renderer: WebGLRenderer;
let scene: Scene;

export function setupScene(): void {
	const canvas: HTMLCanvasElement = document.getElementById(
		"modelCanvas"
	) as HTMLCanvasElement;

	const mainContainer: HTMLDivElement = document.getElementById(
		"main-container"
	) as HTMLDivElement;

	if (!canvas) {
		console.error("Canvas element 'modelCanvas' not found.");
		throw new Error("Canvas element not found");
	}

	const width: number = canvas.offsetWidth;
	const height: number = canvas.offsetHeight;
	console.log("Width: ", width);
	console.log("Height: ", height);

	renderer = new WebGLRenderer({ canvas });
	renderer.setSize(width, height);
	mainContainer.appendChild(renderer.domElement);

	scene = new Scene();
	// Set the background color to any color you prefer, e.g., white
	setupCamera(width, height);
	initializeControls(getCamera(), renderer);

	setupHemisphereLight();
	scene.add(getHemisphereLight());
	canvas.addEventListener("mousemove", mouseHover);
}

export function getRenderer(): WebGLRenderer {
	return renderer;
}

export function getScene(): Scene {
	return scene;
}
