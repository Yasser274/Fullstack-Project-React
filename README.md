# My Fullstack Project (React(TS) + ExpressJS + PostgreSQL) Trend Bites

#### Video Demo: (https://www.youtube.com/watch?v=kpDFoljGSl8)

#### Description:

Trend Bites is a full-stack web application built with React (TypeScript) for the frontend, Express.js for the backend, and PostgreSQL for the database. It enables users to discover, rate, and view community feedback on restaurants based on monthly trends, helping users find fresh and trending dining options.

#### Tech Stack

-  **Frontend:** React, TypeScript, Vite
-  **Backend:** Node.js, Express.js, TypeScript
-  **Database:** PostgreSQL
-  **Authentication:** JSON Web Tokens (JWT)

## 🚀 Getting Started: How to Run This Project

This project uses a single command to start both the backend and frontend servers simultaneously. Follow these steps to get it running.

#### Prerequisites

-  Node.js and `npm` must be installed on your system.
-  PostgreSQL must be installed and running.

### 1. Installation

First, you need to install all dependencies for the root, backend, and frontend.

```bash
# 1. Navigate to the main 'Project' directory
cd Project

# 2. Install root dependencies (for the 'concurrently' tool)
npm install

# 3. Install backend dependencies
npm install --prefix my-backend

# 4. Install frontend dependencies
npm install --prefix my-frontend
```

#### Before running the application you must configure the database connection.

### 2. Ensure you are in the 'Project/my-backend' directory

```bash
cd my-backend
# 2. Create the Database
# In psql or your database tool, create a new PostgreSQL database (e.g., CREATE DATABASE trendbites;).

# From your command line (while in the Project/my-backend directory), execute the provided schema.sql file to create all the necessary tables. Replace the placeholders with your details:
psql -U your_postgres_username -d your_database_name -f schema.sql


# 3. Create an environment file
#    a. In the 'Project/my-backend' directory, create a file named .env
#    b. Add your database and JWT secret details to this file. It must follow this format:

#       DB_USER=your_postgres_username
#       DB_HOST=localhost
#       DB_DATABASE=name_of_your_database
#       DB_PASSWORD=your_postgres_password
#       DB_PORT=5432
#       API_PORT=3001
#       JWT_SECRET=choose_any_long_random_secret_string
```

#### Once installation and configuration are complete, you can start the entire application with one command.

```bash
# 1. Navigate back to the 'Project' directory (the one with your main package.json)
cd ..

# 2. Run the start script
npm run dev
```

## 💻 Inserting Data into Tables:

-  For the restaurants list (logo goes here, name + desc stay in translations)::

```
WITH ins1 AS (
  INSERT INTO restaurants (restaurant_logo)
  VALUES ('<Img link>')
  RETURNING id
)
INSERT INTO restaurant_translations (restaurant_id, name, language_code,description)
SELECT id, 'Taco Bell', 'en','Desc Example'
FROM ins1;

```

-  For linking restaurants with existing tags:

```
INSERT INTO restaurant_tags (restaurant_id, tag_id)
VALUES (
    (SELECT restaurant_id FROM restaurant_translations AS rt WHERE rt.name = 'Maestro'),
    (SELECT id FROM tags AS t WHERE t.tagname = 'pizza')
)
```

-  For adding new tags:

```
INSERT INTO tags (tagname)
VALUES ('Egyptian')
```

-  For adding restaurant translations EN (restaurant already exists):

```
INSERT INTO restaurant_translations (restaurant_id, name, language_code,description)
VALUES (4,'Taco Bell','en','Desc Example');
```

-  For adding restaurant translations AR (restaurant already exists):

```
INSERT INTO restaurant_translations (restaurant_id, name, language_code, description)
VALUES (4, 'تاكو بل', 'ar', 'مثال للوصف');
```

-  For adding sponsored (restaurant already exists):

```
INSERT INTO
  sponsorships (restaurant_id, banner_image_url)
VALUES
  (
    (
      SELECT
        rtt.restaurant_id
      FROM
        restaurant_translations AS rtt
      WHERE
        rtt.name = 'Shawarma House'
    ),
    '<IMG LINK URL>'
  );
```

-  To deactivate a sponsorship (remove it from display), just replace 'Shawarma House' with the restaurant name you want to update:

```
UPDATE sponsorships
SET
  is_active = FALSE
WHERE
  restaurant_id = (
    SELECT
      rtt.restaurant_id
    FROM
      restaurant_translations AS rtt
    WHERE
      rtt.name = 'Shawarma House'
  );
```

## About the Project:

#### Core Functionality:

-  Restaurant Ratings: Logged-in users can rate restaurants out of 5 stars, with optional comments, to highlight monthly trending spots. Ratings are aggregated to showcase popular restaurants.

-  Community Feedback: Users can view ratings and comments (if provided) from others, fostering a collaborative rating environment.

-  Monthly Reset: At the end of each month, all ratings are cleared from the database, allowing users to re-rate for the new month and keeping trends fresh.

#### User Features:

-  Authentication: Secure registration and login system, with options to update profile pictures and passwords.

-  Profile Dashboard: Displays personal rating history across all months, including voted restaurants, past trends, and any comments provided by the user.

-  Themes: Toggle between light and dark modes for a personalized experience.

-  Language Support: Switch seamlessly between English and Arabic using react-i18next, making the platform accessible to a broader audience.

Unlike Google Maps, Trend Bites focuses on dynamic, monthly trends, enabling small restaurants to rise quickly in popularity and helping users discover new dining experiences. This project showcases full-stack development, user authentication, database management, and responsive UI design, creating an engaging, community-driven platform for restaurant ratings.
