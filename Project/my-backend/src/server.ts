import express, { type Request, type Response } from "express";
import cors from "cors";
import { Pool } from "pg"; // this is for PostGreSQL DB connections
import "dotenv/config"; // This line imports the `dotenv` library


// Create an instance of the Express application. The `app` object is the heart of my server.
const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
// It's a security mechanism that browsers use. Since my React frontend(App.tsx) (e.g., on localhost:5173)
// and my Express backend(this server.ts) (e.g., on localhost:3001) are on different "origins", this
// middleware is essential to allow the browser to make API requests from the frontend to the backend.

app.use(cors());
app.use(express.json()); // This is crucial for modern APIs. // It parses incoming request bodies that are in JSON format

// PostgreSQL connection pool get from .env(it hides DB details) file
const pool = new Pool({
  // This is a critical security practice to avoid hardcoding credentials in my source code so no one can see it when i git push this into my repo.
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// This creates a simple GET route at the URL index
// When the frontend requests this URL, this function will run.
app.get('/api/test', (req: Request, res: Response) => {
  // We send back a simple JSON object as a response.
  console.log("Running on home page")

  res.send("STARTED")
});

// The app.listen() function starts the server and makes it listen for incoming requests on the specified port.
// The code inside the callback function runs once the server has successfully started.
app.listen(port, () => {
  console.log(`Backend server is running and listening on http://localhost:${port}`);
});
