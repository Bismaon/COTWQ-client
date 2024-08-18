// Model.tsx
import { useEffect, useRef } from "react";
import "../stylesheet/style.css";
import "../stylesheet/Model.css";
import { setupSceneModel } from "../scene/sceneManager";
import { getScene, setupScene } from "../scene/sceneSetup";

function Model() {
	const isSetupModelCalled = useRef(false);

	useEffect(() => {
		if (!isSetupModelCalled.current) {
			setupScene();
			setupSceneModel(getScene());
			isSetupModelCalled.current = true;
		}
	}, []);

	return <canvas className="grid-item" id="modelCanvas"></canvas>;
}

export default Model;
