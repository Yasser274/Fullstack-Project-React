import express, { type Request, type Response } from "express";
import { pool } from "../config/database.js";

// * get restaurants list function
export const restaurants = async (req: Request, res: Response) => {
   try {
      const restaurantsList = `SELECT r.id, r.restaurantname, r.restaurantlogo, r.description, r.rating_count, r.average_rating, COALESCE(ARRAY_AGG(t.tagName)
      FILTER (WHERE t.tagName IS NOT NULL), '{}') AS tags FROM restaurants AS r
      LEFT JOIN restaurant_tags AS rt ON r.id = rt.restaurant_id 
      LEFT JOIN tags AS t ON t.id = rt.tag_id 
      GROUP BY r.id 
      ORDER BY r.average_rating DESC, r.rating_count DESC`;
      const { rows: restaurants } = await pool.query(restaurantsList);
      console.log(restaurants);

      if (restaurants.length <= 0) {
         return res.status(205).json({ message: `Nothing exists in the restaurants database` });
      }
      res.status(200).json({ message: `Sent successfully`, restaurantsData: restaurants });
   } catch (error) {
      console.error("Getting restaurants query went wrong", error);
      res.status(500).json({ error: "An error occurred while getting restaurants" });
   }
};

// .Voting Restaurants
export const ratingRestaurants = async (req: Request, res: Response) => {
   const restaurantId = req.params.id; // clicked restaurant ID
   const { ratingAmount } = req.body; // destruct the json and only get voteType from it

   // This is the secure user ID from my middleware
   const userId = req.user!.userId; // the ! means it absolutely exists and don't worry TS it will never be undefined (no Object is possibly 'undefined'.)

   //? if ratingAmount gotten from frontend req.body (request payload)
   // Input validation
   if (!Number.isInteger(ratingAmount) || ratingAmount < 1 || ratingAmount > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5." });
   }
   const client = await pool.connect();
   try {
      /* // ?A transaction prevents this. It works like this:
            BEGIN TRANSACTION: Tell the bank, "I'm starting a sensitive operation."
            Debit $100 from Savings.
            Credit $100 to Checking.

            If both steps succeed, COMMIT: Tell the bank, "Everything worked. Make the changes permanent."

            If any step fails, ROLLBACK: Tell the bank, "Something went wrong. Undo everything I've done since the BEGIN."*/
      await client.query("BEGIN");

      //? If this is the user's first time voting for this restaurant, this INSERT succeeds
      // ON CONFLICT Check when it finds out that user_id and restaurant_id exist(both are primary keys and both create unique row) if so update the old rating with the new
      // EXCLUDED.rating Take the new rating that the user just submitted and use it to overwrite the old rating in the existing row.
      const reviewQuery = `INSERT INTO restaurant_reviews (user_id,restaurant_id,rating) VALUES ($1,$2,$3)
        ON CONFLICT (user_id,restaurant_id) DO UPDATE SET rating = EXCLUDED.rating
        RETURNING *`; // RETURNING * so i got all the other columns data on the same query saving bandwidth

      await client.query(reviewQuery, [userId, restaurantId, ratingAmount]);

      // this updates restaurants table after receiving the review from a user also calculating average rating for this restaurant
      const updateRestaurantQuery = `WITH new_stats AS (
        SELECT 
          AVG(rating)::NUMERIC(3,2) as new_average, 
          COUNT(rating) as new_count 
      FROM restaurant_reviews 
      WHERE restaurant_id = $1) 
      UPDATE restaurants SET average_rating = (SELECT new_average FROM new_stats), rating_count = (SELECT new_count FROM new_stats) 
      WHERE id = $1 RETURNING *;`;

      const { rows: updatedRestaurants } = await client.query(updateRestaurantQuery, [restaurantId]);

      // Step 3: If both queries succeeded, commit the changes to the database.
      await client.query("COMMIT");

      return res.status(200).json({
         message: `You Rated successfully`,
         displayMessage: `You Rated Successfully`,
         restaurantsData: updatedRestaurants,
      });
   } catch (error) {
      // if something goes wrong with the DB query above ROLLBACK everything
      await client.query("ROLLBACK");
      console.error("Voting restaurants", error);
      res.status(500).json({ error: "An error occurred while voting restaurants" });
   } finally {
      // when finished from try and catch release it
      client.release();
   }
};

// .User Rating History
export const getUserRatingHistory = async (req: Request, res: Response) => {
   // get user ID
   const userID = req.user!.userId;
   try {
      const RatingHistory = `SELECT restaurant_id,rating,reviewed_at FROM restaurant_reviews WHERE user_id = $1`;

      const { rows: dbRatingHistory } = await pool.query(RatingHistory, [userID]);

      if (dbRatingHistory.length <= 0) {
         return res.status(204).json({ message: `No Rating History`, displayMessage: `No Rating History.` });
      }
      res.status(200).json({
         message: `Fetched Rating History successfully`,
         reviewsHistory: dbRatingHistory,
      });
   } catch (error) {
      console.error("Fetching Rating history went wrong", error);
      res.status(500).json({ message: `Fetching Rating history went wrong` });
   }
};
