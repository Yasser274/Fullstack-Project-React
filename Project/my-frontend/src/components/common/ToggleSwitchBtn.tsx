import styles from "../common/common.module.css";

interface ToggleSwitchBtnProps {
   onChangeFun?: () => void;
   checkLan?: string;
}

const ToggleSwitchBtn = ({ onChangeFun, checkLan }: ToggleSwitchBtnProps) => {
   return (
      <>
         <label className={styles.switch}>
            {/* if checkLan === "ar" it will return true if not else */}
            <input type="checkbox" checked={checkLan === "ar"} onChange={onChangeFun}></input>
            <span className={styles.slider}></span>
         </label>
      </>
   );
};

export default ToggleSwitchBtn;
