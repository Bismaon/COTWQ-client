import { NavigateFunction, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import React from "react";
import { changeLanguageForCountry } from "../scene/sceneManager";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	console.debug("Rendering Settings.tsx");
	const { t, i18n } = useTranslation();

	function handleLanguageChange(event: any): void {
		const language = event.target.value;
		localStorage.setItem("lang", language);
		i18n.changeLanguage(language).then(() => {
			console.debug("Lang changed for site done");
		});
		changeLanguageForCountry().then(() => {
			console.debug("Lang changed for countries done");
		});
		document.documentElement.lang = language;
		// TODO change website words to new lang
	}

	return (
		<>
			<div className="grid-item" id="title">
				<h1>{t("title")}</h1>
			</div>
			<div className="grid-item" id="back">
				<i
					className="fa-solid fa-arrow-left grid-item"
					onClick={(): void => navigate(-1)}
				></i>
			</div>
			<div id="settings-box" className="grid-item transparent-box">
				<select id="language-selector" onChange={handleLanguageChange}>
					<option value="en">{t("english")}</option>
					<option value="fr">{t("french")}</option>
				</select>
			</div>
		</>
	);
};

export default Settings;
