import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../../stylesheet/Menus.css";
import "../../stylesheet/style.css";

const SizeMode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isInSizeMode =
    location.pathname.endsWith("/normal") ||
    location.pathname.endsWith("/africa") ||
    location.pathname.endsWith("/asia") ||
    location.pathname.endsWith("/europe") ||
    location.pathname.endsWith("/america");

  console.log("Rendering Group Selection");
  return (
    <>
      {/* Render initial Games Menu only if not in a game mode */}
      {isInSizeMode && (
        <>
          <div className="grid-item" id="title">
            <h1>Countries Of The World Quizzes</h1>
          </div>
          <div className="grid-item" id="menu">
            <button className="button" onClick={() => navigate(-1)}>
              Back
            </button>
            <button className="button" onClick={() => navigate("classic")}>
              Classic
            </button>
            <button
              className="button"
              onClick={() => navigate("sequential-random")}
            >
              Sequential Random
            </button>
            <button className="button" onClick={() => navigate("hard")}>
              Hard
            </button>
          </div>
        </>
      )}

      {!isInSizeMode && <Outlet />}
    </>
  );
};

export default SizeMode;
