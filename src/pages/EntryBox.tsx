// EntryBox.tsx

import React from 'react';
import '../stylesheet/EntryBox.css'
import '../stylesheet/style.css';
import { handleTextboxChange } from '../components/ThreeScene';

interface EntryBoxProps {
  showEntryPoint: boolean;
}

const EntryBox: React.FC<EntryBoxProps> = ({ showEntryPoint }) => {

  return (
    <div id="entry-box" style={{ display: showEntryPoint ? 'block' : 'none' }}>
      
      <div id="timer">00:00:00</div>
      <label htmlFor="textbox" >Country Name:</label>
      <input type="text" id="textbox" name="textbox" onInput={handleTextboxChange}></input>
    </div>
  );
};
export default EntryBox;
