import { useState, useEffect } from "react";

import styles from "../components/styles/Home.module.css";
import RestaurantCard from "../components/RestaurantCard";

interface homePageProps {
   sectionTitle: string;
}
// export the types of restaurants in useState
export interface Restaurant {
   id: string; // Or number, but string is safer for database IDs
   rank: number;
   name: string;
   logoUrl: string;
   description: string;
   tags: string[];
   upvotes: number;
   downvotes: number;
}

const HomePage = ({ sectionTitle }: homePageProps) => {
   // State to hold the list of restaurants
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

   // useEffect to fetch the data(json) from api of restaurants and use setRestaurants to store the data in the state
   useEffect(() => {
      return () => {};
   }, []);

   return (
      <div className={styles.homeContentCon}>
         <title>Home</title>
         <h1>{sectionTitle}</h1>
         {restaurants.map((restaurant) => {
            return <RestaurantCard key={restaurant.id} restaurant={restaurant}></RestaurantCard>;
         })}
      </div>
   );
};

export default HomePage;
