// CountryInfo.tsx

import React from 'react';
import '../stylesheet/style.css';
import '../stylesheet/CountryInfo.css';
import { followCountry } from '../components/ThreeScene';

const CountryInfo: React.FC = () => {
	return (
        <>
            <div id="country-container">
                <div id="checkbox-container">
                    <label htmlFor="follow">Follow countries:</label>
                    <input type="checkbox" id="follow" name="follow" onChange={followCountry}></input>
                </div>
                <div id="country-name-container">
                </div>
            </div>
            <div id="country-continent-name-container"></div>
        </>
	)};
export default CountryInfo;