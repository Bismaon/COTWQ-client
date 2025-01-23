import { Material } from "three";
import { getColorsArray } from "../scene/sceneManager";
import { colorsDict } from "./constants";

/**
 * Retrieves the material associated with a given country state.
 * The material is cloned from the global color array based on the state's color mapping.
 * @param {string} state - The state of the country (e.g., FOUND, SELECTED).
 * @returns {Material} The material corresponding to the state.
 */
export function getStateMaterial(state: string): Material {
	return getColorsArray()[colorsDict[state]].clone();
}
