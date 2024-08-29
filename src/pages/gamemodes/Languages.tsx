import React from "react";

const Languages: React.FC<{
	isHard: boolean;
	continentIndex: number;
	isClassic: boolean;
}> = ({ isHard, continentIndex, isClassic }) => {
	return (
		<div className="grid-item" id="quiz-controls">
			<div className="quiz-grid-container" id="quiz-controls-table">
				<h2>Languages Game Mode</h2>
			</div>
		</div>
	);
};

export default Languages;
