import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config"; // Loads environment variables from .env into process.env
// use these built in package so i can access path of files etc
import path from "path";
import { fileURLToPath } from "url";

//* import routes (where the path lies)
import userRouter from "./routes/userRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";

// Create an instance of the Express application. The `app` object is the heart of my server.
const app = express();
const port = process.env.API_PORT || 3001;

// - Get absolute path to the current directory ---
// This code figures out the full, exact path to the folder where your server.ts file lives.
const __filename = fileURLToPath(import.meta.url); // Gets the complete path to the current file, like /Users/YourName/Projects/my-backend/src/server.ts.
const __dirname = path.dirname(__filename); // Takes that full file path and just gives you the directory part: /Users/YourName/Projects/my-backend/src.

//. Middleware
// It's a security mechanism that browsers use. Since my React frontend(App.tsx) (e.g., on localhost:5173)
// and my Express backend(this server.ts) (e.g., on localhost:3001) are on different "origins", this
// middleware is essential to allow the browser to make API requests from the frontend to the backend.

app.use(cors()); // Sets up CORS so my React frontend can talk to it.
app.use(express.json()); // This is crucial for modern APIs. // It parses incoming request bodies that are in JSON format (e.g. POST requests with JSON payloads)

// ? Static File Serving ---
// 1. Serve general public assets (logo, default avatar, etc.)
app.use(express.static(path.join(__dirname, "..", "public")));
// Start at my current folder (__dirname, which is /src). Go up one level (.., which takes you to /my-backend). then Go into the public folder. The result is path: /Users/YourName/Projects/my-backend/public.
// express.static(...): This is the key. It unlocks the folder at that perfect path.
// "If a browser requests a file like /logo.png or /images/default-avatar.png, look for it inside the public folder. If you find it, send it back immediately. The word 'public' itself is invisible in the URL."

// ? Serve user-uploaded content from a dedicated URL prefix
//  This creates the URL `http://.../uploads/filename.png`
const uploadsPath = path.join(__dirname, "..", "profilePicUsers");
app.use("/uploads", express.static(uploadsPath));
// Only if a URL starts with /uploads should you use this key. When you do, take the rest of the URL (e.g., my-picture.png) and look for it inside the profilePicUsers folder."

// . API to fetch the restaurants list from the Database
// ? Any request starting with '/api/restaurants' will be handled by the restaurantRoutes file.
app.use("/api/restaurants", restaurantRouter);

// . API to get the login/register value from frontend (login)
//? Any request starting with '/api' will be handled by the userRoutes file.
app.use("/api", userRouter);

// //? the function is "async" meaning i can use await to wait for the database response after requesting a query
// app.get("/api/user", async (req: Request, res: Response) => {
//    try {
//       //? i destructed the rows object because pool.query returns a lot of objects but i only care about the rows data from the DB value of that property
//       // example of the data get returned rows(an array of objects and by destructing it i only get one object)
//       // rows: [       // <--- HERE is your actual data!
//       //     { id: 1, username: 'alice', email: 'alice@example.com' },
//       //     { id: 2, username: 'bob', email: 'bob@example.com' },
//       //     { id: 3, username: 'charlie', email: 'charlie@example.com' }
//       //   ],
//       const { rows } = await pool.query("SELECT id,username,email,created_at FROM users");

//       // if the query is successful ,send the rows back with a 200 OK status
//       res.status(200).json(rows);
//    } catch (error) {
//       console.error("Error Fetching data", error);
//       res.status(500).json({ error: "An internal server error occurred" });
//    }
// });
// The app.listen() function starts the server and makes it listen for incoming requests on the specified port.
// The code inside the callback function runs once the server has successfully started.
app.listen(port, () => {
   console.log(`Backend server is running and listening on http://localhost:${port}`);
});
