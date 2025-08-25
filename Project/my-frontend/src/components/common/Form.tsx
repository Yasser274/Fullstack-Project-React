import React, { useState } from "react";
import styles from "./common.module.css";

// Import SVGs icons
import UsernameIcon from "../../assets/icons/UsernameSVG"; // so i can use the SVG and render it as SVG and not img so i can edit its color etc (meaning path)
import PasswordIcon from "../../assets/icons/PasswordSVG";

export interface FormData {
   // It specifies that the FormData object must have two properties: username and password, both of type string.
   username: string;
   password: string;
}
// ? ones i created with Props will get data from other Components or Parent Component
interface FormProps {
   buttonAction: string;
   onSubmitP: (data: FormData) => void;
   errorMes: string | null;
}

const Form = ({ onSubmitP, buttonAction, errorMes }: FormProps) => {
   const [username, setUserName] = useState("");
   const [password, setUserPassword] = useState("");

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      // Prevent the default form action which reloads the page.
      event.preventDefault();

      // Call the function passed down from the parent,
      // sending the current state up. (meaning username, setUserName and password states)
      onSubmitP({ username, password });
   };

   return (
      <form className={styles.formCon} onSubmit={handleSubmit}>
         {/* render this when the backend returns an error(meaning not null(a string message means an error)) if there is no error return null(nothing) */}
         {errorMes !== null ? <p className={styles.modalErrorMessage}>{errorMes}</p> : null}
         <div className={styles.formDetailsDiv}>
            <div className={styles.formDetailsLabel}>
               <UsernameIcon className={styles.formIcons}></UsernameIcon>
               <label>Username</label>
            </div>
            <input type="text" value={username} onChange={(e) => setUserName(e.target.value)} />
         </div>
         <div className={styles.formDetailsDiv}>
            <div className={styles.formDetailsLabel}>
               <PasswordIcon className={styles.formIcons}></PasswordIcon>
               <label>Password</label>
            </div>
            <input type="password" value={password} onChange={(e) => setUserPassword(e.target.value)} />
         </div>
         <div className={styles.formBtnCon}>
            <button type="submit">
               <span className={styles.formBtnShadow}></span>
               <span className={styles.formBtnEdge}></span>
               <div className={styles.formBtnFront}>
                  <span>{buttonAction}</span>
               </div>
            </button>
         </div>
      </form>
   );
};

export default Form;
