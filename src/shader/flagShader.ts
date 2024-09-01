import {
	DoubleSide,
	Material,
	MeshBasicMaterial,
	RepeatWrapping,
	TextureLoader,
} from "three";

export function createCountryFlagShader(svgURL: string): Material {
	const textureLoader = new TextureLoader();
	const baseURL = `${process.env.PUBLIC_URL}/assets/svg/flags/`;
	const texture = textureLoader.load(baseURL + svgURL);

	// Flip the texture on the Y-axis
	texture.wrapT = RepeatWrapping;
	texture.repeat.y = -1;
	return new MeshBasicMaterial({
		map: texture,
		side: DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
}
