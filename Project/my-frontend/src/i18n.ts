import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
   // Fetch translations from a path like '/locales/en/translation.json'
   .use(Backend)
   // Detect user language
   .use(LanguageDetector)
   // Pass the i18n instance to react-i18next.
   .use(initReactI18next)
   // Initialize i18next
   .init({
      // Default language
      fallbackLng: "en",
      debug: import.meta.env.DEV, // Set to false in production (DEV is true on npm run dev and false on npm run build so it handles itself)

      interpolation: {
         escapeValue: false, // React already safes from xss
      },
   });

export default i18n;
