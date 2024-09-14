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
	world.resetCountries();
	setCameraPosition(new Vector3(0, 0, 118));
}

export function setupModelForGame(
	isHard: boolean,
	continentIndex: number
): void {
	// Change all countries not in the continent to unavailable color/state
	world.setUpCountries(isHard, continentIndex);
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

function parseCountryData(countryData: any): Country {
	const lang: string = localStorage.getItem("lang") || "en";
	let territories = countryData.territories.territory;
	let languages = countryData.languages.language;
	let languagesContainer: any = [];
	let acceptedNamesContainer: any = [];
	let acceptedNames = countryData.acceptedNames.name;
	// makes sure territories/languages/acceptedNames are in array form
	if (typeof territories === "string") {
		territories = territories.length === 0 ? null : [territories];
	}

	if (!Array.isArray(languages) && typeof languages === "object") {
		languages = [languages];
	}

	languages.forEach((language: any) => {
		if (lang === "en") {
			languagesContainer.push(language.en);
		} else if (lang === "fr") {
			languagesContainer.push(language.fr);
		}
	});

	if (typeof acceptedNames === "object" && !Array.isArray(acceptedNames)) {
		acceptedNames = [acceptedNames];
	}

	acceptedNames.forEach((name: any) => {
		if (name.en === "") return;
		if (lang === "en") {
			acceptedNamesContainer.push(name.en);
		} else if (lang === "fr") {
			acceptedNamesContainer.push(name.fr);
		}
	});

	territories = territories?.map(
		(loc: string) => loc.split(",").map(Number) as [number, number]
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
	const country: Country = new Country(
		countryData.name,
		acceptedNamesContainer,
		territories,
		location,
		owner,
		SVG,
		countryData.currency || null,
		countryData.capital || null,
		languagesContainer,
		meshes,
		object,
		flagMaterial
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

export async function changeLanguageForCountry(): Promise<void> {
	const lang: string = localStorage.getItem("lang") || "en";
	world.replaceCountries(
		await loadCountriesData(
			`${process.env.PUBLIC_URL}/assets/xml/countries_data.xml`
		)
	);
}
