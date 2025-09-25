import express, { type Request, type Response } from "express";
import { pool } from "../config/database.js";

// to read files format etc
import path from "path";
// to hash passwords from users
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // (for Login session)

//* function Login user in
export const loginUser = async (req: Request, res: Response) => {
   // The data from the frontend will be in `req.body`. and the res(Response) will be the backend Response to Frontend
   // try if you can get the data from the frontend if you can't(catch the error)
   try {
      const { username, password } = req.body; // get values of username and password (destruct it from the object)

      const checkUserExists = `SELECT id,username,password_hash,profile_picture_url,email FROM users WHERE username = $1`;
      const { rows: users } = await pool.query(checkUserExists, [username]);
      if (users.length === 0) {
         return res.status(401).json({
            message: `Invalid username or password`,
            error: `auth.login.wrong`,
         });
         // auth.login.wrong is in translation.json in frontend it will recognize that
      }
      // if reached this it means that we found a user with that username so pick the first index in that JSON (since it will only have one)
      const user = users[0];
      //? check password entered with the hashed one in the database (password the user just typed in, hash it again, and then compare the two hashes.)
      const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
      if (isPasswordCorrect === true) {
         // Login Session (kinda like giving the user ID card for the server to remember him later on) (include stuff to be stored in that token like profile pic)
         const payload = {
            userId: user.id,
            username: user.username,
            profilePictureURL: user.profile_picture_url,
            email: user.email,
         };
         const secret = process.env.JWT_SECRET;
         if (!secret) {
            throw new Error("JWT_SECRET is not defined in .env file");
         }
         // create the token
         const token = jwt.sign(payload, secret, { expiresIn: "8h" });

         // Send the token back to the frontend
         return res
            .status(200)
            .json({ message: `Logged In Token`, displayMessage: `auth.login.success`, token: token }); // The frontend will need token!
         // auth.login.success is in translation.json in frontend it will recognize that
      } else {
         return res.status(401).json({ message: `Invalid username or password`, error: `auth.login.wrong` });
      }
   } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: `An internal server error occurred.` });
   }
};

//. function register a user in
export const registerUser = async (req: Request, res: Response) => {
   try {
      const { username, password, confirmPassword, email } = req.body;

      // - VALIDATION CHECKS -

      // 1. Check if passwords match
      if (password !== confirmPassword) {
         // '400 Bad Request' for invalid user input.
         // Send a JSON object with an 'error' key. so that the frontend can display this "error" back to the user
         return res.status(400).json({ error: "auth.register.passwordNotMatch" });
      }
      // 2. Check if the email already exists in the database
      const existingUserQuery = "SELECT * FROM users WHERE email = $1 OR username = $2";
      const { rows: existingUsers } = await pool.query(existingUserQuery, [email, username]);
      if (existingUsers.length > 0) {
         return res.status(409).json({ error: `auth.register.alreadyExist` });
      }

      // hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Store the new user in the database
      // the "$1", "$2" etc are the placeholders to prevent SQL injection attack (it's where i place what's to pass in the query)

      const newUserQuery = `INSERT INTO users (username,password_hash,email) VALUES($1,$2,$3) RETURNING *`; //? Insert the new users and get me the other columns
      // that i didn't select (other than password,username etc (meaning i want ID etc of that user back))
      // to save bandwidth and get everything back instead of querying for the ID and other info

      const { rows: userRows } = await pool.query(newUserQuery, [username, hashedPassword, email]); // destruct the rows and give it alias userRows
      // 'rows[0]' will now contain the new user object { id: ..., username: ..., email: ... }
      const newUser = userRows[0]; // This newUser object will automatically contain the default profile_picture_url from the DB.

      return res.status(201).json({
         message: `got these ${username} ${email}`,
         user: newUser,
         displayMessage: `auth.register.accountCreated`,
      });
   } catch (error) {
      console.error("Registration error", error); // console.log is for the backend and res(is for the frontend)
      res.status(500).json({ error: "An error occurred during registration" });
      return;
   }
};

//. Change password api function
export const changePassword = async (req: Request, res: Response) => {
   interface changePasswordTypes {
      oldPassword: string;
      newPassword: string;
      newConfPassword: string;
   }
   try {
      const { oldPassword, newPassword, newConfPassword }: changePasswordTypes = req.body;

      // This is the secure user ID from my middleware
      const userId = req.user!.userId;
      // - VALIDATION CHECKS -
      if (!oldPassword || !newPassword || !newConfPassword) {
         return res.status(400).json({ message: "All password fields are required." });
      }

      if (newPassword !== newConfPassword) {
         return res.status(400).json({ message: `New password and new password confirmation doesn't match` });
      }
      // Get the current user's hashed password from the DB
      const getCurrentPasswordHashQ = `SELECT password_hash FROM users WHERE id = $1`;
      const { rows: dbGetCurrentPasswordHash } = await pool.query(getCurrentPasswordHashQ, [userId]);
      // if user not found
      if (dbGetCurrentPasswordHash.length === 0) {
         return res.status(404).json({ message: `User not found` });
      }

      // compare current password hash with the new password entered by user
      const currentHashedPassword = dbGetCurrentPasswordHash[0].password_hash;
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, currentHashedPassword);

      // if it matches update the new password
      if (isOldPasswordCorrect === true) {
         const saltRounds = 10;
         const newPasswordHashed = await bcrypt.hash(newPassword, saltRounds);
         const updatePasswordQuery = `UPDATE users SET password_hash = $1 WHERE id = $2`;
         await pool.query(updatePasswordQuery, [newPasswordHashed, userId]);
         console.dir(dbGetCurrentPasswordHash);

         return res.status(200).json({ message: "Changed password successfully" });
      } else {
         // - Passwords DO NOT Match: Send an error ---
         console.error("Not same password");
         return res
            .status(401)
            .json({
               message: "Old password is not correct",
               displayMessage: `auth.changeProfileSettings.incorrectOldPassword`,
            });
      }
   } catch (error) {
      console.error("Error whiling changing user password");
      res.status(500).json({ error: "An error occurred during changing password" });
      return;
   }
};

//. Change profile picture api function
export const changeProfilePic = async (req: Request, res: Response) => {
   try {
      // After Multer runs, the file is NOT in req.body. It's in req.file!
      if (!req.file) {
         return res.status(400).json({ message: `No File was uploaded.` });
      }

      const userId = req.user!.userId; // From my JWT middleware
      const newPicturePath = req.file.filename; // Get the filename where Multer saved the file (e.g., "newPicture-167888...png")

      // Update user's profile picture path in database with the new path of the image he just uploaded and return the path so frontend can get it
      // This now saves the filename to the database then the
      const updateUserPicQuery = `UPDATE users SET profile_picture_url = $1 WHERE id = $2 RETURNING *`;
      const { rows: updatedPic } = await pool.query(updateUserPicQuery, [newPicturePath, userId]);

      if (updatedPic.length === 0) {
         return res.status(404).json({ message: `User not found.` });
      }

      const updatedUser = updatedPic[0];
      // Create a new payload for the new token
      const payload = {
         userId: updatedUser.id,
         username: updatedUser.username,
         profilePictureURL: updatedUser.profile_picture_url, // The new URL!
         email: updatedUser.email,
      };
      // Sign the new token
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET is not defined");
      const token = jwt.sign(payload, secret, { expiresIn: "8h" });

      // Send the new token back in the response
      return res.status(200).json({
         message: `Profile picture updated successfully!`,
         newImageUrl: updatedUser.profile_picture_url,
         token: token,
      });
   } catch (error) {
      console.error("Error Changing profile picture:", error);
      res.status(500).json({ error: `An internal server error occurred.` });
   }
};
