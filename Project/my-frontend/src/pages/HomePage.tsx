import { useState, useEffect } from "react";

import styles from "../components/styles/Home.module.css";
import RestaurantCard from "../components/RestaurantCard";
import { API_BASE_URL } from "../config/config";

// export the types of restaurants in useState
export interface Restaurant {
   id: string; // Or number, but string is safer for database IDs
   restaurantname: string;
   restaurantlogo: string;
   description: string;
   tags?: string[];
   upvotes: number;
   downvotes: number;
   score: number;
}

// just an example on how to extract and use just one type in an interfae
// type RestaurantID = Restaurant["id"]

const HomePage = () => {
   // State to hold the list of restaurants
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
   const [tags, setTags] = useState([]);

   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

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

   return (
      <div className={styles.homeContentCon}>
         <title>Home</title>
         {error ? error : ""}
         {isLoading ? <h2>Loading...</h2> : <h2>Trending Restaurants</h2>}
         {restaurants.map((restaurant, index: number) => {
            return <RestaurantCard key={restaurant.id} restaurant={restaurant} rank={index + 1}></RestaurantCard>;
         })}
      </div>
   );
};

export default HomePage;
