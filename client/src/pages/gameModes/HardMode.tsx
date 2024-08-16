import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../../stylesheet/Menus.css";
import "../../stylesheet/style.css";

const HardMode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isInHardMenu = location.pathname.endsWith("/hard");

  const handleNavigate = (mode: string) => {
    navigate(`${location.pathname}/${mode}`);
  };

  console.log("Rendering Hard Mode Menu");
  return (
    <>
      {/* Render initial Games Menu only if not in a game mode */}
      {isInHardMenu && (
        <>
          <div className="grid-item" id="title">
            <h1>Countries Of The World Quizzes</h1>
          </div>
          <div className="grid-item" id="back">
            <i
              className="fa-solid fa-arrow-left grid-item"
              onClick={() => navigate(-1)}
            ></i>
          </div>
          <div className="grid-item" id="menu">
            <button
              className="button"
              onClick={() => handleNavigate("classic")}
            >
              Classic
            </button>
            <button
              className="button"
              onClick={() => handleNavigate("sequential-random")}
            >
              Sequential Random
            </button>
          </div>
        </>
      )}

      {!isInHardMenu && <Outlet />}
    </>
  );
};

export default HardMode;
