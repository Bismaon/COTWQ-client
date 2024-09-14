// contexts/ModelContext.tsx
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { loadingManager } from "../utils/loader";
import { setupScene } from "../scene/sceneSetup";
import { setupSceneModel } from "../scene/sceneManager";

interface ModelContextType {
	isModelLoaded: boolean;
	setIsModelLoaded: (loaded: boolean) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const isSetupModelCalled: React.MutableRefObject<boolean> = useRef(false);
	const [isModelLoaded, setIsModelLoaded] = useState(false);

	useEffect((): void => {
		if (isSetupModelCalled.current) return;
		setupScene();
		loadingManager.onLoad = (): void => {
			console.debug("Model has been loaded successfully");
		};
		setupSceneModel()
			.then((): void => {
				console.debug("Scene has been set up successfully");
				setIsModelLoaded(true);
			})
			.catch((error: any): void => {
				console.error(error);
			});
		isSetupModelCalled.current = true;
	}, [setIsModelLoaded]);

	return (
		<ModelContext.Provider value={{ isModelLoaded, setIsModelLoaded }}>
			{children}
		</ModelContext.Provider>
	);
};

export const useModel = () => {
	const context = useContext(ModelContext);
	if (context === undefined) {
		throw new Error("useModel must be used within a ModelProvider");
	}
	return context;
};
