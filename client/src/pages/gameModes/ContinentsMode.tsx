import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../../stylesheet/Menus.css";
import "../../stylesheet/style.css";

const ContinentsMode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isInContinentsMenu = location.pathname.endsWith("/continents");

  const handleNavigate = (mode: string) => {
    navigate(`${location.pathname}/${mode}`);
  };

  console.log("Rendering Continents Mode Menu");
  return (
    <>
      {/* Render initial Games Menu only if not in a game mode */}
      {isInContinentsMenu && (
        <>
          <div className="grid-item" id="title">
            <h1>Countries Of The World Quizzes</h1>
          </div>
          <div className="grid-item" id="menu">
            <button className="button" onClick={() => navigate(-1)}>
              Back
            </button>
            <button className="button" onClick={() => handleNavigate("africa")}>
              Africa
            </button>
            <button
              className="button"
              onClick={() => handleNavigate("america")}
            >
              America
            </button>
            <button className="button" onClick={() => handleNavigate("asia")}>
              Asia
            </button>
            <button className="button" onClick={() => handleNavigate("europe")}>
              Europe
            </button>
            <button className="button" onClick={() => handleNavigate("asia")}>
              Oceania
            </button>
          </div>
        </>
      )}

      {!isInContinentsMenu && <Outlet />}
    </>
  );
};
export default ContinentsMode;
