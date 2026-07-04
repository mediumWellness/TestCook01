# TestCook01 🍳

A simple recipe management web app with a built-in browser persona brief generator for long-form game and chatbot testing.

## Stack
- **Client:** React 19 + Vite, react-router-dom
- **Server:** Node.js + Express, Prisma ORM
- **Database:** PostgreSQL

## Project structure
```
client/    React (Vite) frontend
server/    Express API + Prisma schema
docker-compose.yml   Local PostgreSQL for development
```

## Prerequisites
- Node.js 18+ and npm
- Docker (for local PostgreSQL) — or point `DATABASE_URL` at your own Postgres instance

## Getting started

### 1. Start PostgreSQL
```bash
docker compose up -d
```
This starts Postgres on `localhost:5432` with database `testcook01`, user/password `testcook`/`testcook`.

### 2. Set up and run the server
```bash
cd server
cp .env.example .env
npm install
npm run prisma:migrate   # creates the Recipe table
npm run dev              # starts API on http://localhost:4000
```

### 3. Set up and run the client
In a separate terminal:
```bash
cd client
npm install
npm run dev               # starts app on http://localhost:5173
```
The Vite dev server proxies `/api` requests to `http://localhost:4000`, so no CORS config is needed in development.

### 4. Use the app
Open http://localhost:5173 in your browser. You can create, view, edit, and delete recipes, or open the **Mr Testy** page to generate a browser testing persona brief for games and roleplay chatbots.

## API reference (server)
| Method | Path                | Description          |
|--------|---------------------|-----------------------|
| GET    | `/api/health`        | Health check          |
| GET    | `/api/recipes`       | List all recipes      |
| GET    | `/api/recipes/:id`   | Get a single recipe   |
| POST   | `/api/recipes`       | Create a recipe       |
| PUT    | `/api/recipes/:id`   | Update a recipe       |
| DELETE | `/api/recipes/:id`   | Delete a recipe       |

Recipe payload shape:
```json
{
  "title": "Pancakes",
  "description": "Fluffy weekend pancakes",
  "ingredients": ["2 cups flour", "2 eggs", "1.5 cups milk"],
  "instructions": "Mix ingredients. Cook on a hot griddle until golden.",
  "servings": 4,
  "cookTimeMinutes": 20
}
```

## Notes
- This initial setup covers basic recipe CRUD only — no user accounts/auth yet.
- The client also includes a **Mr Testy** route for generating a reusable browser persona prompt focused on long-running game and chatbot playtesting.
- Prisma schema lives at `server/prisma/schema.prisma`. After changing it, run `npm run prisma:migrate` inside `server/`.
