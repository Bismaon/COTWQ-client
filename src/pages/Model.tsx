// pages/Model.tsx

import React, { useEffect, useRef, useState } from "react";
import "../stylesheet/style.css";
import "../stylesheet/Model.css";
import { setupSceneModel } from "../scene/sceneManager";
import { getScene, setupScene } from "../scene/sceneSetup";
import { loadingManager } from "../utils/loader";

function Model(): React.JSX.Element {
	const isSetupModelCalled: React.MutableRefObject<boolean> = useRef(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect((): void => {
		if (!isSetupModelCalled.current) {
			setupScene();
			// Update progress based on loading manager
			loadingManager.onProgress = (
				item: string,
				loaded: number,
				total: number
			): void => {
				setLoadingProgress((loaded / total) * 100);
			};

			// When the loading is complete
			loadingManager.onLoad = (): void => {
				setIsLoaded(true);
			};

			setupSceneModel(getScene())
				.then((): void => {
					console.debug("Scene has been set up successfully");
				})
				.catch((error: any): void => {
					console.error(error);
				});

			isSetupModelCalled.current = true;
		}
	}, []);

	return (
		<>
			{!isLoaded && (
				<div className="grid-item" id="loading-screen">
					<div className="progress-bar-container">
						<div
							className="progress-bar"
							style={{ width: `${loadingProgress}%` }}
						>
							{Math.round(loadingProgress)}%
						</div>
					</div>
				</div>
			)}
			<canvas
				className="grid-item"
				id="modelCanvas"
				style={{ visibility: isLoaded ? "visible" : "hidden" }}
			></canvas>
		</>
	);
}

export default Model;
