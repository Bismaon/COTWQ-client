// GameSetter.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

import "../stylesheet/QuizControl.css";
import "../stylesheet/style.css";
import QuizControl from "./QuizControl";
import { followCountry } from "../components/ThreeScene";

const GameSetter: React.FC = () => {
  const navigate = useNavigate();

  console.log("Rendering Game Setter");
  return (
    <>
      <div className="grid-item" id="back">
        <i
          className="fa-solid fa-arrow-left grid-item"
          onClick={() => navigate(-1)}
        ></i>
      </div>
      <QuizControl gameMode={""} />
      <div className="grid-item" id="quiz-options">
        <h2>Game Options - Not ready yet, need to implement game creation</h2>
        <div id="checkbox-container">
          <label htmlFor="follow">Follow countries:</label>
          <input
            type="checkbox"
            id="follow"
            name="follow"
            onChange={followCountry}
          ></input>
        </div>
      </div>
      <div className="grid-item" id="quiz-items">
        <h2>Country Items - Not ready yet, need to implement game creation</h2>
      </div>
      <div className="grid-item" id="empty">
        <h2>Not ready yet, need to implement game creation</h2>
      </div>
    </>
  );
};
export default GameSetter;
