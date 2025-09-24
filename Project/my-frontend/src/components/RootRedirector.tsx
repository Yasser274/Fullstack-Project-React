import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const supportedLanguages = ["en", "ar"];
const defaultLanguage = "en";

const RootRedirector = () => {
   // function that can be called to change the URL
   const navigate = useNavigate();

   useEffect(() => {
      const storedLang = localStorage.getItem("i18nextLng");

      // If a supported language is stored, use it. Otherwise, use the default.
      const targetLang = storedLang && supportedLanguages.includes(storedLang) ? storedLang : defaultLanguage;

      // Perform the redirect
      navigate(`/${targetLang}`, { replace: true });
   }, [navigate]);

   // This component redirects, so it doesn't need to render any complex UI.
   // A simple loading indicator is perfect to prevent any "flash" of content.
   return <div>Loading...</div>;
};

export default RootRedirector;
