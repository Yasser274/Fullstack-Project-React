import { useTranslation } from "react-i18next";
import useInView from "../components/common/useInView";
import styles from "../components/styles/Layout.module.css";

const AboutPage = () => {
   const [sectionRef, isSectionVisible] = useInView<HTMLDivElement>({
      threshold: 0.1,
      triggerOnce: true,
   });
   const [section2Ref, isSection2Visible] = useInView<HTMLImageElement>({
      threshold: 0.1,
      triggerOnce: true,
   });

   const { t, } = useTranslation();

   return (
      <>
         <title>About</title>
         <div className={styles.aboutSection}>
            <div
               className={`${styles.aboutDescCon} ${isSectionVisible ? styles.aboutDescConVisible : ""}`}
               ref={sectionRef}
            >
               <h1>Trend Bites</h1>
               <span>
                  {t("aboutTrendBitesDesc")}
               </span>
            </div>
            <img
               src="https://images.rosewoodhotels.com/is/image/rwhg/habsburg-restaurant-1-1:TALL-LARGE-9-16"
               alt="Image of"
               className={`${styles.aboutSecImg} ${isSection2Visible ? styles.aboutSecImgVisible : ""} `}
               ref={section2Ref}
            />
         </div>
      </>
   );
};

export default AboutPage;
