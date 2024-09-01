	// pages/Model.tsx

	import React, { useState } from "react";
	import "../stylesheet/style.css";
	import "../stylesheet/Model.css";
	import { loadingManager } from "../utils/loader";
	import { useModel } from "./ModelContext";

	function Model(): React.JSX.Element {
		const [loadingProgress, setLoadingProgress] = useState(0);
		const { isModelLoaded } = useModel();

		loadingManager.onProgress = (
			item: string,
			loaded: number,
			total: number
		): void => {
			setLoadingProgress((loaded / total) * 100);
		};

		return (
			<>
				{!isModelLoaded && (
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
					style={{ visibility: isModelLoaded ? "visible" : "hidden" }}
				></canvas>
			</>
		);
	}

	export default Model;
