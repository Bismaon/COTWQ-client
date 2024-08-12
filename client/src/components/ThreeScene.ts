// ThreeScene.ts

import * as THREE from "three";
import { Countries } from "../models/Countries";
import { Country } from "../models/Country";
import { createTable, getIndexFromLocation } from "../typescripts/countriesTable";
import { loadModel } from "../utils/loader";
import { setupScene, animate, moveModelTo, getIsPlaying, getIsRotating, toggleIsRotating, setCameraPosition, getIntersect } from "../utils/scene";
import { Timer } from "../utils/Timer";

// Create variables
let allCountriesCaps: THREE.Object3D;
let allCountries: THREE.Object3D;
let modelParent: THREE.Object3D;
let globe: THREE.Object3D;
let isFollowing: boolean = false;
const colorsArray: THREE.Material[] = [];
const colorDict: { [key: string]: number } = {
	unknown: 0,
	found: 1,
	unavailable: 2,
	error: 3,
	selected: 4
};
const countries: Countries = new Countries();
countries.initialize("static/xml/countries_data.xml");

let renderer:THREE.WebGLRenderer;
let scene:THREE.Scene;

export async function setupModel():Promise<void>{
	[renderer, scene] = setupScene(); // Destructure the result of setupScene()
	
	// Load and initialize the model
	await loadAndInitializeModel().then((result) => {
		console.log("Loaded model successfully");
		// Additional actions to execute after successful resolution
	}).catch((error) => {
		console.error("An error occurred:", error); // This will execute if the Promise is rejected
		return;
	});
	

	createTable(countries.getCountriesArray()); // Create table with countries
}

/**
 * Asynchronously loads and initializes the 3D model.
 */
async function loadAndInitializeModel(): Promise<void> {
	try {
		modelParent = await loadModel(scene, colorsArray);
		if (!modelParent) {
			console.error("MODEL ERROR: Model is null or undefined.");
			return;
		}

		animate(renderer, modelParent); // Start animation
		moveModelTo(modelParent, 90, null, null); // Move model to the right side of the screen
		globe = modelParent.children[0];
		
		allCountriesCaps = globe.children[1];
		allCountries = globe.children[0];

		// Set countries to base color
		for (let i = 0; i < countries.getSize(); i++) {
			changeColorTo(countries.getCountriesArray()[i].getCountryLocation()[0], countries.getCountriesArray()[i].getCountryLocation()[1], "unknown");
		}
	} catch (error) {
		console.error("An error occurred while loading the model:", error);
	}
}

/**
 * Handles the mouse up event.
 * @param {MouseEvent} event - The MouseEvent object.
 */
export function handleMouseUp(event: MouseEvent): void {
	if (event.button === 0 && !getIsPlaying() && !getIsRotating()) {
		toggleIsRotating(); // Toggle rotation if not playing and not rotating
	}
}

/**
 * Handles the mouse down event.
 * @param {MouseEvent} event - The MouseEvent object.
 */
export function handleMouseDown(event: MouseEvent): void {
	if (event.button === 0 && getIsPlaying() && getIsRotating()) {
		toggleIsRotating(); // Toggle rotation if playing and rotating
	}
}

/**
 * Handles changes in the textbox input.
 */
export function handleTextboxChange(_event:React.FormEvent<HTMLInputElement>, timer:Timer|null): void {
	const textBox: HTMLInputElement | null = document.getElementById("answer-box-input") as HTMLInputElement;
	const countryCounterDiv:HTMLDivElement|null = document.getElementById("country-counter") as HTMLDivElement;

	if (textBox && timer) {
		const countryName: string = processText(textBox.value);
		const indexCountry: number = countries.exists(countryName);

		if (indexCountry !== -1) {
			const wantedCountry: Country = countries.getCountriesArray()[indexCountry];
			if (foundSearch(wantedCountry, textBox)){
				timer.stop();
			}
			countryCounterDiv.textContent= String(countries.getFound());
		}
	}
}

/**
 * Checks if the wanted country is found, changes its status if not found,
 * updates its color on the globe, and handles related actions like clearing
 * the textbox and setting the camera position.
 * @param {Country} wantedCountry - The country to search for.
 * @param {HTMLInputElement} textBox - The textbox element associated with the search.
 */
function foundSearch(wantedCountry: Country, textBox: HTMLInputElement): boolean {
	if (!wantedCountry.getFound()) {
		const continentIndex: number = wantedCountry.getCountryLocation()[0];
		const countryIndex: number = wantedCountry.getCountryLocation()[1];

		setCountryIsFoundTo(wantedCountry, true); // Mark the country as found
		changeColorTo(continentIndex, countryIndex, "found"); // Change color of the found country
		textBox.value = ""; // Clear the textbox value

		// Get the 3D object representing the found country
		const country: THREE.Object3D = allCountries.children[continentIndex].children[countryIndex];

		const countryPosition: THREE.Vector3 = new THREE.Vector3();
		country.getWorldPosition(countryPosition); // Get the world position of the country

		if (isFollowing) {
			setCameraPosition(countryPosition); // Set camera position to follow the country
		}	
	}

	return countries.isAllFound();
}


/**
 * Sets the found status of the given country and increments the count of found countries.
 * Also sets the found status for all territories associated with the country.
 * @param {Country} wantedCountry - The country to mark as found.
 * @param {boolean} found - The new found status.
 */
function setCountryIsFoundTo(wantedCountry: Country, found: boolean): void {
	wantedCountry.setFound(found); // Set the found status of the main country
	countries.incrementFound(); // Increment the count of found countries

	// Set found status for all territories associated with the country
	wantedCountry.getTerritories().forEach((location: number[]) => {
		if (location !== null) {
			const country: Country = countries.getCountriesArray()[getIndexFromLocation(location[0], location[1])];
			country.setFound(true); // Mark territory as found
		}
	});
}


/**
 * Processes text input to remove unnecessary characters and make it lowercase.
 * @param {string} name - The input text.
 * @returns {string} The processed text.
 */
function processText(name: string): string {
	name = name.toLowerCase();
	const fullname: string[] = name.split(" ");
	name = "";

	for (let i = 0; i < fullname.length; i++) {
		if (fullname[i][0] !== "(") {
			name += fullname[i];
		}
	}

	return name;
}

/**
 * Handles the checkbox click event to enable/disable country following.
 */
export function followCountry(event: React.ChangeEvent<HTMLInputElement>): void{
	const checkbox: HTMLInputElement = event.target;
	isFollowing = checkbox.checked;
  }

/**
 * Handles the mouse move event and intersection with the model.
 * @param {MouseEvent} event - The MouseEvent object.
 */
export function onMouseMove(event: MouseEvent): void {
	const mouseX: number = (event.clientX / window.innerWidth) * 2 - 1;
	const mouseY: number = -(event.clientY / window.innerHeight) * 2 + 1;
	const intersects: THREE.Intersection[] = getIntersect(mouseX, mouseY);

	if (intersects.length > 0) {
		const intersectedObject: THREE.Object3D = intersects[0].object;
		if (isValidObject(intersectedObject)) {
			updateCountryName(intersectedObject);
		} else{
			updateCountryName(null);
		}
	} else {
		updateCountryName(null);
	}
}

/**
 * Checks if the intersected object is valid (not water or continent boundaries).
 * @param {THREE.Object3D} intersectedObject - The intersected object.
 * @returns {boolean} True if the object is valid, false otherwise.
 */
function isValidObject(intersectedObject: THREE.Object3D): boolean {
	if (intersectedObject.name === "water") return false;
	const parentObj: THREE.Object3D | null = intersectedObject.parent;

	if (!parentObj || parentObj.name === intersectedObject.name.slice(0, parentObj.name.length)) return false;

	const continentIndex: number = getIndexFromObject3D(parentObj);
	const countryIndex: number = getIndexFromObject3D(intersectedObject);
	return countries.getCountriesArray()[getIndexFromLocation(continentIndex, countryIndex)].getFound() || !getIsPlaying();
}

/**
 * Updates the country name element if it exists.
 * @param {THREE.Object3D | null} intersectedObject - The intersected object.
 */
function updateCountryName(intersectedObject: THREE.Object3D | null): void {
	const countryNameElement: HTMLElement | null = document.getElementById("country-name-container");
	if (countryNameElement) {
		if (intersectedObject == null || intersectedObject.parent == null) {
			countryNameElement.textContent = "";
		} else {
			const continentIndex: number = getIndexFromObject3D(intersectedObject.parent);
			const countryIndex: number = getIndexFromObject3D(intersectedObject);
			const country: Country = countries.getCountriesArray()[getIndexFromLocation(continentIndex, countryIndex)];
			countryNameElement.textContent = country.getCountryName(); // Display country name
		}
	}
}

/**
 * Changes the color of the selected country on the globe.
 * @param {number} continent - The continent index.
 * @param {number} index - The index of the country.
 * @param {string} colorIndex - The index of the color in the colors array.
 */
function changeColorTo(continent: number, index: number, colorIndex: string): void {
	const materialCloned: THREE.Material = colorsArray[colorDict[colorIndex]].clone();
	const connectedLocations: number[][] = [];

	const indexLoca = getIndexFromLocation(continent, index);
	const country: Country | null = countries.getCountriesArray()[indexLoca];

	if (!country) {
		console.error("ERROR: country is null");
		return;
	}

	const ownerLocation: number[] | null = country.getOwnerLocation();
	if (ownerLocation) {
		const owner: Country = countries.getCountriesArray()[getIndexFromLocation(ownerLocation[0], ownerLocation[1])];
		connectedLocations.push(owner.getCountryLocation(), ...owner.getTerritories());
	} else {
		connectedLocations.push(country.getCountryLocation(), ...country.getTerritories());
	}
	

	for (let i = 0; i < connectedLocations.length; i++) {
		const tempContinentIndex: number = connectedLocations[i][0];
		const tempCountryIndex: number = connectedLocations[i][1];

		const cap: THREE.Object3D = allCountriesCaps.children[tempContinentIndex].children[tempCountryIndex];
		const body: THREE.Object3D = allCountries.children[tempContinentIndex].children[tempCountryIndex];

		if (cap instanceof THREE.Mesh) cap.material = materialCloned;
		if (body instanceof THREE.Mesh) body.material = materialCloned;
	}

	materialCloned.needsUpdate = true;
}

/**
 * Gets the index of the child object within its parent.
 * @param {THREE.Object3D} object - The child object.
 * @returns {number} The index of the child object within its parent.
 */
function getIndexFromObject3D(object: THREE.Object3D): number {
	const parentObj: THREE.Object3D | null = object.parent;
	if (!parentObj) return -1;
	return parentObj.children.findIndex(obj => obj === object);
}