// CountryInfo.tsx

import React from 'react';
import '../stylesheet/style.css';
import '../stylesheet/CountryInfo.css';
import { followCountry } from '../components/ThreeScene';
const CountryInfo: React.FC<{ showEntryPoint: boolean }> = ({ showEntryPoint }) => (
		<><div id="country-container" style={{ display: showEntryPoint ? 'flex' : 'none' }}>
        <div id="checkbox-container">
            <label htmlFor="follow">Follow countries:</label>
            <input type="checkbox" id="follow" name="follow" onChange={followCountry}></input>
        </div>
        <div id="country-name-container">
            <h2 id="country-name">
            </h2>
        </div>
    </div><div id="country-continent-name-container"></div></>
	);
export default CountryInfo;