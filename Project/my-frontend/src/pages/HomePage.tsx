import styles from "../components/Home.module.css";

// Importing SVGs
import ThumbsDownSVG from "../assets/icons/thumb-down.svg";
import ThumbsUpSVG from "../assets/icons/thumb-up.svg";

interface homePageProps {
   sectionTitle: string;
}

const HomePage = ({ sectionTitle }: homePageProps) => {
   return (
      <div className={styles.homeContentCon}>
         <h1>{sectionTitle}</h1>
         <div className={styles.restaurantsCardsCon}>
            <div className={styles.leftRestaurantsContentCon}>
               <div className={styles.rankName}>
                  <span>1.</span>
                  <h1>Mac</h1>
               </div>
               <div className={styles.restLabels}>
                  <div>Burgers</div>
                  <div>Ice cream</div>
               </div>
               <span className={styles.restDesc}>Burgers that tastes amazing</span>
            </div>
            <div className={styles.rightRestaurantsContentCon}>
               <div className={styles.restaurantLogo}>
                  <img
                     src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f"
                     alt="Restaurant's Logo"
                  />
               </div>
               <div className={styles.votingCon}>
                  <div className={styles.votingDetails}>
                     <img src={ThumbsDownSVG} alt="Thumbs down" />
                     <span>0</span>
                  </div>
                  <div className={styles.votingDetails}>
                     <img src={ThumbsUpSVG} alt="Thumbs up" />
                     <span>0</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default HomePage;
