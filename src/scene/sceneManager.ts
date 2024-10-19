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
import { cameraFaceTo, setCameraPosition } from "../camera/camera";
import { Country } from "../country/Country";
import { createCountryOutline, getStateMaterial } from "../utils/countryUtils";
import { isControlsEnabled } from "../controls/controls";
import { getObjCenter, isMesh } from "../utils/utilities";
import { XMLParser } from "fast-xml-parser";
import { createCountryFlagShader } from "../shader/flagShader";

const world: World = new World();
let model: Object3D;
const colorsArray: Material[] = [];

export async function setupSceneModel(): Promise<void> {
	try {
		const globalScene: Object3D = await loadModel();
		model = globalScene.children[0];
		const water: Object3D = model.children[1];
		const globe: Object3D = model.children[0];

		water.receiveShadow = true;

		world.continents.push(...globe.children);
		world.countryArray.push(
			...(await loadCountriesData(
				`${process.env.PUBLIC_URL}/assets/xml/countries_data.xml`
			))
		);
		console.debug("Continents: ", world.continents);
		console.debug("Countries: ", world.countryArray);
		console.debug("Currencies: ", world.currencyArray);
		console.debug("Languages: ", world.languageArray);

		animate(globalScene);
	} catch (error: unknown) {
		console.error("An error occurred while loading the model:", error);
	}
}

export function resetModel(): void {
	if (isPlaying()) toggleIsPlaying();
	if (!isRotating()) toggleIsRotating();
	if (isFollowing()) toggleIsFollowing();
	isControlsEnabled(isPlaying());
	world.clearFound();
	world.resetCountries(-1);
	setCameraPosition(new Vector3(0, 0, 118));
}

export function setupModelForGame(
	isHard: boolean,
	continentIndex: number,
	gameType: string
): void {
	// Change all countries not in the continent to unavailable color/state
	world.setUpCountries(isHard, continentIndex, gameType);
	if (continentIndex !== -1) {
		const continentObj: Object3D = world.continents[continentIndex];
		cameraFaceTo(getObjCenter(continentObj));
	}

	if (isRotating()) toggleIsRotating();
}

export function getColorsArray(): Material[] {
	return colorsArray;
}

export function getWorld(): World {
	return world;
}

function getAllForLang(elements: any): string[] {
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

function parseCountryData(countryData: any): Country {
	let territories: any = countryData.territories.territory;
	let languages: any = countryData.languages.language;
	let acceptedNames: any = countryData.acceptedNames.name;
	// makes sure territories/languages/acceptedNames are in array form
	if (typeof territories === "string") {
		territories = territories.length === 0 ? null : [territories];
	}

	if (!Array.isArray(languages) && typeof languages === "object") {
		languages = [languages];
	}

	const languagesContainer: string[] = getAllForLang(languages);

	if (typeof acceptedNames === "object" && !Array.isArray(acceptedNames)) {
		acceptedNames = [acceptedNames];
	}

	const acceptedNamesContainer: string[] = getAllForLang(acceptedNames);

	territories = territories?.map(
		(loc: string): [number, number] =>
			loc.split(",").map(Number) as [number, number]
	);

	const owner: [number, number] | null = countryData.ownedLocation
		? (countryData.ownedLocation.split(",").map(Number) as [number, number])
		: null;
	const location: [number, number] = countryData.location
		.split(",")
		.map(Number) as [number, number];
	const object: Object3D =
		world.continents[location[0]].children[location[1]];
	const obj: Object3D = object.children[0];
	if (!isMesh(obj)) {
		throw new Error("Obj is not a mesh");
	}
	const meshes = obj as Mesh;

	const SVG: string = countryData.flag.svg;

	const flagMaterial: Material = createCountryFlagShader(SVG);
	const name: string = setLangName(countryData.name);
	const currency: any = countryData.currency;
	const country: Country = new Country(
		name,
		acceptedNamesContainer,
		territories,
		location,
		owner,
		SVG,
		currency,
		countryData.capital,
		languagesContainer,
		meshes,
		object,
		flagMaterial
	);
	world.addMissingCountryAttributeSingle(
		"currency",
		currency,
		location,
		owner !== null
	);
	world.addMissingCountryAttributeLong(
		"language",
		languagesContainer,
		location,
		owner !== null
	);

	createCountryOutline(meshes);
	country.material = getStateMaterial(country.state);
	return country;
}

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

export async function changeLanguageForCountry(lang: string): Promise<void> {
	localStorage.setItem("lang", lang);
	world.replaceCountries(
		await loadCountriesData(
			`${process.env.PUBLIC_URL}/assets/xml/countries_data.xml`
		)
	);
}

function getLang(): string {
	return localStorage.getItem("lang") || "en";
}

function setLangName(name: any): any {
	const lang: string = getLang();
	switch (lang) {
		case "en":
			return name.en;
		case "fr":
			return name.fr;
	}
}
