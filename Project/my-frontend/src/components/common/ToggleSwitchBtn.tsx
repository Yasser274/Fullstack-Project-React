import styles from "../common/common.module.css";
import { useEffect, useState } from "react";

interface ToggleSwitchBtnProps {
   onChangeFun?: () => void;
   checkLan?: string;
}

const ToggleSwitchBtn = ({ onChangeFun, checkLan }: ToggleSwitchBtnProps) => {
   // if current language is arabic it will return true if english it will return false and the slider will be in english side
   const [isChecked, setIsChecked] = useState(checkLan === "ar");

   useEffect(() => {
      setIsChecked(checkLan === "ar");
   }, [checkLan]);

   const handleClick = () => {
      setIsChecked(!isChecked);

      // Call the function passed from the parent to change the state
      onChangeFun?.();
   };

   return (
      <>
         <label className={styles.switch}>
            {/* if checkLan === "ar" it will return true if not else */}
            <input type="checkbox" checked={isChecked} onChange={handleClick}></input>
            <span className={styles.slider}></span>
         </label>
      </>
   );
};

export default ToggleSwitchBtn;
