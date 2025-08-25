import React, { useState } from "react";
import styles from "../../components/common/common.module.css";
// Import SVGs icons
import UsernameIcon from "../../assets/icons/UsernameSVG"; // so i can use the SVG and render it as SVG and not img so i can edit its color etc (meaning path)
import PasswordIcon from "../../assets/icons/PasswordSVG";
import EmailSVG from "../../assets/icons/EmailSVG";

export interface RegisterFormData {
   username: string;
   password: string;
   confirmPassword: string;
   email: string;
}

interface RegisterFormProps {
   buttonAction: string;
   OnSubmitRegister: (data: RegisterFormData) => void;
   errorMes: string | null;
}

const RegisterForm = ({ buttonAction, OnSubmitRegister, errorMes }: RegisterFormProps) => {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [email, setEmail] = useState("");

   const savedRegisterInfo = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      OnSubmitRegister({ username, password, confirmPassword, email });

      setPassword("");
      setConfirmPassword(""); // empty out the value of the field
   };
   return (
      <form className={styles.formCon} onSubmit={savedRegisterInfo}>
         {/* render this when the backend returns an error(meaning not null(a string message means an error)) if there is no error return null(nothing) */}
         {errorMes !== null ? <p className={styles.modalErrorMessage}>{errorMes}</p> : null}
         <div className={styles.formDetailsDiv}>
            <div className={styles.formDetailsLabel}>
               <UsernameIcon className={styles.formIcons}></UsernameIcon>
               <label>Username</label>
            </div>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
         </div>
         <div className={styles.formDetailsDiv}>
            <div className={styles.formDetailsLabel}>
               <EmailSVG className={styles.formIcons}></EmailSVG>
               <label>Email</label>
            </div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
         </div>
         <div className={styles.formDetailsDiv}>
            <div className={styles.formDetailsLabel}>
               <PasswordIcon className={styles.formIcons}></PasswordIcon>
               <label>Password</label>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className={styles.formDetailsLabel}>
               <PasswordIcon className={styles.formIcons}></PasswordIcon>
               <label>Confirm Password</label>
            </div>
            <input
               type="password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
            />
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

export default RegisterForm;
