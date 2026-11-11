# Policy Management Portal

A full-stack policy management application built with **C#, ASP.NET Core Web API, Entity Framework Core, SQLite, and JavaScript**.

## Features

- Responsive management dashboard.
- View, create, search, and update policies.
- KPI cards and policy status overview.
- REST API with Swagger documentation.
- SQLite database integration.
- Dependency injection.
- Health-check endpoint.

## Tech Stack

- C# / .NET 8
- ASP.NET Core Web API
- Entity Framework Core 8
- SQLite
- HTML, CSS and JavaScript
- Swagger / OpenAPI

## Getting Started

**Prerequisites:** .NET 8 SDK.

Run from the folder containing `PolicyManagementApi.csproj`:

```powershell
dotnet restore
dotnet build
dotnet run
```

**Application URLs:**
- Dashboard: http://localhost:5202/
- Swagger: http://localhost:5202/swagger
- Health: http://localhost:5202/health

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/Policies` | Get all policies |
| GET | `/api/Policies/{id}` | Get policy by ID |
| POST | `/api/Policies` | Create policy |
| PUT | `/api/Policies/{id}` | Update policy |

Duplicate policy numbers return `409 Conflict`.

## Continuous Integration

GitHub Actions workflow: `.github/workflows/dotnet.yml`

Automatically restores and builds the project on pushes and pull requests to `main`.

## Notes

- SQLite database is created automatically on first run.
- This is a learning and portfolio project, not a production system.
- Uses fictional sample data only.
