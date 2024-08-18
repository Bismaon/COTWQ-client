import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let controls: OrbitControls;

export function initializeControls(
	camera: THREE.PerspectiveCamera,
	renderer: THREE.WebGLRenderer
) {
	controls = new OrbitControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.zoomSpeed = 0.5;
	controls.panSpeed = 0.5;
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.enabled=false; 
}

export function updateControls(isPlaying: boolean): void {
	controls.enabled = isPlaying;
}

export function update():void{
	controls.update();
}