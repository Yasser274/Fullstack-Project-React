import express, { type Request, type Response } from "express";
import cors from "cors";
import { Pool } from "pg"; // this is for PostGreSQL DB connections
import "dotenv/config"; // Loads environment variables from .env into process.env

// to hash passwords from users
import bcrypt from "bcrypt";

// Create an instance of the Express application. The `app` object is the heart of my server.
const app = express();
const port = process.env.API_PORT || 3001;

//. Middleware
// It's a security mechanism that browsers use. Since my React frontend(App.tsx) (e.g., on localhost:5173)
// and my Express backend(this server.ts) (e.g., on localhost:3001) are on different "origins", this
// middleware is essential to allow the browser to make API requests from the frontend to the backend.

app.use(cors()); // Sets up CORS so my React frontend can talk to it.
app.use(express.json()); // This is crucial for modern APIs. // It parses incoming request bodies that are in JSON format (e.g. POST requests with JSON payloads)

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
app.post("/api/login", (req: Request, res: Response) => {
   // The data from the frontend will be in `req.body`. and the res(Response) will be the backend Response to Frontend
   const { username, password } = req.body; // get values of username and password (destruct it from the object)

   res.status(200).json({
      message: `Successfully received login for user ${username} ${password}`,
   });
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

      const newUserQuery = `INSET INTO users (username,password_hash,email) VALUES($1,$2,$3)`;
      const { rows } = await pool.query(newUserQuery, [username, hashedPassword, email]);

      res.status(201).json({ message: `got these ${username} ${email}`, user: rows[0] });
   } catch (error) {
      console.error("Registration error", error); // console.log is for the backend and res(is for the frontend)
      res.status(500).json({ error: "An error occurred during registration" });
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
