import { useEffect, useState } from "react";
import styles from "../components/styles/Home.module.css";
import { API_BASE_URL } from "../config/config";
import { useAuth } from "../context/AuthContext&Global";

interface rateHistoryT {
   restaurant_id: number;
   rating: number;
   reviewed_at: string;
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
               return (
                  <div className={styles.eachRateHistory} key={index}>
                     <div>ID: {rateH.restaurant_id}</div>
                     <div>Rating: {rateH.rating}</div>
                     <div>Timestamp: {rateH.reviewed_at}</div>
                  </div>
               );
            })
         )}
      </div>
   );
};

export default ProfileVotesHistory;
