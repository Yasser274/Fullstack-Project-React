import type { Restaurant, Review } from "../pages/HomePage";
import type { User } from "../context/AuthContext&Global";
import styles from "../components/styles/Home.module.css";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, Bounce } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

// get the types of restaurant
interface RestaurantCardProps {
   restaurantList: Restaurant;
   // ranking
   rank: number;
   handleVoteUpdate: (data: Restaurant[]) => void;
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
import HalfEmptyStar from "../assets/icons/HalfEmptyStar";

const RestaurantCard = ({ restaurantList, rank, handleVoteUpdate }: RestaurantCardProps) => {
   const { t } = useTranslation();
   const { theme } = useTheme();

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

   // error if rated the same amount again
   const [errorSameAmount, setErrorSameAmount] = useState<string | null>(null);

   const totalStars = 5;

   // get userID (using global context)
   const { user } = useAuth();

   //? Find the specific review left by the current user.
   // useMemo ensures this .find() operation only runs again if the user or the reviews list changes.
   const userReview = useMemo(() => {
      // if user isn't logged in there is no user review to get
      if (!user) {
         return;
      }
      // look through reviews array and find one that has the user id of the currently logged user then return that so i can use userReview
      return restaurantList.reviews.find((review) => review.user.username === user.username);
   }, [user, restaurantList.reviews]);

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

      if (rateValue === userReview?.rating) {
         toast.error(`You have already given this restaurant a rating of ${userReview?.rating} stars.`, {
            position: "top-center",
            autoClose: 4000,
            theme: theme === "light" ? "light" : "dark",
            transition: Bounce,
            pauseOnHover: true,
         });
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
         toast.success(t("ratedSuccessfully"), {
            position: "top-center",
            autoClose: 4000,
            theme: theme === "light" ? "light" : "dark",
            transition: Bounce,
            pauseOnHover: true,
            icon: <>🎉</>,
         });
         handleVoteUpdate(updatedRestaurant.restaurantsData);
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
            title={t("authReqMessageTitle")}
            onClose={() => {
               setIsAuthModalOpen(false);
            }}
         >
            {/* the content of this modal */}
            <div>
               <p style={{ textAlign: "center" }}>{t("authReqMessage")}</p>
            </div>
         </Modal>
         {/* //. pop up to rate restaurants and add comment */}
         {reviewModal === true ? (
            <Modal
               isOpen={reviewModal}
               title={t("reviewRestaurantModalTitle")}
               onClose={() => {
                  setReviewModal(false);
               }}
               error={errorSameAmount}
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
                        placeholder={t("reviewRestaurantModalTextPlaceHolder")}
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
                        {t("reviewRestaurantModalCharLimit")} {reviewComm.length}/1300
                     </span>
                     {reviewComm.length > 1300 ? (
                        <span>{t("reviewRestaurantModalCharLimitPassedMsg")}</span>
                     ) : null}
                     <button
                        type="submit"
                        disabled={reviewComm.length > 1300}
                        style={reviewComm.length > 1300 ? { pointerEvents: "none" } : undefined}
                     >
                        {t("addReviewBtn")}
                     </button>
                  </form>
               </div>
            </Modal>
         ) : null}
         {/* //. Open review comments modal */}
         {reviewCommentsModal ? (
            <Modal
               isOpen={reviewCommentsModal}
               onClose={() => setReviewCommentsModal(false)}
               title={t("reviewsTitleModal")}
            >
               {restaurantList.reviews.map((review, index) => {
                  // Combine two unique IDs to create a new unique string
                  const uniqueKey = `${index}-${review.user.id}`;
                  return (
                     <ReviewComments
                        key={uniqueKey}
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
         <div className={`${styles.card} restaurantsEle`}>
            <div className={styles.cardRank}>#{rank}</div>

            <div className={styles.cardContent}>
               <header className={styles.cardHeader}>
                  <div className={styles.cardHeaderText}>
                     <h2 className={styles.cardTitle}>{restaurantList.restaurant_name}</h2>
                     <div className={styles.cardTags}>
                        {restaurantList.tags?.map((tag) => (
                           <span key={tag} className={styles.tag}>
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                           </span>
                        ))}
                     </div>
                  </div>
                  <div className={styles.cardLogo}>
                     <img
                        src={restaurantList.restaurant_logo}
                        alt={`${restaurantList.restaurant_name} logo`}
                     />
                  </div>
               </header>

               <p className={styles.cardDescription}>{restaurantList.description}</p>

               <footer className={styles.cardFooter}>
                  {/* The onClick is now on the parent div for a larger click area */}
                  <div className={styles.cardReviews} onClick={() => setReviewCommentsModal(true)}>
                     <ReviewCommentsIcon className={styles.reviewCommentsIcon} />
                     <span>
                        {restaurantList.reviews.length === 1
                           ? `${restaurantList.reviews.length} ${t("review")}`
                           : `${restaurantList.reviews.length} ${t("reviews")}`}
                     </span>
                  </div>

                  {/* User's rating for the restaurant */}
                  <div className={styles.cardRating}>
                     {userReview && (
                        <div className={styles.userRatingDisplay}>
                           <span>{t("yourRating")}</span>
                           <div className={styles.stars}>
                              {[...Array(userReview.rating)].map((_, index) => (
                                 // **FIX:** Using standard `className` prop instead of custom `classNameUser`
                                 <Star key={index} classNameUser={styles.smallStar} />
                              ))}
                           </div>
                        </div>
                     )}
                     {/* Restaurant Average Rating */}
                     <div className={styles.averageRating}>
                        <div className={styles.stars}>
                           {[...Array(totalStars)].map((_, index) => {
                              const ratingValue = index + 1;
                              const avgRating = restaurantList.average_rating; // The raw value, e.g., 3.5

                              // This is the click handler for ANY star
                              const handleStarClick = () => {
                                 popUpReviewModal(ratingValue, Number(restaurantList.id));
                              };

                              if (avgRating >= ratingValue) {
                                 // return full star if avgRating is more than ratingValue except when it's EX: 3.5 >= 4 (no go to the else if)
                                 return (
                                    <Star
                                       key={index}
                                       classNameUser={styles.filledStar}
                                       onClick={handleStarClick}
                                       disabled={isVoting}
                                    />
                                 );
                                 // then avgRating is 3.5 > 3
                              } else if (avgRating > ratingValue - 1) {
                                 // render half star
                                 return (
                                    <HalfEmptyStar
                                       key={index}
                                       className={styles.halfEmptyStar}
                                       onClick={handleStarClick}
                                    ></HalfEmptyStar>
                                 );
                              } else {
                                 // render empty star
                                 return (
                                    <Star
                                       key={index}
                                       classNameUser={styles.unfilledStar}
                                       disabled={isVoting}
                                       onClick={handleStarClick}
                                    ></Star>
                                 );
                              }
                           })}
                        </div>
                        <div className={styles.ratingInfo}>
                           <strong>{Number(restaurantList.average_rating || 0).toFixed(1)}</strong>
                           <span>({restaurantList.rating_count})</span>
                        </div>
                     </div>
                  </div>
               </footer>
            </div>
         </div>
      </>
   );
};

export default RestaurantCard;
