import {
	ClampToEdgeWrapping,
	DoubleSide,
	LinearFilter,
	LinearMipMapLinearFilter,
	Material,
	MeshBasicMaterial,
	RepeatWrapping,
	Texture,
	TextureLoader,
} from "three";

export function createCountryFlagShader(svgURL: string): Material {
	const textureLoader = new TextureLoader();
	const baseURL = `${process.env.PUBLIC_URL}/assets/svg/flags/`;
	const texture: Texture = textureLoader.load(baseURL + svgURL);
	// Flip the texture on the Y-axis
	texture.wrapT = RepeatWrapping;
	texture.wrapS = ClampToEdgeWrapping;
	texture.repeat.y = -1;

	// Enable mipmaps
	texture.generateMipmaps = true;

	// Set the filtering for minification (when the texture is viewed from far away)
	texture.minFilter = LinearMipMapLinearFilter; // Uses linear interpolation on mipmaps
	texture.magFilter = LinearFilter; // For magnification, use linear filtering

	return new MeshBasicMaterial({
		map: texture,
		side: DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
}
