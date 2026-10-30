import { Pool } from "pg"; // this is for PostGreSQL DB connections
import "dotenv/config"; // Loads environment variables from .env into process.env

// PostgreSQL connection pool get from .env(it hides DB details) file
export const pool = new Pool({
   // This is a critical security practice to avoid hardcoding credentials in my source code so no one can see it when i git push this into my repo.
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_DATABASE,
   password: process.env.DB_PASSWORD,
   port: parseInt(process.env.DB_PORT || "5432"),
   max: 1, // one connection per Lambda instance so concurrent Lambdas don't exhaust the DB
   // RDS requires SSL, local Postgres doesn't (DB_SSL is only set in Lambda)
   ...(process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {}),
});
