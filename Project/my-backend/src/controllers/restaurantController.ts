import express, { type Request, type Response } from "express";
import { pool } from "../config/database.js";

// * get restaurants list function
export const restaurants = async (req: Request, res: Response) => {
   try {
      const restaurantsList = `WITH
  tags_agg AS (
    -- Step 1: Create a temporary table with each restaurant's tags pre-aggregated into an array.
    SELECT
      rt.restaurant_id,
      ARRAY_AGG(t.tagName) AS tags
    FROM
      restaurant_tags AS rt
      JOIN tags AS t ON t.id = rt.tag_id
    GROUP BY
      rt.restaurant_id
  ),
  reviews_agg AS (
    -- Step 2: Create another temporary table with each restaurant's reviews pre-aggregated into a JSON array.
    SELECT
      rw.restaurant_id,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'comment',
          rw.comment,
          'rating',
          rw.rating,
          'reviewedAt',
          rw.reviewed_at,
          'user',
          JSON_BUILD_OBJECT('username', u.username, 'profilePictureURL', u.profile_picture_url, 'userID', u.id)
        )
        ORDER BY
          rw.reviewed_at DESC -- Good practice to order reviews
      ) AS reviews
    FROM
      restaurant_reviews AS rw
      JOIN users AS u ON rw.user_id = u.id
    GROUP BY
      -- This is crucial: we group all rows by the restaurant id so just one row for each restaurant
      rw.restaurant_id
  )
  -- Step 3: Now, join the main restaurants table to your pre-aggregated results.
  -- These are now clean one-to-one joins, preventing any row duplication.
SELECT
  r.id,
  r.restaurant_name,
  r.restaurant_logo,
  r.description,
  r.rating_count,
  r.average_rating,
  COALESCE(ta.tags, '{}') AS tags,
  COALESCE(ra.reviews, '[]'::json) AS reviews
FROM
  restaurants AS r
  LEFT JOIN tags_agg AS ta ON r.id = ta.restaurant_id
  LEFT JOIN reviews_agg AS ra ON r.id = ra.restaurant_id
ORDER BY
  -- As a tie-breaker, the one with more ratings is ranked higher (more trustworthy).
  r.average_rating DESC,
  r.rating_count DESC;
`;
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
   type restaurantRatingComment = {
      ratingAmount: number;
      comment: string;
   };

   const restaurantId: number = Number(req.params.id); // clicked restaurant ID
   const { ratingAmount, comment }: restaurantRatingComment = req.body; // destruct the json and only get voteType from it

   // This is the secure user ID from my middleware
   const userId = req.user!.userId; // the ! means it absolutely exists and don't worry TS it will never be undefined (no Object is possibly 'undefined'.)

   //? if ratingAmount gotten from frontend req.body (request payload)
   // Input validation
   if (!Number.isInteger(ratingAmount) || ratingAmount < 1 || ratingAmount > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5." });
   }
   if (comment.length > 1300) {
      return res.status(401).json({ message: "Passed Character Limit" });
   }

   // if user already has rated this restaurant the same amount of rating like already rated 2 stars then went back to rate 2 stars again
   const checkRatedSameAlready = `SELECT rating FROM restaurant_reviews WHERE user_id = $1 AND restaurant_id = $2`;
   const { rows: checkRatedSameAlreadyDB } = await pool.query(checkRatedSameAlready, [userId, restaurantId]);
   if (checkRatedSameAlreadyDB[0].rating === ratingAmount) {
      console.error("You already rated the same value");
      return;
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
      const reviewQuery = `INSERT INTO restaurant_reviews (user_id,restaurant_id,rating,comment) VALUES ($1,$2,$3,$4)
        ON CONFLICT (user_id,restaurant_id) DO UPDATE SET rating = EXCLUDED.rating,reviewed_at = CURRENT_TIMESTAMP,comment = EXCLUDED.comment
        RETURNING *`; // RETURNING * so i got all the other columns data on the same query saving bandwidth

      await client.query(reviewQuery, [userId, restaurantId, ratingAmount, comment]);

      // this updates restaurants table after receiving the review from a user also calculating average rating for this restaurant
      const updateRestaurantQuery = `WITH new_stats AS (
        SELECT 
          AVG(rating)::NUMERIC(3,2) as new_average, 
          COUNT(rating) as new_count
      FROM restaurant_reviews 
      WHERE restaurant_id = $1) 
      UPDATE restaurants SET average_rating = (SELECT new_average FROM new_stats), rating_count = (SELECT new_count FROM new_stats) 
      WHERE id = $1 RETURNING *;`;

      await client.query(updateRestaurantQuery, [restaurantId]);

      // Step 3: If both queries succeeded, commit the changes to the database.
      await client.query("COMMIT");
      const finalDataQuery = `
         SELECT
            r.*, -- Select all columns from the restaurants table
            -- Use json_agg to gather all associated reviews into a single JSON array
            -- COALESCE ensures we get an empty array '[]' if there are no reviews, not NULL
            COALESCE(
               (SELECT json_agg(json_build_object(
                  'rating', rr.rating,
                  'comment', rr.comment,
                  'reviewedAt', rr.reviewed_at,
                  'user', json_build_object(
                     'id', u.id,
                     'username', u.username,
                     'profilePictureURL', u.profile_picture_url
                  )
               ))
               FROM restaurant_reviews rr
               JOIN users u ON rr.user_id = u.id
               WHERE rr.restaurant_id = r.id),
            '[]'::json
            ) as reviews
         FROM restaurants r
         WHERE r.id = $1;
      `;

      const { rows: completeRestaurantData } = await client.query(finalDataQuery, [restaurantId]);

      return res.status(200).json({
         message: `You Rated successfully`,
         displayMessage: `You Rated Successfully`,
         // Send the new, complete data object
         restaurantsData: completeRestaurantData,
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
      const RatingHistory = `SELECT
        rr.restaurant_id,
        rr.rating,
        rr.reviewed_at,
        rr.comment,
        r.restaurant_name,
        r.restaurant_logo
      FROM
        restaurant_reviews AS rr
        JOIN restaurants AS r ON rr.restaurant_id = r.id
      WHERE
        user_id = $1;`;

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
