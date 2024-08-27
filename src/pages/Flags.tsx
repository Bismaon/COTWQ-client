import React from "react";
import "../stylesheet/style.css";
import "../stylesheet/Quiz.css";

const Flags: React.FC<{
	isHard: boolean;
	continentIndex: number;
	isClassic: boolean;
}> = ({ isHard, continentIndex, isClassic }) => {
	return (
		<div className="grid-item" id="quiz-controls">
			<div className="quiz-grid-container" id="quiz-controls-table">
				<h2>Flags Game Mode</h2>
			</div>
		</div>
	);
};

export default Flags;
