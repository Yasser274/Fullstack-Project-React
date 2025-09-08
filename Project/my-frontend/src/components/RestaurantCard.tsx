import type { Restaurant, Review } from "../pages/HomePage";
import styles from "../components/styles/Home.module.css";
import { useState } from "react";

// get the types of restaurant
interface RestaurantCardProps {
   restaurantList: Restaurant;
   // ranking
   rank: number;
   handleVoteUpdate: (data: Restaurant) => void;
}

interface restauAndRatingVProps {
   restaurID: number;
   userRatingV: number;
}

type RatingAmountT = 1 | 2 | 3 | 4 | 5 | number;

// Importing SVGs
import { API_BASE_URL } from "../config/config";
import Star from "../assets/icons/Star";
import { useAuth } from "../context/AuthContext&Global";
import Modal from "./common/Modal";
import ReviewCommentsIcon from "../assets/icons/ReviewCommentsIcon";
import ReviewComments from "./ReviewComments";

const RestaurantCard = ({ restaurantList, rank, handleVoteUpdate }: RestaurantCardProps) => {
   console.log(restaurantList);
   // function to votes and affect the ranking
   // State to hold the current rating. 0 means no stars are selected.
   const [rating, setRating] = useState<number>(0);
   // State to disable stars while submitting the vote
   const [isVoting, setIsVoting] = useState<boolean>(false);

   const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

   const [reviewModal, setReviewModal] = useState<boolean>(false);
   // to store user rating and the id of the restaurant he rated

   const [restauAndRatingV, setRestauAndRatingV] = useState<restauAndRatingVProps | null>(null);

   // review comment state
   const [reviewComm, setReviewComm] = useState<string>("");

   // open review comments modal
   const [reviewCommentsModal, setReviewCommentsModal] = useState<boolean>(false);
   console.log(reviewCommentsModal);

   const totalStars = 5;

   // get userID (using global context)
   const { user } = useAuth();

   const popUpReviewModal = (uRatingA: RatingAmountT, restId: number) => {
      setReviewModal(true);

      // take which restaurant id the user rated and how much he rated it and store it in a state so the rateRestaurant can use it
      setRestauAndRatingV({ restaurID: Number(restId), userRatingV: Number(uRatingA) });
   };

   // .RATING RESTAURANTS
   const rateRestaurant = async (id: number, rateValue: number, event?: React.FormEvent) => {
      if (event) {
         event.preventDefault();
      }

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
               comment: reviewComm, // send the comment of the user if provided
            }),
         });
         if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vote Failed ${response.status} ${response.statusText} - ${errorText}`);
         }
         const updatedRestaurant = await response.json();
         console.dir(updatedRestaurant);
         console.log("Sent", updatedRestaurant);
         handleVoteUpdate(updatedRestaurant.restaurantsData[0]);
      } catch (error) {
         console.error("Error submitting vote:", error);
         if (error instanceof Error) {
            console.error("Message:", error.message);
         }
      } finally {
         // Re-enable the stars whether the vote succeeded or failed
         setIsVoting(false);
         setReviewModal(false); // close the review modal popup
         setReviewComm(""); // reset the review comment field
      }
   };

   return (
      // . if user isn't logged in
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
         {/* //. pop up to rate restaurants and add comment */}
         {reviewModal === true ? (
            <Modal
               isOpen={reviewModal}
               title="Review Restaurant"
               onClose={() => {
                  setReviewModal(false);
               }}
            >
               <div>
                  <form
                     onSubmit={(e) =>
                        rateRestaurant(restauAndRatingV!.restaurID, restauAndRatingV!.userRatingV, e)
                     }
                     className={styles.reviewFormCon}
                  >
                     <textarea
                        name="userReviewComment"
                        id="userReviewCommentID"
                        placeholder="Optionally add a comment"
                        onChange={(e) => {
                           setReviewComm(e.target.value);
                        }}
                        value={reviewComm}
                     ></textarea>
                     <span
                        className={
                           reviewComm.length > 1300 ? styles.charReviewLimitW : styles.charReviewLimitN
                        }
                     >
                        Character Limit: {reviewComm.length}/1300
                     </span>
                     {reviewComm.length > 1300 ? <span>Passed the Character Limit</span> : null}
                     <button
                        type="submit"
                        disabled={reviewComm.length > 1300}
                        style={reviewComm.length > 1300 ? { pointerEvents: "none" } : undefined}
                     >
                        Add Review
                     </button>
                  </form>
               </div>
            </Modal>
         ) : null}
         {/* //. Open review comments modal */}
         {reviewCommentsModal ? (
            <Modal isOpen={reviewCommentsModal} onClose={() => setReviewCommentsModal(false)} title="Reviews">
               {restaurantList.reviews.map((review) => {
                  return (
                     <ReviewComments
                        key={review.user.id}
                        reviewedAt={review.reviewedAt}
                        comment={review.comment}
                        user={review.user}
                        rating={review.rating}
                     ></ReviewComments>
                  );
               })}
            </Modal>
         ) : null}
         {/* //.RESTAURANTS LISTS */}
         <div className={styles.restaurantsCardsCon}>
            <div className={styles.leftRestaurantsContentCon}>
               <div className={styles.rankName}>
                  <span>{rank}</span>
                  <h1>{restaurantList.restaurant_name}</h1>
               </div>
               <div className={styles.restLabels}>
                  {restaurantList.tags?.map((tag) => {
                     return <div key={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</div>; // return inside a function ends the function and gives back a value. // JSX map code, return provides the rendered element for each item, which is collected into a new array to be displayed.
                  })}
               </div>
               <span className={styles.restDesc}>{restaurantList.description}</span>
               <div className={styles.reviewCommentsCon}>
                  <ReviewCommentsIcon
                     className={styles.reviewCommentsIcon}
                     onClickModal={() => setReviewCommentsModal(true)}
                  ></ReviewCommentsIcon>
                  <span>({restaurantList.reviews.length})</span>
               </div>
            </div>
            <div className={styles.rightRestaurantsContentCon}>
               <div className={styles.restaurant_logo}>
                  <img src={restaurantList.restaurant_logo} alt={`${restaurantList.restaurant_name} logo`} />
               </div>
               <div className={styles.ratingCon}>
                  <div className={styles.ratingDetails}>
                     <div className={styles.starsCon}>
                        {[...Array(totalStars)].map((_, index: number) => {
                           const ratingValue: RatingAmountT = index + 1;
                           const isFilled = ratingValue <= Math.round(restaurantList.average_rating);

                           return (
                              <Star
                                 key={index}
                                 filled={isFilled}
                                 // now the ratingValue will be first star(1) until last star 5 and when clicked this function will grab the id and which star user clicked
                                 // * onClick={() => rateRestaurant(Number(restaurantList.id), ratingValue)}
                                 onClick={() => {
                                    popUpReviewModal(ratingValue, Number(restaurantList.id));
                                 }}
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
