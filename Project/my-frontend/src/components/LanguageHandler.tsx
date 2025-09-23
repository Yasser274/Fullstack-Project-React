import { useEffect } from "react";
import { useParams, Outlet, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// The languages i support
const supportedLanguages = ["en", "ar"];

const LanguageHandler = () => {
   const { lang } = useParams<{ lang: string }>(); // Reads the ':lang' from the URL
   const { i18n } = useTranslation();

   useEffect(() => {
      let timerId: number | undefined = undefined;
      // if lang exists and lang is included in supportedLanguages and i18n.language(current site language) isn't the new changed language
      if (lang && supportedLanguages.includes(lang) && i18n.language !== lang) {
         i18n.changeLanguage(lang);
         timerId = setTimeout(() => {
            window.location.reload();
         }, 1000);
      }

      return () => {
         clearTimeout(timerId);
      };
   }, [lang, i18n]);

   //  when language changes to arabic or english change the page direction (LTR or RTL)
   useEffect(() => {
      if (i18n.language === "ar") {
         document.documentElement.lang = "ar";
         document.documentElement.dir = "rtl"; // set page direction to right to left
      } else {
        document.documentElement.lang = "en";
         document.documentElement.dir = "ltr";
      }
   }, [i18n.language]);

   //  check to handle invalid language codes in the URL
   if (lang && !supportedLanguages.includes(lang)) {
      return <Navigate to="/en" replace></Navigate>; // Redirect to a default language
   }
   // This renders the nested routes (i.e., your <Layout /> and its children)
   return <Outlet></Outlet>;
};

export default LanguageHandler;
