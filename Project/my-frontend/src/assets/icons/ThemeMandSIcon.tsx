import { useTheme } from "../../context/ThemeContext";
import sunIconUrl from "../icons/sun.png";
import moonIconUrl from "../icons/moon.png";

import styles from "../../components/styles/Layout.module.css";

const ThemeMandSIcon = () => {
   const { theme, toggleTheme } = useTheme();

   const iconUrl = theme === "dark" ? sunIconUrl : moonIconUrl;

   const buttonStyle = {
      "--icon-url": `url(${iconUrl})`,
   };

   return (
      <button
         onClick={toggleTheme}
         aria-label="Toggle theme"
         className={`${styles.toggleThemeBtn}`}
         style={buttonStyle as React.CSSProperties}
      />
   );
};

export default ThemeMandSIcon;
