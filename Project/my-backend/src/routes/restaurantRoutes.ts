import { Router } from "express";
import {
   restaurants,
   ratingRestaurants,
   getUserRatingHistory,
   SponsorshipRestaurant,
   restaurantTags,
} from "../controllers/restaurantController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const restaurantRouter = Router();

// Public route: anyone can get the list of restaurants
restaurantRouter.get("/", restaurants);

//  Protected route: only authenticated users can rate a restaurant
// The request will first go through `authenticateToken` middleware.
restaurantRouter.patch("/:id/rate", authenticateToken, ratingRestaurants);

restaurantRouter.get("/rate_history", authenticateToken, getUserRatingHistory);

// get sponsorships
restaurantRouter.get("/sponsors", SponsorshipRestaurant);

// get restaurant tags
restaurantRouter.get("/restaurantTags",restaurantTags)

export default restaurantRouter;
