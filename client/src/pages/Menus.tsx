// Menus.tsx

import React, { useState } from 'react';
import './Menus.css';
import '../style.css';
import EntryBox from './EntryBox';
import CountryInfo from './CountryInfo';

const Menus: React.FC = () => {
  const [menu, setMenu] = useState<string>('main');
  const [showEntryPoint, setShowEntryPoint] = useState<boolean>(false);

  function startGame(gamemode:string){
	setShowEntryPoint(true);


	const title: HTMLElement | null = document.getElementById("title");
	if (title) title.style.display = "none" ;
	// TODO implement gamemode selection
  }


  const renderMenu = () => {
    switch (menu) {
      case 'main':
        return <MainMenu setMenu={setMenu} />;
      case 'games':
		if (!showEntryPoint){
			return <GamesMenu startGame={startGame}/>;
		} else{
			return ; //No menu
		}

      default:
        return <MainMenu setMenu={setMenu} />;
    }
  };

  return (
	<>
		<EntryBox showEntryPoint={showEntryPoint} />
		<div id="menu-container">
		  	{renderMenu()}
	  	</div>
	  	<CountryInfo showEntryPoint={showEntryPoint}/>
	</>

  );
};




const MainMenu: React.FC<{ setMenu: (menu: string) => void }> = ({ setMenu }) => (
	<div className="main-buttons" id="controls-main">
	  <button className="button" onClick={() => setMenu('games')}>Games</button>
	  <button className="button">High Scores</button>
	  <button className="button">Settings</button>
	  <button className="button">Profile</button>
	</div>
);

const GamesMenu: React.FC<{ startGame: (gamemode:string) =>void}>= ({startGame}) => (
	<div className="main-buttons" id="controls-game">
	  <button className="button" onClick={()=>startGame('classic')}>Classic country of the world quiz</button>
	  <button className="button">Flag Attribution</button>
	  <button className="button">No map but fills</button>
	  <button className="button">Sequential</button>
	  <button className="button">Continents</button>
	</div>
  );

export default Menus;
