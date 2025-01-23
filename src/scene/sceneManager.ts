// scene/sceneManager.ts
import { Material, Mesh, Object3D, Vector3 } from "three";
import { World } from "../country/World";
import { loadModel } from "../utils/loader";
import { animate } from "../utils/animation";
import {
	isFollowing,
	isPlaying,
	isRotating,
	toggleIsFollowing,
	toggleIsPlaying,
	toggleIsRotating,
} from "../controls/playingState";
import { cameraFaceTo, getCamera, setCameraPosition } from "../camera/camera";
import { Country } from "../country/Country";
import { isControlsEnabled } from "../controls/controls";
import { getObjCenter, isMesh } from "../utils/utilities";
import { XMLParser } from "fast-xml-parser";
import { createCountryFlagShader } from "../shader/flagShader";
import { createCountryOutline } from "../utils/renderUtils";
import { getStateMaterial } from "../utils/colorUtils";
import { Currency } from "../country/Currency";
import { Language } from "../country/Language";
import { countryLoc } from "../utils/types";

const world: World = new World();
let model: Object3D;
const colorsArray: Material[] = [];

/**
 * Sets up the 3D scene model by loading assets and initializing world data.
 * @returns {Promise<void>} Resolves when the setup is complete.
 */
export async function setupSceneModel(): Promise<void> {
	try {
		const globalScene: Object3D = await loadModel();
		model = globalScene.children[0];
		const water: Object3D = model.children[1];
		const globe: Object3D = model.children[0];

		water.receiveShadow = true;

		world.continents.push(...globe.children);
		const countriesData = await loadCountriesData(
			`${process.env.PUBLIC_URL}/assets/xml/countries_data.xml`
		);
		countriesData.forEach((country: Country, index: number): void => {
			world.countries.set(index, country);
		});
		console.debug("Continents: ", world.continents);
		console.debug("Countries: ", world.countries);
		console.debug("Currencies: ", world.currencies);
		console.debug("Languages: ", world.languages);
		console.debug("Camera coordinates: ", getCamera().position);

		animate(globalScene);
	} catch (error: unknown) {
		console.error("An error occurred while loading the model:", error);
	}
}

/**
 * Resets the model to its default state by clearing the world data and reinitializing camera and controls.
 */
export function resetModel(): void {
	if (isPlaying()) toggleIsPlaying();
	if (!isRotating()) toggleIsRotating();
	if (isFollowing()) toggleIsFollowing();
	isControlsEnabled(isPlaying());
	world.clearFound();
	world.resetCountries(7);
	setCameraPosition(new Vector3(0, 0, 118));
}

/**
 * Configures the model for a specific game mode.
 * @param {boolean} isHard - Whether the game is in hard mode.
 * @param {number} region - The index of the continent for the game.
 * @param {string} gameType - The type of the game (e.g., FLAGS, LANGUAGES).
 */
export function setupModelForGame(
	isHard: boolean,
	region: number,
	gameType: string
): void {
	// Change all countries not in the continent to unavailable color/state
	world.setUpCountries(isHard, region, gameType);
	if (region !== 7) {
		cameraFaceTo(getObjCenter(world.continents[region]));
	}

	if (isRotating()) toggleIsRotating();
}

/**
 * Retrieves the global colors array used for materials.
 * @returns {Material[]} The colors array.
 */
export function getColorsArray(): Material[] {
	return colorsArray;
}

/**
 * Retrieves the global world instance.
 * @returns {World} The global world instance.
 */
export function getWorld(): World {
	return world;
}

/**
 * Retrieves all translated names for a given set of elements in the current language.
 * @param {any} elements - The elements containing names in multiple languages.
 * @param {countryLoc} loc
 * @returns {string[]} An array of translated names.
 */
function getAllForLangLanguage(elements: any, loc: countryLoc): Language[] {
	// const lang: string = getLang();TODO fix language selection for countries
	const container: Language[] = [];
	elements.forEach((element: any): void => {
		if (element.en === "") return;
		const language = new Language(
			element.en.trim(),
			{
				fr: element.fr ? element.fr.trim() : null,
			},
			[element.en.trim()],
			loc
		);
		container.push(language);
	});
	return container;
}
function getAllForLangString(elements: any): string[] {
	const lang: string = getLang();
	const container: string[] = [];
	elements.forEach((element: any): void => {
		if (element.en === "") return;
		if (lang === "en") {
			container.push(element.en);
		} else if (lang === "fr") {
			container.push(element.fr);
		}
	});
	return container;
}

/**
 * Parses raw country data into a Country instance.
 * @param {any} countryData - The raw country data from the XML.
 * @returns {Country} The parsed Country instance.
 * @throws {Error} Throws if the country's object is not a mesh.
 */
function parseCountryData(countryData: any): Country {
	let territories: any = countryData.territories.territory || [];
	let acceptedNames: any = countryData.acceptedNames.name;
	// makes sure territories/languages/acceptedNames are in array form
	if (typeof territories === "string") {
		territories = territories.length === 0 ? null : [territories];
	}

	if (typeof acceptedNames === "object" && !Array.isArray(acceptedNames)) {
		acceptedNames = [acceptedNames];
	}

	const acceptedNamesContainer: string[] = getAllForLangString(acceptedNames);

	territories = territories?.map(
		(loc: string): countryLoc => loc.split(",").map(Number) as countryLoc
	);

	const owner: countryLoc | null = countryData.ownedLocation
		? (countryData.ownedLocation.split(",").map(Number) as countryLoc)
		: null;
	const location: countryLoc = countryData.location
		.split(",")
		.map(Number) as countryLoc;
	const object: Object3D =
		world.continents[location[0]].children[location[1]];
	const obj: Object3D = object.children[0];
	if (!isMesh(obj)) {
		throw new Error(`Country's 3d Objects' child is not a mesh: ${obj}`);
	}
	const meshes = obj as Mesh;

	const SVG: string = countryData.flag.svg;

	const flagMaterial: Material = createCountryFlagShader(SVG);
	const name: string = setLangName(countryData.name);

	// Parse languages
	if (
		typeof countryData.languages.language === "object" &&
		!Array.isArray(countryData.languages.language)
	) {
		countryData.languages.language = [countryData.languages.language];
	}
	const languages: Language[] = getAllForLangLanguage(
		countryData.languages.language,
		location
	);
	languages.forEach((language: Language): void => {
		world.addLanguage(world.languages.size, language);
	});

	let currency: Currency | null = null;
	if (countryData.currency && countryData.currency[0]) {
		currency = new Currency(
			countryData.currency.trim(),
			countryData.currency.trim(),
			location
		);
	}
	if (currency) {
		world.addCurrency(world.currencies.size, currency);
	}

	createCountryOutline(meshes);
	const country: Country = new Country(
		name,
		acceptedNamesContainer,
		territories,
		location,
		owner,
		SVG,
		meshes,
		object,
		flagMaterial,
		countryData.capital,
		languages.length
	);
	country.material = getStateMaterial(country.state);
	return country;
}

/**
 * Loads and parses country data from an XML file.
 * @param {string} url - The URL of the XML file.
 * @returns {Promise<Country[]>} A promise that resolves with an array of Country instances.
 */
async function loadCountriesData(url: string): Promise<Country[]> {
	try {
		// Fetch XML data from URL
		const response: Response = await fetch(url);
		const XMLCountriesData: string = await response.text();

		// Parse XML to JavaScript object
		const parser: XMLParser = new XMLParser();
		const parsedData: any = parser.parse(XMLCountriesData);
		// Map parsed data to instances of the Country class
		return parsedData.countries.country.map((country: any): Country => {
			return parseCountryData(country);
		});
	} catch (error) {
		console.error("Error parsing country data: ", error);
		return [];
	}
}

/**
 * Updates the language for country names and reloads the country data.
 * @param {string} lang - The new language code (e.g., "en", "ffr").
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function changeLanguageForCountry(lang: string): Promise<void> {
	localStorage.setItem("lang", lang);
	world.replaceCountries(
		await loadCountriesData(
			`${process.env.PUBLIC_URL}/assets/xml/countries_data.xml`
		)
	);
}

/**
 * Retrieves the current language code from localStorage or defaults to "en".
 * @returns {string} The current language code.
 */
function getLang(): string {
	return localStorage.getItem("lang") || "en";
}

/**
 * Sets the name of an entity based on the current language.
 * @param {any} name - The object containing names in multiple languages.
 * @returns {any} The name in the current language.
 */
function setLangName(name: any): any {
	const lang: string = getLang();
	switch (lang) {
		case "en":
			return name.en;
		case "fr":
			return name.fr;
	}
}
