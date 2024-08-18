import { updateControls } from "./controls";

let isPlaying: boolean = false;
let isRotating: boolean = true;

export function toggleIsPlaying(): void {
	isPlaying = !isPlaying;
	updateControls(isPlaying);
}

export function toggleIsRotating(): void {
	isRotating = !isRotating;
}

export function getIsPlaying(): boolean {
	return isPlaying;
}

export function getIsRotating(): boolean {
	return isRotating;
}
