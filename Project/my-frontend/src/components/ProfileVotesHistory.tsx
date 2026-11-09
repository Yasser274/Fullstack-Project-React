import { useEffect, useState } from "react";
import styles from "../components/styles/Home.module.css";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../context/AuthContext&Global";
import { CalendarIcon, MessageIcon, StarIcon } from "../assets/icons/Icons";
import { useTranslation } from "react-i18next";
import Loading from "../assets/icons/Loading";

interface rateHistoryT {
   restaurant_id: number;
   rating: number;
   reviewed_at: string;
   restaurant_name: string;
   restaurant_logo: string;
   comment?: string;
}

const ProfileVotesHistory = () => {
   const { t, i18n } = useTranslation();

   const [rateHistory, setRateHistory] = useState<rateHistoryT[] | null>(null);

   const [, setError] = useState<string>("");

   // now actually used so the "no ratings" message doesn't flash before the data arrives
   const [isLoading, setIsLoading] = useState<boolean>(true);

   const { user } = useAuth();


   //  get user rating history
   useEffect(() => {
      const fetchRatingHistory = async () => {
         const currentLanguage = i18n.language.split("-")[0];

         // this stores all params for me to use in the API URL (just the same setSearchParams but in URL form (string query))
         const params = new URLSearchParams({
            lang: currentLanguage
         });

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
            const response = await fetch(`${API_BASE_URL}/api/restaurants/rate_history?${params.toString()}`, {
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
            // 204 (No Content) never has a body even if the backend sends json with it, so response.json() would throw here
            if (response.status === 204) {
               setRateHistory([]);
               return;
            }
            const data = await response.json();
            const ratingHistoryArr: rateHistoryT[] = data.reviewsHistory ?? [];
            setRateHistory(ratingHistoryArr);
         } catch (error) {
            console.error(error);
            setError(error instanceof Error ? error.message : String(error));
         } finally {
            setIsLoading(false);
         }
      };
      fetchRatingHistory();
   }, [i18n.language, user]);

   return (
      <div className={styles.votesHistoryCon}>
         {isLoading ? (
            <div className={styles.emptyVoteHistory}>
               <Loading></Loading>
            </div>
         ) : rateHistory === null || rateHistory.length <= 0 ? (
            <div className={styles.emptyVoteHistory}>{t("noVotesHistory")}</div>
         ) : (
            rateHistory.map((rateH, index) => {
               const showStarsRating = () => {
                  // always 5 stars (filled up to the rating, empty after) so every card lines up the same
                  const ratingStars = [...Array(5)].map((_, index) => (
                     <StarIcon
                        key={index}
                        variant={index < rateH.rating ? "full" : "empty"}
                        size={18}
                        className={index < rateH.rating ? styles.filledStarProfile : styles.emptyStarProfile}
                     />
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
                        <div className={styles.resturVoteInfo}>
                           <div className={styles.resturVoteName}>{rateH.restaurant_name}</div>
                           <div className={styles.resturVoteRatingCon}>
                              <span className={styles.visuallyHidden}>{t("votingHistoryRated")}</span>
                              <div className={styles.resturVoteInfoRating}>{showStarsRating()}</div>
                           </div>
                        </div>
                        <div className={styles.timeHistoryCon}>
                           <CalendarIcon size={16} />
                           <span className={styles.visuallyHidden}>{t("votingHistoryTimeStamp")}</span>
                           <time dateTime={rateH.reviewed_at}>
                              {new Date(rateH.reviewed_at).toLocaleString(i18n.language === "ar" ? "ar" : "en-US", {
                                 dateStyle: "medium",
                                 timeStyle: "short",
                                 hour12: true,
                              })}
                           </time>
                        </div>
                     </div>
                     {/* comment shown like a quote bubble under the restaurant */}
                     <div className={`${styles.resturReviewCommentCon} ${rateH.comment ? "" : styles.noCommentHistory}`}>
                        <MessageIcon size={16} />
                        <p>{rateH.comment ? rateH.comment : t("votingHistoryNoComment")}</p>
                     </div>
                  </div>
               );
            })
         )}
      </div>
   );
};

export default ProfileVotesHistory;
