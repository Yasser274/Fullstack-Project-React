//. These files act as the "menu" for your API. They define the paths and connect them to the controller functions.  i mean the routes
import { Router } from "express";
import {
   changePassword,
   changeProfilePic,
   getProfilePicUploadUrl,
   loginUser,
   registerUser,
} from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const userRouter = Router();

// When a POST request is made to '/api/login', call the loginUser controller
userRouter.post("/login", loginUser);

// When a POST request is made to '/api/register', call the registerUser controller
userRouter.post("/register", registerUser);

// Change password /api/changePassword
userRouter.patch("/changePassword", authenticateToken, changePassword);

// get a presigned S3 URL to upload the new profile picture
userRouter.get("/profilePicUploadUrl", authenticateToken, getProfilePicUploadUrl);

// save the uploaded picture's filename and return a new token
userRouter.patch("/changePic", authenticateToken, changeProfilePic);

export default userRouter;
