import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext&Global.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ToastContainer } from "react-toastify";

// import languages package
import "./i18n";

createRoot(document.getElementById("root")!).render(
   <StrictMode>
      <Suspense fallback="loading...">
         <BrowserRouter>
            <AuthProvider>
               <ThemeProvider>
                  <ToastContainer />
                  <App />
               </ThemeProvider>
            </AuthProvider>
         </BrowserRouter>
      </Suspense>
   </StrictMode>
);
