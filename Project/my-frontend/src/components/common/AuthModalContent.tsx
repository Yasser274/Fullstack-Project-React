import { useEffect, useState } from "react";
import Form, { type FormDataTy } from "./Form";
import RegisterForm, { type RegisterFormData } from "./RegisterForm";
import styles from "../common/common.module.css";

// get stuff from the global state (context) (this one is for login and auth)
import { useAuth } from "../../context/AuthContext&Global";

// import API URL so i don't have to keep writing it
import { API_BASE_URL } from "../../config/config";
import { useTranslation } from "react-i18next";
// toast notification package
import { Bounce, toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

//. This is to handle both login and register and send it to API
interface AuthModalProps {
   currentTitle: number;
   onSwitchTitle: (val: 0 | 1) => void; // for the parent to pass in this component and in this component it will get toggled between 0 and 1 and that will reflect in the parent as well
}

const AuthModalContent = ({ onSwitchTitle }: AuthModalProps) => {
   const { t } = useTranslation();
   const { theme } = useTheme();

   const [view, setview] = useState<"login" | "register">("login"); // < > is generic type script it can auto detect the type inside it and in this i'm saying it only accept login and register string

   const [error, setError] = useState<string | null>(null); // holds either string or null and null means no error from the backend
   const [showMessage, setShowMessage] = useState<string | null>(null);

   //. get the login function from that context global component
   const { login } = useAuth();

   //. login in function (API)
   const handleLoginSubmit = async ({ username, password }: FormDataTy) => {
      // Clear previous messages on a new submission
      setError(null);
      setShowMessage(null);

      try {
         const response = await fetch(`${API_BASE_URL}/api/login`, {
            //* method: I'm SENDING data to the server to be processed, so i used 'POST'.
            // 'GET' is for retrieving data.
            method: "POST",

            //* "The contents of this package (the body) are in JSON format."
            // The server's `express.json()` middleware needs this to understand the data.
            headers: {
               "Content-Type": "application/json",
            },
            //* body: The fetch API can't send a JavaScript object directly.
            // I must serialize it into a JSON string format, which is what JSON.stringify does.
            body: JSON.stringify({ username, password }),
         });
         const data = await response.json(); // Parse the JSON response from the server.

         if (!response.ok) {
            // if the response wasn't ok catch the server side error (if i send a bad request (400) or if the server crashes (500) (like res.status(400))).
            if (response.status === 401) {
               // will get auth.login.wrong(data.error) and then i'll use i18n translation.json in public/locale folder to look for the value of that key which is "Invalid username or password"
               toast.error(t(data.error), {
                  position: "top-center",
                  autoClose: 4000,
                  theme: theme === "light" ? "light" : "dark",
                  transition: Bounce,
                  pauseOnHover: true,
               });
            } else {
               setError("An unexpected error occurred. Please try again.");
            }
         }

         if (data.token) {
            login(data.token); // store the token in localStorage so it keeps user logged in (kinda like his ID)
            // will get auth.login.success(data.displayMessage) and then i'll use i18n translation.json in public/locale folder to look for the value of that key which is "Logged in Successfully"
            toast.success(t(data.displayMessage), {
               position: "top-center",
               autoClose: 4000,
               theme: theme === "light" ? "light" : "dark",
               transition: Bounce,
               pauseOnHover: true,
            });

            setTimeout(() => {
               window.location.reload(); // refresh the page after user logins in
            }, 1000);
         }
      } catch (error) {
         console.log("A problem happened while trying to fetch", error);
         setError("Could not connect to the server. Please try again later.");
      }
   };

   //.  register function (API)
   const handleRegisterSubmit = async ({ username, password, confirmPassword, email }: RegisterFormData) => {
      // Clear previous messages on a new submission
      setError(null);
      setShowMessage(null);

      try {
         const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, confirmPassword, email }), // send this in req.body for the backend
         });
         const data = await response.json();

         if (!response.ok) {
            if (response.status === 409 || response.status === 400) {
               toast.error(t(data.error), {
                  position: "top-center",
                  autoClose: 4000,
                  theme: theme === "light" ? "light" : "dark",
                  transition: Bounce,
                  pauseOnHover: true,
               });
            } else {
               setError("An unexpected error occurred. Please try again.");
            }
            return; // stop the function right here so that it doesn't go below and setError the next one
         }

         // when it all went well get the displayMessage(key) value (EX: "displayMessage": "Example...")
         toast.success(t(data.displayMessage), {
            position: "top-center",
            autoClose: 4000,
            theme: theme === "light" ? "light" : "dark",
            transition: Bounce,
            pauseOnHover: true,
         });
      } catch (error) {
         console.log("A problem happened while trying to fetch", error);
         setError("Could not connect to the server. Please try again later.");
      }
   };

   return (
      <div>
         {view === "login" ? (
            <Form
               buttonAction={t("loginBtnText")}
               onSubmitP={handleLoginSubmit}
               errorMes={error}
               displayMessage={showMessage}
            ></Form>
         ) : (
            <RegisterForm
               buttonAction={t("registerBtnText")}
               OnSubmitRegister={handleRegisterSubmit}
               errorMes={error}
               displayMessage={showMessage}
            ></RegisterForm>
         )}

         <div>
            {view === "login" ? (
               <div className={styles.switchAuthCon}>
                  <span>{t("switchToRegisterText")}</span>
                  <a
                     onClick={() => {
                        setview("register");
                        onSwitchTitle(1);
                        setError(null);
                        setShowMessage(null);
                     }}
                  >
                     {t("registerBtnText")}
                  </a>
               </div>
            ) : (
               <div className={styles.switchAuthCon}>
                  <span>{t("switchToLoginText")}</span>
                  <a
                     onClick={() => {
                        setview("login");
                        onSwitchTitle(0);
                        setError(null);
                        setShowMessage(null);
                     }}
                  >
                     {t("loginBtnText")}
                  </a>
               </div>
            )}
         </div>
      </div>
   );
};

export default AuthModalContent;
