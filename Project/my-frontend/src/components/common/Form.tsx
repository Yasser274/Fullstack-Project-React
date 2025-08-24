import React, { useState } from "react";
import styles from "./common.module.css";

interface FormData {
   username: string;
   password: string;
}
// ? ones i created with Props will get data from other Components or Parent Component
interface FormProps {
   buttonAction: string;
   onSubmit: (data: FormData) => void;
}

const Form = ({ onSubmit, buttonAction }: FormProps) => {
   const [username, setUserName] = useState("");
   const [password, setUserPassword] = useState("");

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      // Prevent the default form action which reloads the page.
      event.preventDefault();

      // Call the function passed down from the parent,
      // sending the current state up. (meaning username, setUserName and password states)
      onSubmit({ username, password });
   };

   return (
      <form className={styles.formCon} onSubmit={handleSubmit}>
         <div className={styles.formDetailsDiv}>
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUserName(e.target.value)} />
         </div>
         <div className={styles.formDetailsDiv}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setUserPassword(e.target.value)} />
         </div>
         <div className={styles.formBtnCon}>
            <button type="submit">{buttonAction}</button>
         </div>
      </form>
   );
};

export default Form;
