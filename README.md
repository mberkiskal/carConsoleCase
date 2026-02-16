CarConsoleApplication

This project represents a web-based and responsive vehicle center
console application.

Backend is developed using ASP.NET Core Web API. Frontend is developed
using React (Vite + TypeScript). PostgreSQL is used as the database.

------------------------------------------------------------------------

GENERAL DESCRIPTION

The application consists of two main areas:

1)  Settings
    -   Climate
    -   Seating
    -   Display
    -   Vehicle
    -   Service
    -   Driving
    -   Software
    -   Lights
2)  Map / Route
    -   Open-source map integration
    -   Route drawing with multiple coordinates
    -   Route generation via OSRM service
    -   Route persistence in PostgreSQL

The project follows a layered architecture approach. Database entities
and API contracts are separated using DTO (Data Transfer Object)
classes. This prevents exposing persistence models directly to the
client and improves maintainability.

------------------------------------------------------------------------

TECHNOLOGIES

Backend: - ASP.NET Core Web API - Entity Framework Core - PostgreSQL

Frontend: - React - TypeScript - Vite - Leaflet (OpenStreetMap)

Database: - PostgreSQL - Docker (optional)

------------------------------------------------------------------------

PROJECT STRUCTURE

Backend: - Entities: Database table representations - Dtos: API
request/response contracts - Controllers: REST endpoints - Services:
Business logic (e.g., routing) - Data: DbContext configuration

Frontend: - Pages for each settings module - Map page with route
visualization - Centralized API layer for HTTP requests

------------------------------------------------------------------------

RUNNING THE PROJECT

1)  Clone the repository:

git clone https://github.com/mberkiskal/CarConsoleApplication.git 

cd CarConsoleApplication

------------------------------------------------------------------------

DATABASE SETUP

Option A – Using Docker

Start PostgreSQL container:

docker compose up -d

Option B – Restore Database Backup

If a PostgreSQL dump file is provided, restore it using:

docker exec -i carconsoleapplication pg_restore -U postgres -d postgres < backup.dump

db password: carpass123

After restore, required tables and demo data will be available.

------------------------------------------------------------------------

BACKEND

Open the solution file (CarConsoleApplication.sln) in Visual Studio or
VS Code and run the API project.

- Swagger UI: http://localhost:5298/swagger/index.html

- API Base: http://localhost:5298
------------------------------------------------------------------------

FRONTEND

Navigate to the frontend directory:

- cd frontend 
- npm install
- npm run dev

Frontend Dev URL: http://localhost:5173/

Make sure VITE_API_BASE_URL is configured properly in the .env file.

------------------------------------------------------------------------

CASE REQUIREMENTS ALIGNMENT

-   Web-based and responsive interface ✔
-   React frontend ✔
-   .NET Core Web API backend ✔
-   PostgreSQL database usage ✔
-   Settings persisted in database ✔
-   Route stored and retrieved from database ✔
-   Open-source map service integration ✔
-   Clean and layered architecture ✔

The project is designed as a product-oriented implementation rather than
a temporary demo structure.
