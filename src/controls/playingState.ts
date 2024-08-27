// controls/playingState.ts
import { updateControls } from "./controls";

let playing: boolean = false;
let rotating: boolean = true;
let follow: boolean = false;

/**
 * Toggles the playing state of the user.
 * When toggled, it updates the `playing` flag and reflects this change
 * in the controls by calling `updateControls`.
 */
export function toggleIsPlaying(): void {
	playing = !playing;
	updateControls(playing);
}

/**
 * Toggles the rotating state of the model.
 * This function changes the `rotating` flag between true and false.
 */
export function toggleIsRotating(): void {
	rotating = !rotating;
}

/**
 * Returns the current playing state of the user.
 *
 * @returns {boolean} - The current state of whether the user is playing.
 */
export function isPlaying(): boolean {
	return playing;
}

/**
 * Returns the current rotating state of the model.
 *
 * @returns {boolean} - The current state of whether the model is rotating.
 */
export function isRotating(): boolean {
	return rotating;
}

/**
 * Checks if the camera is set to follow a country.
 *
 * @returns {boolean} - Returns true if the follow mode is enabled, otherwise false.
 */
export function isFollowing(): boolean {
	return follow;
}

export function toggleIsFollowing(): void {
	follow = !follow;
}
