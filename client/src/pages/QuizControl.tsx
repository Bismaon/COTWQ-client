import React, { useEffect, useState } from "react";
import "../stylesheet/QuizControl.css";
import "../stylesheet/style.css";
import { handleTextboxChange } from "../components/ThreeScene";
import { Timer } from "../utils/Timer";

const QuizControl: React.FC<{ gameMode: string }> = ({ gameMode }) => {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [gameTimer, setGameTimer] = useState<Timer | null>(null);

  useEffect(() => {
    const timer = new Timer();
    setGameTimer(timer);

    // Clean up the timer when the component unmounts
    return () => {
      timer.stop();
    };
  }, []);

  useEffect(() => {
    if (gameTimer) {
      if (isQuizStarted) {
        gameTimer.start();
      } else {
        gameTimer.stop();
      }
    }
  }, [isQuizStarted, gameTimer]);

  const handleStart = () => {
    setIsQuizStarted(true);
    const answerContainer: HTMLElement | null = document.getElementById(
      "answer-box-container"
    );
    if (answerContainer) answerContainer.style.display = "block";
    else {
      console.error("No answer box container found.");
    }
    const timerCell: HTMLElement | null = document.getElementById("timer-cell");
    if (timerCell) timerCell.style.display = "flex";
    else {
      console.error("No timer cell found.");
    }
  };

  const handlePause = () => {
    setIsQuizStarted(false);
    const answerContainer: HTMLElement | null = document.getElementById(
      "answer-box-container"
    );
    if (answerContainer) answerContainer.style.display = "none";
    else {
      console.error("No answer box container found.");
    }
    const timerCell: HTMLElement | null = document.getElementById("timer-cell");
    if (timerCell) timerCell.style.display = "none";
    else {
      console.error("No timer cell found.");
    }
  };

  return (
    <div className="grid-item" id="quiz-controls">
      <div className="quiz-grid-container" id="quiz-controls-table">
        <div className="quiz-grid-item" id="timer">
          00:00:00
        </div>
        <button className="quiz-grid-item button" id="give-up-btn">
          Give Up
        </button>
        {!isQuizStarted ? (
          <button
            className="quiz-grid-item button"
            id="quiz-stop-start"
            onClick={handleStart}
          >
            Start
          </button>
        ) : (
          <button
            className="quiz-grid-item button"
            id="quiz-stop-start"
            onClick={handlePause}
          >
            Pause
          </button>
        )}
        <div className="quiz-grid-item" id="answer-box-container">
          <label id="answer-box-prompt" htmlFor="textbox">
            Enter Country's Name:
          </label>
          <input
            type="text"
            id="answer-box-input"
            name="textbox"
            onInput={(event) => handleTextboxChange(event, gameTimer)}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
        <div className="quiz-grid-item" id="country-counter">
          0&nbsp;/&nbsp;191 guessed
        </div>
      </div>
    </div>
  );
};

export default QuizControl;
