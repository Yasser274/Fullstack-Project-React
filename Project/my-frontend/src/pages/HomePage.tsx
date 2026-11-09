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
import { AlertIcon, ChevronDownIcon, SortIcon, TrendingIcon, UtensilsIcon } from "../assets/icons/Icons";

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

      // scroll back up to the search bar so the user sees the new page from the top (not stuck at the bottom where the buttons are)
      section2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      // without overwriting the whole Params and removing sortBy just access the prevParamas and set the new page value to new page just clicked
      setSearchParams((prevParams) => {
         prevParams.set("page", pageNumber.toString());
         return prevParams;
      });
   };

   // useEffect to add selected tags into the URL
   useEffect(() => {
      // only touch the URL when the tags really changed compared to what's already in it
      // (on page load they are the same because the tags come FROM the URL, without this check opening a shared link like ?page=3 reset it to page 1)
      const tagsInUrl = searchParams.getAll("tags").join(",");
      if (tagsInUrl === selectedTag.join(",")) {
         return;
      }

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
      // searchParams left out on purpose, this should only run when the selected tags change
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedTag, setSearchParams]);

   // * fetch tags
   useEffect(() => {
      const fetchTags = async () => {
         // try/catch so a failed tags request doesn't become an "Uncaught (in promise)" error, the page still works without tags
         try {
            const response = await fetch(`${API_BASE_URL}/api/restaurants/restaurantTags`);

            const data = await response.json();

            if (!response.ok) {
               throw new Error(data.message || `Fetching tags went wrong (Frontend)`);
            }
            setTags(data.tagsData);
         } catch (error) {
            console.error("Retrieving tags went wrong", error);
         }
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
      // since i don't debounce the search, typing fast fires many requests and an older (slower) one could finish last
      // and overwrite the results, so every new run cancels the request from the previous run
      const controller = new AbortController();

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
         // (the page reset to 1 happens in handleSearchChange now, forcing page=1 here made the pagination buttons do nothing while searching)
         if (searchTerm) {
            params.append("searchT", searchTerm.toString());
         }

         try {
            // Append the page and limit to the API URL (limit only gets 15 restaurants per page)
            const response = await fetch(`${API_BASE_URL}/api/restaurants?${params.toString()}`, {
               signal: controller.signal,
            });
            if (!response.ok) {
               const errorData = await response.json();
               // the 404 (page not found) sends "message" not "error"
               throw new Error(errorData.error || errorData.message || "Failed to fetch data from the server.");
            }
            const data = await response.json(); // Get the full object first
            const restaurantsArray: [] = data.restaurantsData; // Then extract the array from the 'restaurantsData' property
            if (restaurantsArray.length <= 0) {
               setNothingFound(t("noRestaurantsFound"));
               console.log(restaurantsArray);
            }
            setError(null);
            setRestaurants(restaurantsArray);
            setTotalPages(data.totalPages ?? 0); // the empty result sends "totalPage" so default to 0
         } catch (error) {
            // cancelled on purpose by a newer request, not a real error
            if (controller.signal.aborted) return;
            setRestaurants([]);
            setError(error instanceof Error ? error.message : String(error));
            console.error(error);
         } finally {
            // when both try or catch finishes this runs and it takes away the loading render from the website
            clearTimeout(timer);
            // a cancelled request leaves the loading state to the newer request
            if (!controller.signal.aborted) {
               setIsLoading(false);
            }
         }
      };
      fetchRestaurantsList();

      return () => controller.abort();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currentPage, sortBy, searchTerm, i18n.language, selectedTag]);

   // when the search text changes go back to page 1 (if i was on page 3 the new results might only have 1 page)
   const handleSearchChange = (text: string) => {
      setSearchTerm(text);
      if (currentPage !== 1) {
         setSearchParams((prevParams) => {
            prevParams.set("page", "1");
            return prevParams;
         });
      }
   };

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
            {/* small badge with the current month (in the site language) */}
            <span className={styles.titleEyebrow}>
               <TrendingIcon size={16} />
               {new Date().toLocaleDateString(i18n.language === "ar" ? "ar" : "en-US", {
                  month: "long",
                  year: "numeric",
               })}
            </span>
            <h2>{t("TrendingRes")}</h2>
            <span className={styles.titleSubText}>{t("TrendingResSub")}</span>
         </div>
         <div
            className={`${styles.searchBarCon} ${isSection2Visible ? styles.searchBarConVisible : ""}`}
            ref={section2Ref}
         >
            <SearchBar
               searchBarText={searchTerm}
               onChangeText={handleSearchChange}
               placeholderText={t("searchRestaurant")}
               classNameStyle={styles.searchBarS}
               classNameCon={styles.searchBarDivCon}
               searchBarIcon={styles.searchBarIcon}
            ></SearchBar>
            {/* wrapper so the sort icon and the chevron (same svg icons as everywhere) can sit on top of the select */}
            <div className={styles.sortWrap}>
               <SortIcon className={styles.controlIcon} size={18} />
               <select
                  name="sorting"
                  aria-label={t("sort")}
                  className={styles.sortSelect}
                  // controlled by the URL so after a refresh it still shows what the list is sorted by
                  value={sortBy ?? ""}
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
               <ChevronDownIcon className={styles.sortChevron} size={18} />
            </div>

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
            {error ? (
               <div className={styles.emptyState}>
                  <AlertIcon size={40} className={styles.emptyStateIconError} />
                  <p>{error}</p>
               </div>
            ) : null}

            {/* if isLoading is true it will display the loading animation  */}
            {isLoading ? (
               <div className={styles.loadingCon}>
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
            ) : nothingFound ? (
               <div className={styles.emptyState}>
                  <UtensilsIcon size={44} className={styles.emptyStateIcon} />
                  <p>{nothingFound}</p>
               </div>
            ) : null}
            {isLoading ? null : PaginationFun()}
         </div>
      </div>
   );
};

export default HomePage;
