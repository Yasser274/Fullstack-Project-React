import styles from '../common/common.module.css'

const ToggleSwitchBtn = () => {
   return (
      <>
         <label className={styles.switch}>
            <input type="checkbox"></input>
            <span className={styles.slider}></span>
         </label>
      </>
   );
};

export default ToggleSwitchBtn;
