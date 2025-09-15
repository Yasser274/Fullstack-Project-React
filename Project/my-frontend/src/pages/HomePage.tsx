import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import styles from "../components/styles/Home.module.css";
import RestaurantCard from "../components/RestaurantCard";
import { API_BASE_URL } from "../config/config";
import SearchBar from "../components/common/SearchBar";
import Loading from "../assets/icons/Loading";
import Pagination from "../components/Pagination";

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

// just an example on how to extract and use just one type in an interface
// type RestaurantID = Restaurant["id"]

const HomePage = () => {
   // State to hold the list of restaurants FOR THE CURRENT PAGE
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

   // Get the search params object and the function to update them (for page current number,sortingBy,search)
   const [searchParams, setSearchParams] = useSearchParams();
   // Read the 'page,sortBy' parameter from the URL.
   const currentPage = parseInt(searchParams.get("page") || "1", 10);
   const sortBy = searchParams.get("sortBy");

   const [totalPages, setTotalPages] = useState<number>(0);
   // sort restaurants by ranking most high rating to least
   // *TEMP
   // const sortedRestaurants = [...restaurants].sort((a, b) => b.average_rating - a.average_rating);
   // const rankedRestaurants = sortedRestaurants.map((restaurant) => {
   //    return { ...restaurant };
   // });

   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [nothingFound, setNothingFound] = useState<string | null>(null);

   const [searchTerm, setSearchTerm] = useState<string | null>(null);

   // this will be passed into Pagination comp
   const handlePageChange = (pageNumber: number) => {
      // This will update the URL to, for example, "/?page=2"

      // without overwriting the whole Params and removing sortBy just access the prevParamas and set the new page value to new page just clicked
      setSearchParams((prevParams) => {
         prevParams.set("page", pageNumber.toString());
         return prevParams;
      });
   };

   // const handleSortingChange = (sortMethod:string) => {
   //    setSortBy({sort: })
   // }

   // useEffect to fetch the data(json) from api of restaurants and use setRestaurants to store the data in the state
   useEffect(() => {
      const fetchRestaurantsList = async () => {
         // Instead, set a timer. If the fetch finishes before the timer, we cancel it.
         const timer = setTimeout(() => {
            setIsLoading(true);
         }, 300); // Only show loader if fetching takes more than 300ms

         setNothingFound(null);

         // 1. Create a params object. Use strings for values.

         let sort: string = "DESC";
         const sortByParam = searchParams.get("sortBy");

         // if current sortBy value sortBy == lowestRating set sort variable to DESC so i can send this to backend and sort it by highest rating
         if (sortByParam === "lowestRating") {
            sort = "ASC";
         } else if (sortByParam === "highestRating") {
            sort = "DESC";
         }

         // this stores all params for me to use in the API URL (just the same setSearchParams but in URL form (string query))
         const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "15", // how many restaurants to show in a page
            sortBy: sort,
         });
         // when nothing is inside the search bar doesn't run what's inside this useEffect

         //-- search delay so it doesn't hit the API instantly (debounce)
         // i've decided to not debounce and delay the query
         if (searchTerm) {
            params.append("searchT", searchTerm.toString());
            params.set("page", "1");
         }

         try {
            // Append the page and limit to the API URL (limit only gets 15 restaurants per page)
            const response = await fetch(`${API_BASE_URL}/api/restaurants?${params.toString()}`);
            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || "Failed to fetch data from the server.");
            }
            const data = await response.json(); // Get the full object first
            const restaurantsArray: [] = data.restaurantsData; // Then extract the array from the 'restaurantsData' property
            console.log(restaurantsArray)
            if (restaurantsArray.length <= 0) {
               setNothingFound("No restaurants found matching your search.");
               console.log(restaurantsArray);
            }
            setError(null);
            setRestaurants(restaurantsArray);
            setTotalPages(data.totalPages);
         } catch (error: any) {
            setRestaurants([]);
            setError(error.message);
            console.error(error);
         } finally {
            // when both try or catch finishes this runs and it takes away the loading render from the website
            clearTimeout(timer);
            setIsLoading(false);
         }
      };
      fetchRestaurantsList();
   }, [currentPage, sortBy, searchTerm]);
   // . filter by name (searchBar)

   // * TEMP
   // every time we set new value inside searchBarV(state) it renders so this runs with the new value inside the searchbar
   // const filteredRestaurants: Restaurant[] = rankedRestaurants.filter((rest: Restaurant) => {
   //    // return the new filtered array if searchbar is empty In JavaScript, anyString.includes("") is always true. An empty string is technically "found" at the beginning of any other string. Result: The function will return true for every single restaurant letting everything in the new array.
   //    // but if it finds in searchbar closely matched something in restaurant_name it will return true for that one meaning let it in the new array
   //    return rest.restaurant_name.toLowerCase().includes(searchBarV.toLowerCase());
   // });

   const handleVoteUpdate = (updatedRestaurantDataFromServer: Restaurant[]) => {
      if (!updatedRestaurantDataFromServer || updatedRestaurantDataFromServer.length === 0) {
         return; // Guard against empty or null data
      }

      const updatedRestaurant = updatedRestaurantDataFromServer[0]; // Get the object from the array
      console.log(updatedRestaurant)

      setRestaurants((currentRestaurants) => {
         return currentRestaurants.map((restaurant) => {
            if (restaurant.id === updatedRestaurant.id) {
               console.log(updatedRestaurant);
               return { ...restaurant, ...updatedRestaurant};
            }
            return restaurant;
         });
      });
   };

   const PaginationFun = () => {
      return (
         <Pagination
            totalPagesNumber={totalPages}
            changePage={handlePageChange}
            currentPage={currentPage}
         ></Pagination>
      );
   };

   return (
      <div className={styles.homeContentCon}>
         <title>Trend Bites</title>
         <div className={styles.titleAndSort}>
            <h2 style={{ textAlign: "center" }}>
               Trending Restaurants <br />
               this Month
            </h2>
         </div>
         <div className={styles.searchBarCon}>
            <SearchBar
               searchBarText={searchTerm}
               onChangeText={setSearchTerm}
               placeholderText="Search for restaurant by name"
               classNameStyle={styles.searchBarS}
               classNameCon={styles.searchBarDivCon}
               searchBarIcon={styles.searchBarIcon}
            ></SearchBar>
            <select
               name="sorting"
               onChange={(e) =>
                  setSearchParams((prevParams) => {
                     prevParams.set("sortBy", e.target.value);
                     prevParams.set("page", "1"); // Reset to page 1 on new sort
                     return prevParams;
                  })
               }
            >
               <option value="" disabled>
                  Sort by..
               </option>
               <option value="highestRating">Highest Rating</option>
               <option value="lowestRating">Lowest Rating</option>
            </select>
         </div>
         <div className={styles.restaurantsCon}>
            {error ? <div className={styles.notFoundRestaurant}>{error}</div> : ""}

            {/* if isLoading is true it will display the loading animation  */}
            {isLoading ? (
               <div style={{ justifyContent: "center", display: "flex", marginTop: "20px" }}>
                  <Loading></Loading>
               </div>
            ) : //if not it will check restaurants if it has stuff in it will display the restaurants
            //  if not after user searches for something and the state became empty it will display nothing was found
            restaurants.length >= 1 ? (
               restaurants.map((restaurant) => {
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
               <div className={styles.notFoundRestaurantM}>{nothingFound}</div>
            )}
            {isLoading ? null : PaginationFun()}
         </div>
      </div>
   );
};

export default HomePage;
