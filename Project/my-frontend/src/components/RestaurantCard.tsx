import type { Restaurant } from "../pages/HomePage";
import styles from "../components/styles/Home.module.css";

// get the types of restaurant
interface RestaurantCardProps {
   restaurant: Restaurant;
   // ranking
   rank:number
}
// Importing SVGs
import ThumbsDownSVG from "../assets/icons/thumb-down.svg";
import ThumbsUpSVG from "../assets/icons/thumb-up.svg";


const RestaurantCard = ({ restaurant,rank }: RestaurantCardProps) => {
   return (
      <div className={styles.restaurantsCardsCon}>
         <div className={styles.leftRestaurantsContentCon}>
            <div className={styles.rankName}>
               <span>{rank}</span>
               <h1>{restaurant.restaurantname}</h1>
            </div>
            <div className={styles.restLabels}>
               {/* {restaurant.tags.map((tag) => {
                  return <div key={tag}>{tag}</div>; // return inside a function ends the function and gives back a value. // JSX map code, return provides the rendered element for each item, which is collected into a new array to be displayed.
               })} */}
            </div>
            <span className={styles.restDesc}>{restaurant.description}</span>
         </div>
         <div className={styles.rightRestaurantsContentCon}>
            <div className={styles.restaurantLogo}>
               <img src={restaurant.restaurantlogo} alt={`${restaurant.restaurantname} logo`} />
            </div>
            <div className={styles.votingCon}>
               <div className={styles.votingDetails}>
                  <img src={ThumbsDownSVG} alt="Thumbs down" />
                  <span>{restaurant.downvotes}</span>
               </div>
               <div className={styles.votingDetails}>
                  <img src={ThumbsUpSVG} alt="Thumbs up" />
                  <span>{restaurant.upvotes}</span>
               </div>
            </div>
         </div>
      </div>
   );
};

export default RestaurantCard;
