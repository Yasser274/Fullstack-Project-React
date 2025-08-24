import styles from "../components/styles/Layout.module.css";

const AboutPage = () => {
   return (
      <>
      <title>About</title>
         <div className={styles.aboutSection}>
            <div className={styles.aboutDescCon}>
               <h1>Company Name</h1>
               <span>NFGIDSNGFI gJDSIog SDGJ ioGSDJIoGSD</span>
            </div>
            <img
               src="https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png"
               alt="Image of"
               style={{ width: "500px" }}
            />
         </div>
      </>
   );
};

export default AboutPage;
