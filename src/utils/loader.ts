// utils/loader.ts

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
	LoadingManager,
	Material,
	MathUtils,
	MeshStandardMaterial,
	Object3D,
} from "three";
import { isMesh } from "./utilities";
import { getScene } from "../scene/sceneSetup";
import { getColorsArray } from "../scene/sceneManager";

export const loadingManager = new LoadingManager();

export function loadModel(): Promise<Object3D> {
	return new Promise((resolve, reject): void => {
		const loader: GLTFLoader = new GLTFLoader(loadingManager);
		loader.load(
			`${process.env.PUBLIC_URL}/assets/models/earth_political_UV_WIP.glb`,
			function (gltf: GLTF): void {
				const model: Object3D = gltf.scene;

				// Rotate the model (earth tilt)
				const degrees: number = 23.5;
				model.rotation.x = MathUtils.degToRad(degrees);

				getScene().add(model);
				extractColors(model);
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

function extractColors(model: Object3D): void {
	const colors: Material[] = getColorsArray();
	model.traverse((child: Object3D): void => {
		if (!isMesh(child)) {
			return;
		}
		child.castShadow = true;
		const material: Material = (child.material as Material).clone();
		if (isInColors(colors, material)) {
			return;
		}
		if (material instanceof MeshStandardMaterial) {
			material.polygonOffset = true;
			material.polygonOffsetFactor = 1;
			material.polygonOffsetUnits = 1;
		}
		material.needsUpdate = true;
		colors.push(material);
	});
	console.log("Colors: ", colors)
}

function isInColors(colors: Material[], material: Material): boolean {
	return (
		colors.findIndex(
			(obj: Material): boolean => obj.name === material.name
		) !== -1
	);
}
