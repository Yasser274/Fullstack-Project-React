import { useState } from "react";
import Form, { type FormData } from "./Form";
import RegisterForm, { type RegisterFormData } from "./RegisterForm";
import styles from "../common/common.module.css";

//. This is to handle both login and register and send it to API

const AuthModalContent = () => {
   const [view, setview] = useState<"login" | "register">("login"); // < > is generic type script it can auto detect the type inside it and in this i'm saying it only accept login and register string

   // login in function
   const handleLoginSubmit = ({ username, password }: FormData) => {
      console.log(username, password);
   };

   const handleRegisterSubmit = ({ username, password,confirmPassword }: RegisterFormData) => {
    if (password !== confirmPassword) {
      console.log("Passwords don't match")
      return
    }
      console.log(`${username} ${password} ${confirmPassword}`);
   };
   return (
      <div>
         {view === "login" ? (
            <Form buttonAction="Login" onSubmitP={handleLoginSubmit}></Form>
         ) : (
            <RegisterForm buttonAction="Register" OnSubmitRegister={handleRegisterSubmit}></RegisterForm>
         )}

         <div>
            {view === "login" ? (
               <div className={styles.switchAuthCon}>
                  <span>Don't have an account?</span>
                  <a onClick={() => setview("register")}>Register</a>
               </div>
            ) : (
               <div className={styles.switchAuthCon}>
                  <span>Already have an account?</span>
                  <a onClick={() => setview("login")}>Login</a>
               </div>
            )}
         </div>
      </div>
   );
};

export default AuthModalContent;
