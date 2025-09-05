//. These files act as the "menu" for your API. They define the paths and connect them to the controller functions.  i mean the routes
import { Router } from "express";
import { loginUser, registerUser } from "../controllers/userController.js";

const userRouter = Router();

// When a POST request is made to '/api/login', call the loginUser controller
userRouter.post("/login", loginUser);

// When a POST request is made to '/api/register', call the registerUser controller
userRouter.post("/register", registerUser);

export default userRouter;
