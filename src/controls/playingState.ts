// controls/playingState.ts

let playing: boolean = false;
let rotating: boolean = true;
let follow: boolean = false;

export function toggleIsPlaying(): void {
	playing = !playing;
}

export function toggleIsRotating(): void {
	rotating = !rotating;
}

export function isPlaying(): boolean {
	return playing;
}

export function isRotating(): boolean {
	return rotating;
}

export function isFollowing(): boolean {
	return follow;
}

export function toggleIsFollowing(): void {
	follow = !follow;
}
