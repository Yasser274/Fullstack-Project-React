import { useState, useEffect } from "react";

import styles from "../components/styles/Home.module.css";
import RestaurantCard from "../components/RestaurantCard";
import { API_BASE_URL } from "../config/config";
import SearchBar from "../components/common/SearchBar";
import Loading from "../assets/icons/Loading";

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
   rank: number;
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
   // sort restaurants by ranking
   const sortedRestaurants = [...restaurants].sort((a, b) => b.average_rating - a.average_rating);
   const rankedRestaurants = sortedRestaurants.map((restaurant, index) => {
      return { ...restaurant, rank: index + 1 };
   });

   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   const [sortBy, setSortBy] = useState<string>("");

   const [searchBarV, setSearchBarV] = useState<string>("");

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
   // . filter by name (searchBar)

   // every time we set new value inside searchBarV(state) it renders so this runs with the new value inside the searchbar
   const filteredRestaurants: Restaurant[] = rankedRestaurants.filter((rest: Restaurant) => {
      // return the new filtered array if searchbar is empty In JavaScript, anyString.includes("") is always true. An empty string is technically "found" at the beginning of any other string. Result: The function will return true for every single restaurant letting everything in the new array.
      // but if it finds in searchbar closely matched something in restaurant_name it will return true for that one meaning let it in the new array
      return rest.restaurant_name.toLowerCase().includes(searchBarV.toLowerCase());
   });

   const handleVoteUpdate = (updatedRestaurantDataFromServer: Partial<Restaurant>) => {
      setRestaurants((currentRestaurants) => {
         return currentRestaurants.map((restaurant) => {
            if (restaurant.id === updatedRestaurantDataFromServer.id) {
               console.log(updatedRestaurantDataFromServer);
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
         <div className={styles.titleAndSort}>
            <h2 style={{ textAlign: "center" }}>
               Trending Restaurants <br />
               this Month
            </h2>
         </div>
         <div className={styles.searchBarCon}>
            <SearchBar
               searchBarText={searchBarV}
               onChangeText={setSearchBarV}
               placeholderText="Search for restaurant by name"
               classNameStyle={styles.searchBarS}
               classNameCon={styles.searchBarDivCon}
               searchBarIcon={styles.searchBarIcon}
            ></SearchBar>
            <select name="sorting">
               <option value="" disabled>
                  Sort by..
               </option>
               <option value="mostVotes">Most Votes</option>
               <option value="mostVotes">Most Likes Votes</option>
               <option value="mostVotes">Most Dislike Votes</option>
            </select>
         </div>
         <div className={styles.restaurantsCon}>
            {/* if isLoading is true it will display the loading animation  */}
            {isLoading ? (
               <div style={{ justifyContent: "center", display: "flex", marginTop: "20px" }}>
                  <Loading></Loading>
               </div>
            ) : //if not it will check filteredRestaurants if it has stuff in it will display the restaurants
            //  if not after user searches for something and the state became empty it will display nothing was found
            filteredRestaurants.length >= 1 ? (
               filteredRestaurants.map((restaurant) => {
                  return (
                     <RestaurantCard
                        key={restaurant.id}
                        restaurantList={restaurant}
                        rank={restaurant.rank}
                        handleVoteUpdate={handleVoteUpdate}
                     ></RestaurantCard>
                  );
               })
            ) : (
               <div style={{ marginTop: "3.1rem" }}>
                  <h2>No Matches Found</h2>
                  <p>Try searching for a different restaurant name.</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default HomePage;
