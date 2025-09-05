import type { Restaurant } from "../pages/HomePage";
import styles from "../components/styles/Home.module.css";
import { useState } from "react";

// get the types of restaurant
interface RestaurantCardProps {
   restaurantList: Restaurant;
   // ranking
   rank: number;
   handleVoteUpdate: (data: Restaurant) => void;
}
// Importing SVGs
import { API_BASE_URL } from "../config/config";
import Star from "../assets/icons/Star";
import { useAuth } from "../context/AuthContext&Global";
import Modal from "./common/Modal";

const RestaurantCard = ({ restaurantList, rank, handleVoteUpdate }: RestaurantCardProps) => {
   // function to votes and affect the ranking
   // State to hold the current rating. 0 means no stars are selected.
   const [rating, setRating] = useState(0);
   // State to disable stars while submitting the vote
   const [isVoting, setIsVoting] = useState(false);

   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

   const totalStars = 5;

   // get userID (using global context)
   const { user } = useAuth();

   const rateRestaurant = async (id: number, rateValue: number) => {
      // Prevent clicking while a vote is in progress
      if (isVoting) {
         return;
      }
      if (!user) {
         console.error("User is not authenticated. Cannot vote.");
         setIsAuthModalOpen(true);
         return;
      }

      // the backend will decode the token
      const authToken = localStorage.getItem("token");
      if (!authToken) {
         console.error("Authentication error: Token not found");
         return;
      }

      setIsVoting(true);
      try {
         const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}/rate`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json", // Tell the server we're sending JSON
               Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
               ratingAmount: rateValue, // Send the rate value out of 5 in the body
            }),
         });
         if (!response.ok) {
            throw new Error("Vote Failed");
         }
         const updatedRestaurant = await response.json();
         console.log("Sent", updatedRestaurant);
         handleVoteUpdate(updatedRestaurant.restaurantsData[0]);
      } catch (error) {
         console.error("Error submitting vote:", error);
      } finally {
         // Re-enable the stars whether the vote succeeded or failed
         setIsVoting(false);
      }
   };

   return (
      <>
         <Modal
            isOpen={isAuthModalOpen}
            title="Authentication Required"
            onClose={() => {
               setIsAuthModalOpen(false);
            }}
         >
            {/* the content of this modal */}
            <div>
               <p style={{ textAlign: "center" }}>You must be logged in to rate.</p>
            </div>
         </Modal>
         <div className={styles.restaurantsCardsCon}>
            <div className={styles.leftRestaurantsContentCon}>
               <div className={styles.rankName}>
                  <span>{rank}</span>
                  <h1>{restaurantList.restaurantname}</h1>
               </div>
               <div className={styles.restLabels}>
                  {restaurantList.tags?.map((tag) => {
                     return <div key={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</div>; // return inside a function ends the function and gives back a value. // JSX map code, return provides the rendered element for each item, which is collected into a new array to be displayed.
                  })}
               </div>
               <span className={styles.restDesc}>{restaurantList.description}</span>
            </div>
            <div className={styles.rightRestaurantsContentCon}>
               <div className={styles.restaurantLogo}>
                  <img src={restaurantList.restaurantlogo} alt={`${restaurantList.restaurantname} logo`} />
               </div>
               <div className={styles.ratingCon}>
                  <div className={styles.ratingDetails}>
                     <div className={styles.starsCon}>
                        {[...Array(totalStars)].map((_, index: number) => {
                           const ratingValue = index + 1;
                           const isFilled = ratingValue <= Math.round(restaurantList.average_rating);

                           return (
                              <Star
                                 key={index}
                                 filled={isFilled}
                                 // now the ratingValue will be first star(1) until last star 5 and when clicked this function will grab the id and which star user clicked
                                 onClick={() => rateRestaurant(Number(restaurantList.id), ratingValue)}
                                 disabled={isVoting}
                              ></Star>
                           );
                        })}
                     </div>
                     <div className={styles.ratingInfo}>
                        <span>{restaurantList.average_rating}</span>
                        <span>({restaurantList.rating_count})</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default RestaurantCard;
