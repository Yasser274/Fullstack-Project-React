import { useState, useEffect } from "react";

import styles from "../components/styles/Home.module.css";
import RestaurantCard from "../components/RestaurantCard";
import { API_BASE_URL } from "../config/config";

// export the types of restaurants in useState
export interface Restaurant {
   id: string; // Or number, but string is safer for database IDs
   restaurant_name: string;
   restaurant_logo: string;
   description: string;
   tags?: string[];
   rating_count: number;
   average_rating: number;
   reviews: Review[];
}

export interface Review {
   comment?: string | null;
   rating: number;
   reviewedAt: string;
   user: {
      username: string;
      profilePictureURL: string;
      id: number;
   };
}

// just an example on how to extract and use just one type in an interfae
// type RestaurantID = Restaurant["id"]

const HomePage = () => {
   // State to hold the list of restaurants
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   const [sortBy, setSortBy] = useState<string>("");

   // useEffect to fetch the data(json) from api of restaurants and use setRestaurants to store the data in the state
   useEffect(() => {
      const fetchRestaurantsList = async () => {
         try {
            const response = await fetch(`${API_BASE_URL}/api/restaurants`);
            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || "Failed to fetch data from the server.");
            }
            const data = await response.json(); // Get the full object first
            const restaurantsArray: [] = data.restaurantsData; // Then extract the array from the 'restaurantsData' property
            if (restaurantsArray.length <= 0) {
               setError("Nothing in the database yet");
            }
            setRestaurants(restaurantsArray);
         } catch (error: any) {
            setError(error);
         } finally {
            // when both try or catch finishes this runs and it takes away the loading render from the website
            setIsLoading(false);
         }
      };
      fetchRestaurantsList();
   }, []);

   const handleVoteUpdate = (updatedRestaurantDataFromServer: Partial<Restaurant>) => {
      setRestaurants((currentRestaurants) => {
         return currentRestaurants.map((restaurant) => {
            if (restaurant.id === updatedRestaurantDataFromServer.id) {
               return { ...restaurant, ...updatedRestaurantDataFromServer };
            }
            return restaurant;
         });
      });
   };

   return (
      <div className={styles.homeContentCon}>
         <title>Home</title>
         {error ? error : ""}
         {isLoading ? (
            <h2>Loading...</h2>
         ) : (
            <div className={styles.titleAndSort}>
               <h2 style={{ textAlign: "center" }}>
                  Trending Restaurants <br />
                  this Month
               </h2>
               <select name="sorting">
                  <option value="" disabled>
                     Sort by..
                  </option>
                  <option value="mostVotes">Most Votes</option>
                  <option value="mostVotes">Most Likes Votes</option>
                  <option value="mostVotes">Most Dislike Votes</option>
               </select>
            </div>
         )}
         {restaurants.map((restaurant, index: number) => {
            return (
               <RestaurantCard
                  key={restaurant.id}
                  restaurantList={restaurant}
                  rank={index + 1}
                  handleVoteUpdate={handleVoteUpdate}
               ></RestaurantCard>
            );
         })}
      </div>
   );
};

export default HomePage;
