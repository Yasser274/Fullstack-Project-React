interface PasswordFieldProps {
   name: string;
   type: "text" | "password" | "email";
   label: string;
   Icon: ElementType; // It accepts a component type.
}

import styles from "../components/common/common.module.css";
import { useState, type ElementType } from "react";
import { EyeIcon } from "./EyeIcon";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const InputField = ({ name, label, Icon, type }: PasswordFieldProps) => {
   const { t } = useTranslation();

   const [showPassword, setShowPassword] = useState(false);

   const isPasswordField = type === "password"; // if type is entered password by parent it will be true if "text" it will be false

   const currentInputType = isPasswordField && showPassword ? "text" : type; // if both are true it will be show the password other wise it will hide it (if it's not password it will automatically use its type which is "text")

   return (
      <div className={styles.formDetailsDiv}>
         <div className={styles.formDetailsLabel}>
            <Icon className={styles.formIcons}></Icon>
            <label>{t(label)}</label>
         </div>

         <div className={isPasswordField ? styles.passwordInputWrapper : styles.normalInputWrapper}>
            <input type={currentInputType} name={name} className={styles.formDetailsDivInput} />

            {/* {Conditionally render the eye icon button only for password fields } */}
            {isPasswordField && (
               <motion.button
                  type="button"
                  className={`${styles.togglePasswordIcon} ${showPassword ? "" : styles.iconInactive}`}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  animate={{ y: "-50%" }}
                  whileHover={{ y: "-50%", scale: 1.1 }}
                  whileTap={{ y: "-50%", scale: 0.95 }}
                  transition={{ type: "spring", bounce: 0 }}
               >
                  <EyeIcon open={showPassword} size={24}></EyeIcon>
               </motion.button>
            )}
         </div>
      </div>
   );
};

export default InputField;
