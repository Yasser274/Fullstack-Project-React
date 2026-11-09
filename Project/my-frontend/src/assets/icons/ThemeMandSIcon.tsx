import { useTheme } from "../../context/ThemeContext";
import { MoonIcon, SunIcon } from "./Icons";

import styles from "../../components/styles/Layout.module.css";

// theme switch button (was 2 png images swapped with a css variable, now the same svg icons as the rest of the site)
const ThemeMandSIcon = () => {
   const { theme, toggleTheme } = useTheme();

   return (
      <button
         onClick={toggleTheme}
         aria-label="Toggle theme"
         title={theme === "dark" ? "Light mode" : "Dark mode"}
         className={styles.toggleThemeBtn}
      >
         {/* in dark mode show the sun (click = go light) and in light mode the moon */}
         {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
      </button>
   );
};

export default ThemeMandSIcon;
