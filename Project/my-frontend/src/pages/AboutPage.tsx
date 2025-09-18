import styles from "../components/styles/Layout.module.css";

const AboutPage = () => {
   return (
      <>
         <title>About</title>
         <div className={styles.aboutSection}>
            <div className={styles.aboutDescCon}>
               <h1>Trend Bites</h1>
               <span>
                  Unlike Google Maps, Trend Bites focuses on dynamic, monthly trends, enabling small
                  restaurants to rise quickly in popularity and helping users discover new dining experiences.
                  This project showcases full-stack development, user authentication, database management, and
                  responsive UI design, creating an engaging, community-driven platform for restaurant
                  ratings.
               </span>
            </div>
            <img
               src="https://images.rosewoodhotels.com/is/image/rwhg/habsburg-restaurant-1-1:TALL-LARGE-9-16"
               alt="Image of"
               className={styles.aboutSecImg}
            />
         </div>
      </>
   );
};

export default AboutPage;
