// controls/playingState.ts
import { updateControls } from "./controls";

let isPlaying: boolean = false;
let isRotating: boolean = true;

/**
 * Toggles the playing state of the user.
 * When toggled, it updates the `isPlaying` flag and reflects this change
 * in the controls by calling `updateControls`.
 */
export function toggleIsPlaying(): void {
	isPlaying = !isPlaying;
	updateControls(isPlaying);
}

/**
 * Toggles the rotating state of the model.
 * This function changes the `isRotating` flag between true and false.
 */
export function toggleIsRotating(): void {
	isRotating = !isRotating;
}

/**
 * Returns the current playing state of the user.
 *
 * @returns {boolean} - The current state of whether the user is playing.
 */
export function getIsPlaying(): boolean {
	return isPlaying;
}

/**
 * Returns the current rotating state of the model.
 *
 * @returns {boolean} - The current state of whether the model is rotating.
 */
export function getIsRotating(): boolean {
	return isRotating;
}
