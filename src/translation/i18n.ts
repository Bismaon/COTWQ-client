import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/en.json";
import fr from "./locales/fr/fr.json";
// Check localStorage for the user's preferred language, or fallback to "en"
const savedLanguage = localStorage.getItem("lang") || "en";

i18n.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			fr: { translation: fr },
		},
		// Set the initial language from localStorage or fallback to English
		lng: savedLanguage,
		fallbackLng: "en",
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	})
	.then((r) => {
		console.debug("Translation init successfully");
	});

export default i18n;
