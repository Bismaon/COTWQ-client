// loader.ts

import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * Loads a 3D model and adds it to the scene.
 * @param {THREE.Scene} scene - The THREE.Scene where the model will be added.
 * @param {THREE.Material[]} colors - An array of materials representing colors.
 * @returns {Promise<THREE.Object3D>} A promise that resolves to the loaded model.
 */
export function loadModel(
	scene: THREE.Scene,
	colors: THREE.Material[]
): Promise<THREE.Object3D> {
	return new Promise((resolve, reject): void => {
		const loader: GLTFLoader = new GLTFLoader();
		loader.load(
			"../../assets/models/earth_political.glb",
			function (gltf: GLTF): void {
				console.log(gltf);
				const myModel: THREE.Object3D = gltf.scene;

				// Rotate the model (earth tilt)
				const degrees: number = 23.5;
				myModel.rotation.x = THREE.MathUtils.degToRad(degrees);

				scene.add(myModel);
				extractColors(myModel, colors);
				console.debug(colors);
				resolve(myModel); // Resolve the promise with the loaded model
			},
			undefined,
			function (error): void {
				console.error("Error loading GLTF model:", error);
				reject(error); // Reject the promise with the error
			}
		);
	});
}

/**
 * Extracts colors from the loaded model and adds them to the colors array.
 * @param {THREE.Object3D} model - The loaded 3D model.
 * @param {THREE.Material[]} colors - An array of materials representing colors.
 */
function extractColors(model: THREE.Object3D, colors: THREE.Material[]): void {
	model.traverse((child: THREE.Object3D) => {
		if (child instanceof THREE.Mesh && child.material) {
			child.receiveShadow = true;
			const material: THREE.Material = child.material;
			const materialName: string = material.name;
			if (colors.findIndex((obj) => obj.name === materialName) === -1) {
				colors.push(material.clone());
			}
		}
	});
}
