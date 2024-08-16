//Menus.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "../stylesheet/Menus.css";
import "../stylesheet/style.css";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  console.log("Rendering Main Menu");
  return (
    <>
      <div className="grid-item" id="title">
        <h1>Countries Of The World Quizzes</h1>
      </div>
      <div className="grid-item" id="menu">
        <button className="button" onClick={() => navigate("games")}>
          Games
        </button>
        <button className="button" onClick={() => navigate("high-scores")}>
          High Scores
        </button>
        <button className="button" onClick={() => navigate("settings")}>
          Settings
        </button>
        <button className="button" onClick={() => navigate("profile")}>
          Profile
        </button>
      </div>
    </>
  );
};

export default MainMenu;
