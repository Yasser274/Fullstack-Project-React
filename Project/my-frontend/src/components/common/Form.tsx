import styles from "./common.module.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Import SVGs icons
import UsernameIcon from "../../assets/icons/UsernameSVG"; // so i can use the SVG and render it as SVG and not img so i can edit its color etc (meaning path)
import PasswordIcon from "../../assets/icons/PasswordSVG";
import InputField from "../InputField";

export interface FormDataTy {
   // It specifies that the FormDataTy object must have two properties: username and password, both of type string.
   username: string;
   password: string;
}
// ? ones i created with Props will get data from other Components or Parent Component
interface FormProps {
   buttonAction: string;
   onSubmitP: (data: FormDataTy) => void;
   errorMes?: string | null;
   displayMessage?: string | null;
}

const Form = ({ onSubmitP, buttonAction, errorMes, displayMessage }: FormProps) => {
   const { t } = useTranslation();

   const [showPassword, setShowPassword] = useState<boolean>(false);

   const handleSubmit = (formData: FormData) => {
      // grab the input datas from inside the <form>
      const username = formData.get("username") as string; // so it knows the type of username so it goes with FormDataTy
      const password = formData.get("password") as string;
      // Call the function passed down from the parent,
      // sending the current state up. (meaning username, setUserName and password states)
      onSubmitP({ username, password });
   };

   return (
      <form className={styles.formCon} action={handleSubmit}>
         {/* render this when the backend returns an error(meaning not null(a string message means an error)) if there is no error return null(nothing) */}
         {errorMes !== null ? <p className={styles.modalErrorMessage}>{errorMes}</p> : null}
         {displayMessage !== null ? <p className={styles.modalDisplayMessage}>{displayMessage}</p> : null}

         <InputField name="username" label="usernameTextField" Icon={UsernameIcon} type="text"></InputField>

         <InputField
            name="password"
            label="passwordTextField"
            type="password"
            Icon={PasswordIcon}
         ></InputField>

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
