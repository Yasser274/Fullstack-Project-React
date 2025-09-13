import { useEffect, useState } from "react";
import styles from "../components/styles/Home.module.css";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../context/AuthContext&Global";
import StarFilled from "../assets/icons/StarFilled";

interface rateHistoryT {
   restaurant_id: number;
   rating: number;
   reviewed_at: string;
   restaurant_name: string;
   restaurant_logo: string;
   comment?: string;
}

const ProfileVotesHistory = () => {
   const [rateHistory, setRateHistory] = useState<rateHistoryT[] | null>(null);

   const [error, setError] = useState<string>("");

   const [isLoading, setIsLoading] = useState<boolean>(true);

   const { user } = useAuth();

   //  get user rating history
   useEffect(() => {
      const fetchRatingHistory = async () => {
         if (!user) {
            console.error("User is not authenticated. Cannot vote.");
            setIsLoading(false);
            return;
         }
         const authToken = localStorage.getItem("token");
         if (!authToken) {
            console.error("Authentication error: Token not found");
            return;
         }
         try {
            const response = await fetch(`${API_BASE_URL}/api/restaurants/rate_history`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
               },
            });
            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || "Failed to fetch user's rating history");
            }
            const data = await response.json();
            const ratingHistoryArr: [] = data.reviewsHistory;
            if (ratingHistoryArr.length <= 0 && response.status === 204) {
               setError(data.displayMessage);
            }
            setRateHistory(ratingHistoryArr);
         } catch (error: any) {
            setError(error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchRatingHistory();
   }, []);

   return (
      <div className={styles.votesHistoryCon}>
         {rateHistory === null || rateHistory.length <= 0 ? (
            <div>{error}</div>
         ) : (
            rateHistory.map((rateH, index) => {
               const showStarsRating = () => {
                  const ratingUserArrayLength = [...Array(rateH.rating)];
                  const ratingStars = ratingUserArrayLength.map((_,index) => (
                     <StarFilled key={index} className={styles.filledStarProfile}></StarFilled>
                  ));
                  return ratingStars;
               };
               return (
                  <div className={styles.eachRateHistory} key={index}>
                     <div className={styles.topHistoryDetails}>
                        <div className={styles.resLogoCon}>
                           <img
                              src={rateH.restaurant_logo}
                              alt={`logo of ${rateH.restaurant_name}`}
                              className={styles.historyLogo}
                           />
                        </div>
                        <div className={styles.timeHistoryCon}>
                           Timestamp:{" "}
                           {new Date(rateH.reviewed_at).toLocaleString([], {
                              hour12: true,
                           })}
                        </div>
                     </div>
                     <div className={styles.bottomHistoryDetails}>
                        <div className={styles.resturVoteInfo}>
                           <div className={styles.resturVoteName}>{rateH.restaurant_name}</div>
                           <div className={styles.resturVoteRatingCon}>
                              <div className={styles.resturVoteInfoRating}>Rated:</div>
                              <div className={styles.resturVoteInfoRating}>{showStarsRating()}</div>
                           </div>
                        </div>
                        <div className={styles.resturReviewCommentCon}>
                           {rateH.comment ? "Comment:" : "No comment"}
                           <p>{rateH.comment}</p>
                        </div>
                     </div>
                  </div>
               );
            })
         )}
      </div>
   );
};

export default ProfileVotesHistory;
