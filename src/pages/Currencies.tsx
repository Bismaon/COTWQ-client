import React from "react";
import "../stylesheet/Quiz.css";
import "../stylesheet/style.css";

const Currencies: React.FC<{
	isHard: boolean;
	continentIndex: number;
	isClassic: boolean;
}> = ({ isHard, continentIndex, isClassic }) => {
	return (
		<div className="grid-item" id="quiz-controls">
			<div className="quiz-grid-container" id="quiz-controls-table">
				<h2>Currencies Game Mode</h2>
			</div>
		</div>
	);
};

export default Currencies;
