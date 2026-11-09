import { Router } from "express";
import {
   getAdminOverview,
   getAdminUploadUrl,
   createRestaurant,
   updateRestaurant,
   createTag,
   createSponsor,
   updateSponsor,
   deleteSponsor,
} from "../controllers/adminController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const adminRouter = Router();

// every admin route goes through 2 bouncers: logged in (authenticateToken) AND in ADMIN_USER_IDS (requireAdmin)
adminRouter.use(authenticateToken, requireAdmin);

// everything the admin page shows (restaurants, tags, sponsors)
adminRouter.get("/overview", getAdminOverview);

// presigned S3 link to upload a logo or banner
adminRouter.get("/upload-url", getAdminUploadUrl);

// restaurants
adminRouter.post("/restaurants", createRestaurant);
adminRouter.patch("/restaurants/:id", updateRestaurant);

// tags
adminRouter.post("/tags", createTag);

// sponsors
adminRouter.post("/sponsors", createSponsor);
adminRouter.patch("/sponsors/:id", updateSponsor);
adminRouter.delete("/sponsors/:id", deleteSponsor);

export default adminRouter;
