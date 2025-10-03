import styles from "../../components/common/common.module.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
   OnSubmitRegister: (data: RegisterFormData) => Promise<void>;
   errorMes?: string | null;
   displayMessage?: string | null;
}

const RegisterForm = ({ buttonAction, OnSubmitRegister, errorMes, displayMessage }: RegisterFormProps) => {
   const { t } = useTranslation();

   const [showPassword, setShowPassword] = useState<boolean>(false);

   const savedRegisterInfo = async (formData: FormData) => {
      const username = formData.get("username") as string; // get the name="username" from inside the form and set its type as string so it goes with our interface type
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      try {
         // NOW wait for the parent function to finish completely.
         await OnSubmitRegister({ username, password, confirmPassword, email });
      } catch (error) {
         console.error("Submission Error", error);
      }
   };

   return (
      <form className={styles.formCon} action={savedRegisterInfo}>
         {/* render this when the backend returns an error(meaning not null(a string message means an error)) if there is no error return null(nothing) */}
         {errorMes !== null ? <p className={styles.modalErrorMessage}>{errorMes}</p> : null}
         {displayMessage !== null ? <p className={styles.modalDisplayMessage}>{displayMessage}</p> : null}
         <div className={styles.formDetailsDiv}>
            <div className={styles.formDetailsLabel}>
               <UsernameIcon className={styles.formIcons}></UsernameIcon>
               <label>{t("usernameTextField")}</label>
            </div>
            <input type="text" name="username" />
         </div>
         <div className={styles.formDetailsDiv}>
            <div className={styles.formDetailsLabel}>
               <EmailSVG className={styles.formIcons}></EmailSVG>
               <label>{t("emailTextField")}</label>
            </div>
            <input type="email" name="email" />
         </div>
         <div className={styles.formDetailsDiv}>
            <div className={styles.formPasswordWrapper}>
               <div className={styles.formDetailsLabel}>
                  <PasswordIcon className={styles.formIcons}></PasswordIcon>
                  <label>{t("passwordTextField")}</label>
               </div>
               <input type={showPassword ? "text" : "password"} name="password" />
               <button
                  type="button"
                  className={styles.togglePasswordIcon}
                  onClick={() => setShowPassword(!showPassword)}
               >
                  {showPassword ? "Hide" : "Show"}
               </button>
            </div>
            <div className={styles.formPasswordWrapper}>
               <div className={styles.formDetailsLabel}>
                  <PasswordIcon className={styles.formIcons}></PasswordIcon>
                  <label>{t("confPasswordTextField")}</label>
               </div>
               <input type={showPassword ? "text" : "password"} name="confirmPassword" />
               <button
                  type="button"
                  className={styles.togglePasswordIcon}
                  onClick={() => setShowPassword(!showPassword)}
               >
                  {showPassword ? "Hide" : "Show"}
               </button>
            </div>
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
