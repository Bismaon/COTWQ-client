import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../stylesheet/QuizControl.css';
import '../stylesheet/style.css';
import { handleTextboxChange } from '../components/ThreeScene';
import CountryInfo from './CountryInfo';
import { Timer } from '../utils/Timer';

const QuizControl: React.FC<{ gameMode: string }> = ({ gameMode }) => {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [gameTimer, setGameTimer] = useState<Timer | null>(null);
  const [container] = useState(() => document.createElement('div'));
  
  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

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
    const answerContainer: HTMLElement | null = document.getElementById("answer-box-container");
    if (answerContainer) answerContainer.style.display="block";
    else {
      console.error("No answer box container found.")
    }
    const timerCell: HTMLElement | null = document.getElementById("timer-cell");
    if (timerCell) timerCell.style.display="flex";
    else {
      console.error("No timer cell found.")
    }
  };

  const handlePause = () => {
    setIsQuizStarted(false);
    const answerContainer: HTMLElement | null = document.getElementById("answer-box-container");
    if (answerContainer) answerContainer.style.display="none";
    else {
      console.error("No answer box container found.")
    }
    const timerCell: HTMLElement | null = document.getElementById("timer-cell");
    if (timerCell) timerCell.style.display="none";
    else {
      console.error("No timer cell found.")
    }
  };

  return ReactDOM.createPortal(
    <div id="quiz-controls">
      <div id="quiz-controls-table">
        <div id='timer-cell'>
          <div id="timer">00:00:00</div>
          <button className="button" id="give-up-btn">Give Up</button>
        </div>
        <div className='quiz-actions'>
          {!isQuizStarted ? (
            <button className="button" id="start-btn" onClick={handleStart}>Start</button>
          ) : (
            <button className="button" id="pause-btn" onClick={handlePause}>Pause</button>
          )}
        </div>
        <div id='answer-box-container'>
          <label id="answer-box-text" htmlFor="textbox">Enter Country's Name&nbsp;:&nbsp;</label>
          <input
            type="text"
            id="answer-box-input"
            name="textbox"
            onInput={(event) => handleTextboxChange(event, gameTimer)}
            autoComplete="off"
            autoCorrect="off"
          />
          <div id="guessed-line">
            <div id="country-counter">0</div><div>&nbsp;/&nbsp;191 guessed</div>
          </div>
        </div>
      </div>
      
      <CountryInfo />
    </div>,
    container
  );
};

export default QuizControl;
