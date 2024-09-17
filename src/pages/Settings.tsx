import { NavigateFunction, useNavigate } from "react-router-dom";
import "../stylesheet/style.css";
import React from "react";
import { changeLanguageForCountry } from "../scene/sceneManager";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
	console.debug("Rendering Settings.tsx");

	const { t, i18n } = useTranslation();

	function handleSaveSettings(): void {
		// language
		const languageSelector = document.getElementById(
			"language-selector"
		) as HTMLSelectElement;
		const language: string = languageSelector.value;
		i18n.changeLanguage(language).then(() => {
			console.debug("Lang changed for site done");
		});
		changeLanguageForCountry(language).then(() => {
			console.debug("Lang changed for countries done");
		});
		document.documentElement.lang = language;
		//other setting

		//other setting
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
				<p className="grid-item">{t("language-select")}:</p>
				<select className="grid-item" id="language-selector">
					<option value="en">English</option>
					<option value="fr">Français</option>
				</select>
				<button
					onClick={(): void => {
						handleSaveSettings();
					}}
					id="save-settings"
					className="grid-item"
				>
					{t("save-settings")}
				</button>
			</div>
		</>
	);
};

export default Settings;
