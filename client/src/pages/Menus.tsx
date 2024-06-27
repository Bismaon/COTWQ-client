//Menus.tsx

import React, { useState } from 'react';
import '../stylesheet/Menus.css';
import '../stylesheet/style.css';
import LoginForm from '../components/LoginForm';
import UserInformation from '../components/UserInformation';
import QuizControl from './QuizControl';
import { toggleIsPlaying } from '../utils/scene';

const Menus: React.FC = () => {
  const [menu, setMenu] = useState<string>('main');
  const [gameMode, setGameMode] = useState<string | null>(null); // State to manage game mode
  const [userID, setUserID] = useState<number | null>(null);

  function startGame(gamemode: string) {
    console.log("startGame called with gamemode:", gamemode);
    console.log("userID:", userID); //WORKS 
    setGameMode(gamemode);
    toggleIsPlaying();
    const title: HTMLElement | null = document.getElementById('title');
    if (title) title.style.display = 'none';
  }

  function renderMenu() {
    switch (menu) {
      case 'main':
        return <MainMenu setMenu={setMenu} />;
      case 'games':
        return <GamesMenu startGame={startGame} setMenu={setMenu} />;
      case 'profile':
        return <ProfileMenu setMenu={setMenu} setUserID={setUserID} userID={userID} />;
      default:
        return <MainMenu setMenu={setMenu} />;
    }
  }

  console.log("Rendering Menus component with gameMode:", gameMode);

  return  (<>{gameMode
            ? (<QuizControl gameMode={gameMode}/>)
            : (<div id="menu-container">
                {renderMenu()}
              </div>)}</>);
};

const MainMenu: React.FC<{ setMenu: (menu: string) => void }> = ({ setMenu }) => {
  console.log("Rendering MainMenu");
  return (
    <div className="main-buttons" id="main-menu">
      <button className="button" onClick={() => setMenu('games')}>Games</button>
      <button className="button">High Scores</button>
      <button className="button">Settings</button>
      <button className="button" onClick={() => setMenu('profile')}>Profile</button>
    </div>
  );
};

const GamesMenu: React.FC<{ startGame: (gamemode: string) => void, setMenu: (menu: string) => void }> = ({ startGame, setMenu }) => {
  console.log("Rendering GamesMenu");
  return (
    <div className="main-buttons" id="games-menu">
      <button className="button" onClick={() => setMenu('main')}>Back</button>
      <button className="button" onClick={() => startGame('classic')}>Classic country of the world quiz</button>
      <button className="button">Flag Attribution</button>
      <button className="button">No map but fills</button>
      <button className="button">Sequential</button>
      <button className="button">Continents</button>
    </div>
  );
};

const ProfileMenu: React.FC<{ setMenu: (menu: string) => void, setUserID: (userID: number) => void, userID: number | null }> = ({ setMenu, setUserID, userID }) => {
  console.log("Rendering ProfileMenu");
  return (
    <>
      <div className="main-buttons" id="profile-menu">
        <button className="button" onClick={() => setMenu('main')}>
          Back
        </button>
        <button className="button">Edit</button>
      </div>
      <div id="profile-box" className='transparent-box'>
        {userID ? (<UserInformation userID={userID} />)
          : (<LoginForm setUserID={setUserID} />)}
      </div>
    </>
  );
};

export default Menus;
