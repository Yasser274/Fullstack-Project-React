import express, { type Request, type Response } from "express";
import { pool } from "../config/database.js";

// * get restaurants list function
export const restaurants = async (req: Request, res: Response) => {
   // Get current page and limit from query params(like ?page=1),default values

   const page = parseInt(req.query.page as string) || 1; // since we will be getting the page from the url it will be a string so convert it to number
   const limit = parseInt(req.query.limit as string) || 1;
   const sortByQuery = (req.query.sortBy as string)?.toUpperCase(); // grab param and uppercase it
   const lang = req.query.lang === "en" ? "en" : "ar"; // grab the current language
   console.log(lang);
   // if user entered value to search
   const searchTerm = await req.query.searchT;
   let searchPattern: string | undefined = "";
   if (searchTerm) {
      // If the user searched for something, wrap it in wildcards
      // % means “match any sequence of characters”.
      // %% means “match anything at all” → so it will return every row.

      searchPattern = `%${searchTerm}%`;
   } else {
      // If the user did not search for anything ignore filtering
      searchPattern = `%%`;
   }

   const allowedSortValues = ["DESC", "ASC"];
   const sort = allowedSortValues.includes(sortByQuery) ? sortByQuery : "DESC"; // if sortByQuery value is inside allowedSortValues use it if not default to DESC

   // Calculate the OFFSET for the database
   // This is the number of rows to skip. For page 1, we skip 0. For page 2, we skip 10.
   const offset = (page - 1) * limit;
   try {
      // Modified my main query to include LIMIT and OFFSET instead of getting all restaurants at one time
      // it's important that LIMIT and OFFSET comes after ORDER BY clause
      const restaurantsListQuery = `WITH
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
   ),
   -- Step 3: Pre rank all restaurants 
   ranked_restaurants AS (
      SELECT
         *,
         -- It calculates the rank over the entire ordered dataset
         RANK() OVER (
         ORDER BY
            average_rating DESC,
            rating_count DESC
         ) AS RANK
      FROM
         restaurants
   )
   -- Step 4: Now, join the main restaurants table to your pre-aggregated results.
   -- These are now clean one-to-one joins, preventing any row duplication.
   SELECT
   r.id,
   rtt.name AS restaurant_name,
   r.restaurant_logo,
   rtt.description,
   r.rating_count,
   r.average_rating,
   r.rank, -- The rank is now just a column we can select
   COALESCE(ta.tags, '{}') AS tags,
   COALESCE(ra.reviews, '[]'::json) AS reviews
   FROM
   ranked_restaurants AS r
   LEFT JOIN tags_agg AS ta ON r.id = ta.restaurant_id
   LEFT JOIN reviews_agg AS ra ON r.id = ra.restaurant_id
   LEFT JOIN restaurant_translations AS rtt ON rtt.restaurant_id = r.id
   -- The search filter is now applied *after* the ranking was calculated
   WHERE
   rtt.name ILIKE $1 AND rtt.language_code = $2
   ORDER BY
   -- As a tie-breaker, the one with more ratings is ranked higher (more trustworthy).
   r.average_rating ${sort},
   r.rating_count DESC
   -- LIMIT the top amount(like 4 (top 4)) and OFFSET (skip the first row for example 1) now this example will show not the top 4 but the top 2-3-4-5
   LIMIT
   $3
   OFFSET
   $4
`;
      // another query to get the total number of restaurants and so frontend knows how many pages are there (how many rows are in restaurants table)
      const countQuery = `SELECT COUNT(*) from restaurants AS r LEFT JOIN restaurant_translations AS rtt ON rtt.restaurant_id = r.id WHERE rtt.name ILIKE $1 AND rtt.language_code = $2`;

      // Execute both queries. Using Promise.all is slightly more efficient
      // as it runs them in parallel.
      const [restaurantsResult, countResult] = await Promise.all([
         pool.query(restaurantsListQuery, [searchPattern, lang, limit, offset]),
         pool.query(countQuery, [searchPattern, lang]),
      ]);

      const { rows: restaurants } = restaurantsResult;
      const totalItems = parseInt(countResult.rows[0].count);

      // Calculate total pages
      const totalPage = Math.ceil(totalItems / limit);

      if (restaurants.length <= 0 && page > 1) {
         // This can happen if the user requests a page that doesn't exist
         return res.status(404).json({ message: `Page not found` });
      }

      if (restaurants.length <= 0) {
         return res.status(200).json({
            message: `No restaurants found matching your search.`,
            restaurantsData: [],
            totalPage: 0,
            totalItems: 0,
         });
      }
      res.status(200).json({
         message: `Sent successfully`,
         restaurantsData: restaurants,
         totalPages: totalPage,
         totalItemsCount: totalItems,
      });
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
   if (checkRatedSameAlreadyDB.length >= 1) {
      const existingRating = checkRatedSameAlreadyDB[0].rating;
      if (existingRating === ratingAmount) {
         console.error("You already rated the same value");
         return res.status(409).json({ message: `You have already submitted this rating` });
      }
   }

   const client = await pool.connect();
   console.log(`---------- STARTING RATING`);
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
   const lang = req.query.lang === "en" ? "en" : "ar";
   console.log(lang);
   try {
      const RatingHistory = `SELECT
        rr.restaurant_id,
        rr.rating,
        rr.reviewed_at,
        rr.comment,
        rtt.name AS restaurant_name,
        r.restaurant_logo
      FROM
        restaurant_reviews AS rr
        JOIN restaurants AS r ON rr.restaurant_id = r.id
        LEFT JOIN restaurant_translations AS rtt ON rtt.restaurant_id = r.id
      WHERE
        user_id = $1 AND rtt.language_code = $2;`;

      const { rows: dbRatingHistory } = await pool.query(RatingHistory, [userID, lang]);

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

//. Sponsorship API
export const SponsorshipRestaurant = async (req: Request, res: Response) => {
   const lang = req.query.lang === "en" ? "en" : "ar";

   try {
      const sponsersQuery = `SELECT
  s.id,
  s.banner_image_url,
  rtt.name AS restaurant_name,
  r.restaurant_logo
FROM
  sponsorships AS s
  LEFT JOIN restaurants AS r ON s.restaurant_id = r.id
  LEFT JOIN restaurant_translations AS rtt ON rtt.restaurant_id = r.id
WHERE
  s.is_active = TRUE AND rtt.language_code = $1
ORDER BY
  display_order DESC;`;
      const { rows: sponsorsDb } = await pool.query(sponsersQuery, [lang]);
      return res.status(200).json({ message: "Fetched sponsors successfully.", sponsorsData: sponsorsDb });
   } catch (error) {
      console.error(`Error while fetching sponsors`, error);
      res.status(500).json({ message: `Fetching sponsors went wrong.` });
   }
};
