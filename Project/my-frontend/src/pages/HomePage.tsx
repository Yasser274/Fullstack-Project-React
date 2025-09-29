import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "../components/styles/Home.module.css";
// import the useInView hook i created for animations when section appear
import useInView from "../components/common/useInView";

import RestaurantCard from "../components/RestaurantCard";
import { API_BASE_URL } from "../config/config";
import SearchBar from "../components/common/SearchBar";
import Loading from "../assets/icons/Loading";
import Pagination from "../components/Pagination";
import Sponsored from "../components/Sponsored";
// for translations
import { useTranslation } from "react-i18next";
import TagsFilter from "../components/TagsFilter";

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

export interface sponsorsProps {
   id: number;
   banner_image_url: string;
   restaurant_name: string;
   restaurant_logo: string;
}
export interface tagsPropsListAPI {
   id: number;
   tagname: string;
}

// just an example on how to extract and use just one type in an interface
// type RestaurantID = Restaurant["id"]

const HomePage = () => {
   // *for animation when section appears

   // sectionRef is the ref to attach elements to and isSectionVisible is true or false gotten from useInView
   const [sectionRef, isSectionVisible] = useInView<HTMLDivElement>({
      threshold: 0.1, // Trigger when 10% of the element is visible
      triggerOnce: true,
   });
   const [section2Ref, isSection2Visible] = useInView<HTMLDivElement>({
      threshold: 0.1,
      triggerOnce: true,
   });
   const [section3Ref, isSection3Visible] = useInView<HTMLDivElement>({
      threshold: 0.1,
      triggerOnce: true,
   });
   const [section4Ref, isSection4Visible] = useInView<HTMLDivElement>({
      threshold: 0.1,
      triggerOnce: true,
   });
   // State to hold the list of restaurants FOR THE CURRENT PAGE
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

   // Get the search params object and the function to update them (for page current number,sortingBy,search)
   const [searchParams, setSearchParams] = useSearchParams();
   // Read the 'page,sortBy' parameter from the URL.
   const currentPage = parseInt(searchParams.get("page") || "1", 10);
   const sortBy = searchParams.get("sortBy");

   const [totalPages, setTotalPages] = useState<number>(0);

   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [nothingFound, setNothingFound] = useState<string | null>(null);

   const [searchTerm, setSearchTerm] = useState<string | null>(null);

   // store sponsors
   const [sponsorsList, setSponsorsList] = useState<null | sponsorsProps[]>(null);

   // store tags
   const [tags, setTags] = useState<tagsPropsListAPI[] | null>(null);
   // stored selected tags by user
   const [selectedTag, setSelectedTag] = useState<number[]>(() => {
      // get all parameters named tags from current  URL
      const tagsFromUrl = searchParams.getAll("tags"); // EX ([ "2", "4" ])

      const tagsArray = tagsFromUrl.map((tag) => parseInt(tag, 10)).filter((tagId) => !isNaN(tagId)); // if there was a string in the url that couldn't be converted filter it (Not a number (NaN))
      return tagsArray;
   });
   console.log(selectedTag);

   const { t, i18n } = useTranslation();

   // this will be passed into Pagination comp
   const handlePageChange = (pageNumber: number) => {
      // This will update the URL to, for example, "/?page=2"

      // without overwriting the whole Params and removing sortBy just access the prevParamas and set the new page value to new page just clicked
      setSearchParams((prevParams) => {
         prevParams.set("page", pageNumber.toString());
         return prevParams;
      });
   };

   // useEffect to add selected tags into the URL
   useEffect(() => {
      const handleTagChange = () => {
         //it's crucial to remove any existing 'tags' parameters
         // This handles the case where a user deselects a tag.
         setSearchParams((prevParams) => {
            prevParams.delete("tags");

            // now add all currently selected tags into the URL
            selectedTag.forEach((tagId) => {
               prevParams.append("tags", tagId.toString());
            });

            // when a tag is selected or removed reset page number to 1
            prevParams.set("page", "1");
            return prevParams;
         });
      };
      handleTagChange();
   }, [selectedTag]);

   // * fetch tags
   useEffect(() => {
      const fetchTags = async () => {
         const response = await fetch(`${API_BASE_URL}/api/restaurants/restaurantTags`);

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || `Fetching tags went wrong (Frontend)`);
         }
         setTags(data.tagsData);
      };
      fetchTags();
   }, []);

   //* fetch sponsors
   useEffect(() => {
      const getSponsors = async () => {
         const currentLanguage = i18n.language.split("-")[0];

         const params = new URLSearchParams({
            lang: currentLanguage,
         });

         try {
            const response = await fetch(`${API_BASE_URL}/api/restaurants/sponsors?${params.toString()}`, {
               method: "GET",
               headers: {
                  "Content-Type": "application/json",
               },
            });
            const data = await response.json();
            if (!response.ok) {
               throw new Error(`Failed to fetch sponsors list`);
            }
            setSponsorsList(data.sponsorsData);
         } catch (error) {
            console.error("Retrieving sponsors went wrong", error);
            return;
         }
      };
      getSponsors();
   }, [i18n.language]);

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

         // Language
         const currentLanguage = i18n.language.split("-")[0];

         // this stores all params for me to use in the API URL (just the same setSearchParams but in URL form (string query))
         const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "15", // how many restaurants to show in a page
            sortBy: sort,
            lang: currentLanguage,
         });

         // Selected Tags if user selected any
         if (selectedTag.length > 0) {
            console.log(selectedTag);
            selectedTag.forEach((tagId) => {
               params.append("tags", tagId.toString());
               console.log(params.toString());
            });
         }
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
   }, [currentPage, sortBy, searchTerm, i18n.language, selectedTag]);

   const handleVoteUpdate = (updatedRestaurantDataFromServer: Restaurant[]) => {
      if (!updatedRestaurantDataFromServer || updatedRestaurantDataFromServer.length === 0) {
         return; // Guard against empty or null data
      }

      const updatedRestaurant = updatedRestaurantDataFromServer[0]; // Get the object from the array
      console.log(updatedRestaurant);

      setRestaurants((currentRestaurants) => {
         return currentRestaurants.map((restaurant) => {
            if (restaurant.id === updatedRestaurant.id) {
               console.log(updatedRestaurant);
               return { ...restaurant, ...updatedRestaurant };
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
         <div
            className={`${styles.titleAndSort} ${isSectionVisible ? styles.titleAndSortVisible : ""}`}
            ref={sectionRef}
         >
            <h2 style={{ textAlign: "center" }}>{t("TrendingRes")}</h2>
         </div>
         <div
            className={`${styles.searchBarCon} ${isSection2Visible ? styles.searchBarConVisible : ""}`}
            ref={section2Ref}
         >
            <SearchBar
               searchBarText={searchTerm}
               onChangeText={setSearchTerm}
               placeholderText={t("searchRestaurant")}
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
                  {t("sort")}
               </option>
               <option value="highestRating">{t("sortByHighest")}</option>
               <option value="lowestRating">{t("sortByLowest")}</option>
            </select>

            <TagsFilter
               tagsList={tags}
               selectedTagsList={selectedTag}
               selectTagsFun={setSelectedTag}
            ></TagsFilter>
         </div>
         <div
            ref={section3Ref}
            className={`${styles.sponsoredDiv} ${isSection3Visible ? styles.sponsoredDivVisible : ""}`}
         >
            <Sponsored slidesList={sponsorsList}></Sponsored>
         </div>
         <div
            className={`${styles.restaurantsCon} ${isSection4Visible ? styles.restaurantsConVisible : ""}`}
            ref={section4Ref}
         >
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
