// scene/sceneManager.ts
import { Material, Mesh, Object3D, Vector3 } from "three";
import { Countries } from "../country/Countries";
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
import { changeCountryCellTo } from "../country/countriesTable";
import {
	changeCountryStateTo,
	changeCountryVisibilityTo,
	createCountryOutline,
	getConnected,
	resetCountries,
} from "../utils/countryUtils";
import { isControlsEnabled } from "../controls/controls";
import { getObjCenter, isMesh } from "../utils/utilities";
import { XMLParser } from "fast-xml-parser";

const countries: Countries = new Countries();
let modelParent: Object3D;
let modelScene: Object3D;
let water: Object3D;
const colorsArray: Material[] = [];

export async function setupSceneModel(): Promise<void> {
	try {
		modelParent = await loadModel();
		modelScene = modelParent.children[0];
		water = modelScene.children[1];
		water.receiveShadow = true;
		const globe: Object3D = modelScene.children[0];
		countries.continents = globe.children;
		console.debug(countries.continents);

		countries.countryArray.push(
			...(await loadCountriesData("assets/xml/countries_data.xml"))
		);
		console.log(countries.countryArray);

		animate(modelParent);
	} catch (error: unknown) {
		console.error("An error occurred while loading the model:", error);
	}
}

export function resetModel(): void {
	if (isPlaying()) toggleIsPlaying();
	if (!isRotating()) toggleIsRotating();
	if (isFollowing()) toggleIsFollowing();
	isControlsEnabled(isPlaying());
	countries.clearFound();
	resetCountries();
	setCameraPosition(new Vector3(0, 0, 118));
}

export function setupModelForGame(
	isHard: boolean,
	continentIndex: number
): void {
	// Change all countries not in the continent to unavailable color/state
	countries.countryArray.forEach((country: Country): void => {
		if (country.owner === null) {
			const location: [number, number] = country.location;
			const locations: [number, number][] = getConnected(
				country.location
			);
			if (continentIndex !== -1 && location[0] !== continentIndex) {
				changeCountryStateTo("unavailable", locations);
			} else {
				if (isHard) {
					changeCountryVisibilityTo(false, locations);
				}
				changeCountryStateTo("unknown", locations);
			}
			changeCountryCellTo("invisible", location);
		}
	});
	if (continentIndex !== -1) {
		const continentObj: Object3D = countries.continents[continentIndex];
		cameraFaceTo(getObjCenter(continentObj));
	}

	if (isRotating()) toggleIsRotating();
}

export function getColorsArray(): Material[] {
	return colorsArray;
}

export function getCountries(): Countries {
	return countries;
}

async function loadCountriesData(url: string): Promise<Country[]> {
	try {
		// Fetch XML data from URL
		const response: Response = await fetch(url);
		const xmlData: string = await response.text();

		// Parse XML to JavaScript object
		const parser: XMLParser = new XMLParser();
		const parsedData: any = parser.parse(xmlData);

		// Map parsed data to instances of the Country class
		return parsedData.countries.country.map((country: any): Country => {
			let territories = country.territories?.territory;
			let languages = country.languages?.language;
			let acceptedNames = country.acceptedNames?.name;
			// makes sure territories/languages/acceptedNames are in array form
			if (typeof territories === "string") {
				territories = [territories];
			}
			if (typeof languages === "string") {
				languages = [languages];
			}
			if (typeof acceptedNames === "string") {
				acceptedNames = [acceptedNames];
			}

			territories = territories?.map(
				(loc: string) => loc.split(",").map(Number) as [number, number]
			);

			const owner: [number, number] | null = country.ownedLocation
				? (country.ownedLocation.split(",")
				.map(Number) as [number, number]) : null;
			const location: [number, number] = country.location
				.split(",")
				.map(Number) as [number, number];
			const object: Object3D =
				countries.continents[location[0]].children[location[1]];
			const obj: Object3D = object.children[0];
			if (!isMesh(obj)) {
				throw new Error("Obj is not a mesh");
			}
			const meshes = obj as Mesh;
			createCountryOutline(meshes);

			const countryInstance: Country = new Country(
				country.name,
				acceptedNames,
				territories,
				location,
				owner,
				[country.flag.png, country.flag.svg],
				country.currency || null,
				country.capital || null,
				languages,
				meshes,
				object
			);

			// makes sure the material is set and updated
			countryInstance.state = "unknown";
			return countryInstance;
		});
	} catch (error) {
		console.error("Error parsing country data: ", error);
		return [];
	}
}
