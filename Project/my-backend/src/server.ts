import express, { type Request, type Response } from "express";
import cors from "cors";
import { Pool } from "pg"; // this is for PostGreSQL DB connections
import "dotenv/config"; // Loads environment variables from .env into process.env

// to hash passwords from users
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // (for Login session)

// Create an instance of the Express application. The `app` object is the heart of my server.
const app = express();
const port = process.env.API_PORT || 3001;

//. Middleware
// It's a security mechanism that browsers use. Since my React frontend(App.tsx) (e.g., on localhost:5173)
// and my Express backend(this server.ts) (e.g., on localhost:3001) are on different "origins", this
// middleware is essential to allow the browser to make API requests from the frontend to the backend.

app.use(cors()); // Sets up CORS so my React frontend can talk to it.
app.use(express.json()); // This is crucial for modern APIs. // It parses incoming request bodies that are in JSON format (e.g. POST requests with JSON payloads)
//? Serve static files from the 'public' directory
// you can access your image directly in the browser via a URL.
// The URL is formed by taking my server address(localhost:3001) and appending the path to the file inside the public folder. The public part itself is invisible in the URL. (localhost:3001/images/default-avatar.png)
app.use(express.static("public"));

// PostgreSQL connection pool get from .env(it hides DB details) file
const pool = new Pool({
   // This is a critical security practice to avoid hardcoding credentials in my source code so no one can see it when i git push this into my repo.
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_DATABASE,
   password: process.env.DB_PASSWORD,
   port: parseInt(process.env.DB_PORT || "5432"),
});

// This creates a simple GET route at the URL index
// When the frontend requests this URL, this function will run.
app.get("/api/test", (req: Request, res: Response) => {
   // We send back a simple JSON object as a response.
   console.log("Running on home page");

   res.send("Backend Started ✅");
});

// . API to get the login/register value from frontend (login)
app.post("/api/login", async (req: Request, res: Response) => {
   // The data from the frontend will be in `req.body`. and the res(Response) will be the backend Response to Frontend
   // try if you can get the data from the frontend if you can't(catch the error)
   try {
      const { username, password } = req.body; // get values of username and password (destruct it from the object)

      const checkUserExists = `SELECT id,username,password_hash,profile_picture_url,email FROM users WHERE username = $1`;
      const { rows: users } = await pool.query(checkUserExists, [username]);
      if (users.length === 0) {
         return res.status(401).json({
            message: `Invalid username or password`,
            error: `Invalid username or password`,
         });
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
            email: user.email
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
            .json({ message: `Logged In Token`, displayMessage: `Logged in Successfully`, token: token }); // The frontend will need token!
      } else {
         return res
            .status(401)
            .json({ message: `Invalid username or password`, error: `Invalid username or password` });
      }
   } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: `An internal server error occurred.` });
   }
});
// . API to create a new user (register)
app.post("/api/register", async (req: Request, res: Response) => {
   try {
      const { username, password, confirmPassword, email } = req.body;

      // - VALIDATION CHECKS -

      // 1. Check if passwords match
      if (password !== confirmPassword) {
         // '400 Bad Request' for invalid user input.
         // Send a JSON object with an 'error' key. so that the frontend can display this "error" back to the user
         return res.status(400).json({ error: "Passwords do not match." });
      }
      // 2. Check if the email already exists in the database
      const existingUserQuery = "SELECT * FROM users WHERE email = $1 OR username = $2";
      const { rows: existingUsers } = await pool.query(existingUserQuery, [email, username]);
      if (existingUsers.length > 0) {
         return res.status(409).json({ error: `An account with this email/username already exists.` });
      }

      // - IF ALL CHECKS PASS, PROCEED -

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
      const newUser = userRows[0];

      return res.status(201).json({
         message: `got these ${username} ${email}`,
         user: newUser,
         displayMessage: `Account Created Successfully`,
      });
   } catch (error) {
      console.error("Registration error", error); // console.log is for the backend and res(is for the frontend)
      res.status(500).json({ error: "An error occurred during registration" });
      return;
   }
});

//? the function is "async" meaning i can use await to wait for the database response after requesting a query
app.get("/api/user", async (req: Request, res: Response) => {
   try {
      //? i destructed the rows object because pool.query returns a lot of objects but i only care about the rows data from the DB value of that property
      // example of the data get returned rows(an array of objects and by destructing it i only get one object)
      // rows: [       // <--- HERE is your actual data!
      //     { id: 1, username: 'alice', email: 'alice@example.com' },
      //     { id: 2, username: 'bob', email: 'bob@example.com' },
      //     { id: 3, username: 'charlie', email: 'charlie@example.com' }
      //   ],
      const { rows } = await pool.query("SELECT id,username,email,created_at FROM users");

      // if the query is successful ,send the rows back with a 200 OK status
      res.status(200).json(rows);
   } catch (error) {
      console.error("Error Fetching data", error);
      res.status(500).json({ error: "An internal server error occurred" });
   }
});
// The app.listen() function starts the server and makes it listen for incoming requests on the specified port.
// The code inside the callback function runs once the server has successfully started.
app.listen(port, () => {
   console.log(`Backend server is running and listening on http://localhost:${port}`);
});
