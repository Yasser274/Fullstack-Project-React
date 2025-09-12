import { useState, useContext, createContext, useEffect, type ReactNode } from "react";

interface ThemeContextProps {
   theme: string;
   toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>(null!); // ensure TypeScript that this wont be null when we use it

// Create custom hook for easy use this is what i'll use to access the functions of this context
export const useTheme = () => {
   return useContext(ThemeContext);
};

interface ThemeProviderProps {
   children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
   // State for the theme, with logic to get initial value from localStorage
   const [theme, setTheme] = useState<string>(() => {
      return localStorage.getItem("theme") || "light";
   });

   useEffect(() => {
      // Set the data-theme attribute on the root element (or body)
      document.documentElement.setAttribute("data-theme", theme); // add class in body (will be like data-theme='dark')
      localStorage.setItem("theme", theme); // save theme perf it in local storage
   }, [theme]);

   const toggleTheme = () => {
      setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light")); // toggle between theme
   };

   const value = {
      theme,
      toggleTheme,
   };

   return <ThemeContext value={value}>{children}</ThemeContext>;
};
