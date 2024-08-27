// loader.ts

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Material, MathUtils, Mesh, MeshPhongMaterial, MeshStandardMaterial, Object3D, Scene } from "three";
import { isMesh } from "./utilities";

/**
 * Loads a 3D model and adds it to the scene.
 * @param {Scene} scene - The Scene where the model will be added.
 * @param {Material[]} colors - An array of materials representing colors.
 * @returns {Promise<Object3D>} A promise that resolves to the loaded model.
 */
export function loadModel(scene: Scene, colors: Material[]): Promise<Object3D> {
	return new Promise((resolve, reject): void => {
		const loader: GLTFLoader = new GLTFLoader();
		loader.load(
			"assets/models/earth_political_nocap_worldset.glb",
			function (gltf: GLTF): void {
				const model: Object3D = gltf.scene;

				// Rotate the model (earth tilt)
				const degrees: number = 23.5;
				model.rotation.x = MathUtils.degToRad(degrees);

				scene.add(model);
				extractColors(model, colors);
				resolve(model); // Resolve the promise with the loaded model
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
 * @param {Object3D} model - The loaded 3D model.
 * @param {Material[]} colors - An array of materials representing colors.
 */
function extractColors(model: Object3D, colors: Material[]): void {
	model.traverse((child: Object3D): void => {
		if (isMesh(child) && child.material) {
			const childMesh: Mesh = child as Mesh;

			childMesh.castShadow = true;

			// Clone the material
			const material: Material = (childMesh.material as Material).clone();

			// Add polygonOffset settings to the material
			if (
				material instanceof MeshStandardMaterial ||
				material instanceof MeshPhongMaterial
			) {
				material.polygonOffset = true;
				material.polygonOffsetFactor = 1; // Adjust this value as needed
				material.polygonOffsetUnits = 1; // Adjust this value as needed
			}

			// Check if the material is already in the colors array
			const materialName: string = material.name;
			if (
				colors.findIndex(
					(obj: Material): boolean => obj.name === materialName
				) === -1
			) {
				colors.push(material);
			}
		}
	});
	console.debug(colors);
}
