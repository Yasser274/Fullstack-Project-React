import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config"; // Loads environment variables from .env into process.env

// import database
import { pool } from "./config/database.js";

// to hash passwords from users
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // (for Login session)

//* import controllers (where the function of what to do when a frontend fetches /api/login for example)
import { loginUser,registerUser, restaurants } from "./controllers/controller.js";

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

// This creates a simple GET route at the URL index
// When the frontend requests this URL, this function will run.
app.get("/api/test", (req: Request, res: Response) => {
   // We send back a simple JSON object as a response.
   console.log("Running on home page");

   res.send("Backend Started ✅");
});

// . API to get the login/register value from frontend (login)
app.post("/api/login", loginUser);
// . API to create a new user (register)
app.post("/api/register", registerUser); // without () => {} because registerUser itself is a function

// . API to fetch the restaurants list from the Database
app.get("/api/restaurants",restaurants)

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
