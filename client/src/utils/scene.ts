// scene.ts

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Tween, Easing, update } from '@tweenjs/tween.js';
// Define variables
let isRotating: boolean = true;
let isPlaying: boolean = false;
let myModel: THREE.Object3D;
let lastRenderTime: number = 0;
const minDistance: number = 70;
let controls: OrbitControls;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let hemisphereLight: THREE.HemisphereLight;

/**
 * Sets up the scene by creating a renderer, scene, camera, controls, and
 * directional light.
 * @returns An array containing the renderer and scene.
 */
export function setupScene(): [THREE.WebGLRenderer, THREE.Scene] {
	// Get a reference to the canvas element
	const canvas: HTMLCanvasElement = document.getElementById("modelCanvas") as HTMLCanvasElement;

	// Ensure the canvas element exists
	if (!canvas) {
		console.error("Canvas element 'modelCanvas' not found.");
		// Handle the error or provide a fallback
	}

	// Create a WebGL renderer and set its size to match the canvas
	const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
	document.body.appendChild(renderer.domElement);

	// Create the scene
	scene = new THREE.Scene();

	// Create the camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 0, 140);

	// Create the controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.zoomSpeed = 0.5;
	controls.panSpeed = 0.5;
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.enabled = isPlaying;

	// Add directional light
	hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.7);
	scene.add(hemisphereLight);

	return [renderer, scene];
}

/**
 * Animates the scene.
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer.
 * @param {THREE.Object3D} model - The 3D object representing the model.
 */
export function animate(renderer: THREE.WebGLRenderer, model: THREE.Object3D): void {
	myModel = model;

	function _animate(currentTime: number): void {
		const delta: number = currentTime - lastRenderTime;
		const cameraPosition: THREE.Vector3 = new THREE.Vector3();
		camera.getWorldPosition(cameraPosition);
		const distanceToCenter: number = cameraPosition.length();

		
		if (isRotating) {
			myModel.rotation.y += 0.0005;
		}

		if (distanceToCenter < minDistance) {
			const directionToCenter: THREE.Vector3 = cameraPosition.clone().normalize();
			const newCameraPosition: THREE.Vector3 = directionToCenter.multiplyScalar(minDistance);
			camera.position.copy(newCameraPosition);
		}

		hemisphereLight.position.copy(cameraPosition);

		if (delta >= 16) {
			controls.update();
			renderer.render(scene, camera);
			lastRenderTime = currentTime;
		}

		requestAnimationFrame(_animate);
		update();
	}

	_animate(0);
}

/**
 * Updates the state of controls based on the `isPlaying` flag.
 */
function updateControls(): void {
	controls.enabled = isPlaying;
}

/**
 * Toggles the `isPlaying` flag.
 */
export function toggleIsPlaying(): void {
	isPlaying = !isPlaying;
	if (isPlaying) {
		moveModelTo(myModel, 0, null, null);
		if (isRotating) toggleIsRotating();
	} else {
		moveModelTo(myModel, 90, null, null);
		if (!isRotating) toggleIsRotating();

	}

	updateControls(); // Call updateControls to ensure controls are updated
}

/**
 * Toggles the `isRotating` flag.
 */
export function toggleIsRotating(): void {
	isRotating = !isRotating;
}

/**
 * Gets intersections of a raycaster with objects in the scene based on mouse coordinates.
 * @param {number} mouseX - The X coordinate of the mouse.
 * @param {number} mouseY - The Y coordinate of the mouse.
 * @returns {THREE.Intersection[]} An array of intersections.
 */
export function getIntersect(mouseX: number, mouseY: number): THREE.Intersection[] {
	// Create a raycaster
	const raycaster: THREE.Raycaster = new THREE.Raycaster();

	// Set raycaster origin as mouse position in NDC using Vector2
	const mouseVector: THREE.Vector2 = new THREE.Vector2(mouseX, mouseY);
	raycaster.setFromCamera(mouseVector, camera);

	// Perform raycasting
	return raycaster.intersectObjects(scene.children, true);
}

/**
 * Moves the model to the specified position.
 * @param {THREE.Object3D} model - The 3D object representing the model.
 * @param {number | null} x - The X coordinate of the new position.
 * @param {number | null} y - The Y coordinate of the new position.
 * @param {number | null} z - The Z coordinate of the new position.
 */
export function moveModelTo(model: THREE.Object3D, x: number | null, y: number | null, z: number | null): void {
	const targetPosition = {
		x: x !== null ? x : model.position.x,
		y: y !== null ? y : model.position.y,
		z: z !== null ? z : model.position.z,
	  };
	
	new Tween(model.position)
	.to(targetPosition, 1500)
	.easing(Easing.Quadratic.Out)
	.start();
}

/**
 * Sets the camera position to the specified vector.
 * @param {THREE.Vector3} vector - The new camera position.
 */
export function setCameraPosition(vector: THREE.Vector3): void {
	const cameraPosition: THREE.Vector3 = new THREE.Vector3();
	camera.getWorldPosition(cameraPosition);
	const directionToCenter: THREE.Vector3 = vector.clone().normalize();
	const newCameraPosition: THREE.Vector3 = directionToCenter.multiplyScalar(cameraPosition.length());
	// camera.position.copy(newCameraPosition);
	new Tween(cameraPosition)
    .to(newCameraPosition, 1000)
    .easing(Easing.Linear.In)
    .onUpdate(() => {
      camera.position.copy(cameraPosition);
      camera.lookAt(directionToCenter);
    })
    .start();
}

/**
 * Returns the value of the `isPlaying` flag.
 * @returns {boolean} The value of the `isPlaying` flag.
 */
export function getIsPlaying(): boolean {
	return isPlaying;
}

/**
 * Returns the value of the `isRotating` flag.
 * @returns {boolean} The value of the `isRotating` flag.
 */
export function getIsRotating(): boolean {
	return isRotating;
}
