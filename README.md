
# Payment Management System

[**English**](README.md) | [Русский](README_RU.md)

A full-stack payment record management application built with **ASP.NET Core 10, React, TypeScript, PostgreSQL, and Docker**.

The application allows users to create payment records, view transaction history, and analyze aggregated statistics through a REST API and web interface.

> **Disclaimer:** This is a demonstration project. It does not process real payments or integrate with payment gateways.

## Features

- Create and store payment records
- Client-side and server-side validation
- View transaction history
- View payment statistics grouped by currency and UTC date
- Protect REST API endpoints with an API Key
- Centralized API error handling
- Persistent PostgreSQL storage
- Run the complete application using Docker Compose

## Tech Stack

| Component | Technologies |
|-----------|--------------|
| Backend | C#, .NET 10, ASP.NET Core Web API |
| Frontend | React 19, TypeScript, Vite, CSS |
| Database | PostgreSQL 18 |
| ORM | Entity Framework Core, Npgsql |
| Validation | FluentValidation |
| Infrastructure | Docker, Docker Compose |
| Security | API Key middleware |

## Architecture

The backend is organized into four layers:

- **Domain:** Payment entity, enums, and business rules
- **Application:** DTOs, validators, interfaces, and services
- **Infrastructure:** EF Core, database configuration, repositories, and migrations
- **API:** REST controllers, middleware, and dependency injection

### Project Structure

```text
payment-form-fullstack/
├── backend/
│   ├── PaymentService.Api/
│   ├── PaymentService.Application/
│   ├── PaymentService.Domain/
│   ├── PaymentService.Infrastructure/
│   ├── DockerFile
│   └── PaymentService.slnx
├── frontend/
│   ├── src/
│   ├── DockerFile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── README.md
└── README_RU.md
```

## Quick Start — Docker Compose (Recommended)

### Prerequisites

- Docker Desktop
- Docker Compose
- Git

**You do not need to install .NET SDK, Node.js, or PostgreSQL locally when using Docker.**

### 1. Clone the Repository

```bash
git clone https://github.com/tamirlanm/payment-form-fullstack.git
cd payment-form-fullstack
```

### 2. Configure Environment Variables

Create a `.env` file from the provided example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**

```bash
cp .env.example .env
```

Edit `.env` and provide your own values:

```dotenv
POSTGRES_PASSWORD=your_local_database_password
API_SECURITY_KEY=your_long_random_demo_key
```

The database password is used by PostgreSQL and the backend API.

The API Key is required to access payment endpoints.

**Do not commit `.env` or share real credentials.**

### 3. Build and Start All Containers

Run from the project root:

```bash
docker compose up -d --build
```

Docker Compose starts three services:

| Service | Description | Address |
|---------|-------------|---------|
| frontend | React application (Vite Preview) | http://localhost:4173 |
| api | ASP.NET Core Web API | http://localhost:8080 |
| db | PostgreSQL 18 | localhost:5433 |

The PostgreSQL service has a health check. The API waits for the database to become healthy.

On API startup, Entity Framework Core automatically applies pending migrations.

**No manual database migration commands are required for Docker startup.**

### 4. Open the Application

Open:

**http://localhost:4173**

Enter the API Key from your `.env` file into the connection form and click **Connect**.

You can now:
- Create payment records
- View payment history
- View payment statistics

### 5. Verify Running Containers

```bash
docker compose ps
```

View API logs:

```bash
docker compose logs -f api
```

View frontend logs:

```bash
docker compose logs -f frontend
```

### 6. Stop the Application

```bash
docker compose down
```

PostgreSQL data is stored in a persistent Docker volume and is preserved after normal container shutdown.

**Warning:** `docker compose down -v` also removes the database volume and its stored data.

---

## Local Development (Without Full Docker Setup)

This option is intended for developers who want to run the backend and frontend directly on their computers.

### Requirements

- .NET 10 SDK
- Node.js 22 and npm
- Docker Desktop
- EF Core CLI tools (version 10.x)

### 1. Start PostgreSQL Only

Make sure your root `.env` file is configured, then run:

```bash
docker compose up -d db
```

PostgreSQL will be accessible at `localhost:5433`.

### 2. Configure the Backend

Copy the example configuration:

```powershell
Copy-Item backend/PaymentService.Api/appsettings.Development.example.json backend/PaymentService.Api/appsettings.Development.json
```

Set the local database password and API Key:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=payment_service_db;Username=payment_user;Password=your_local_database_password"
  },
  "ApiSecurityKey": {
    "Key": "your_long_random_demo_key"
  }
}
```

### 3. Apply Migrations

Install the EF Core CLI if required:

```bash
dotnet tool install --global dotnet-ef --version 10.*
```

Apply migrations:

```bash
dotnet ef database update --project backend/PaymentService.Infrastructure --startup-project backend/PaymentService.Api --context PaymentDbContext
```

### 4. Start the Backend

```bash
dotnet run --project backend/PaymentService.Api --launch-profile http
```

Backend URL:

`http://localhost:5190`

### 5. Start the Frontend

From the `frontend` directory:

```bash
cd frontend
npm ci
```

Create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5190
```

Run the development server:

```bash
npm run dev
```

Open:

`http://localhost:5173`

The frontend connects directly to the local backend using the configured API address.

---

## REST API

All payment endpoints require the following HTTP header:

```http
X-API-Key: your_long_random_demo_key
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create a payment |
| GET | `/api/payments` | Retrieve payment history |
| GET | `/api/payments/stats` | Retrieve payment statistics |

### Example Payment Request

```http
POST http://localhost:8080/api/payments
Content-Type: application/json
X-API-Key: your_long_random_demo_key
```

```json
{
  "walletNumber": "00123456789",
  "account": "testuser1",
  "email": "test@example.com",
  "phone": "+77771234567",
  "amount": 1500.50,
  "currency": "USD",
  "comment": "Test payment"
}
```

A successful request returns HTTP `201 Created` with payment details.

### Supported Currencies

- RUB
- USD
- EUR

### Validation

The backend validates:
- Required fields
- Wallet numbers containing ASCII digits
- Email format
- Optional phone number in international format
- Positive amounts with up to two decimal places
- Supported currencies
- Field length limits

Invalid requests return HTTP `400 Bad Request`.

Missing or incorrect API Keys return HTTP `401 Unauthorized`.

## Payment Status

The domain defines two payment statuses:

- `Created`
- `Rejected`

New valid payment records are created with status `Created`.

The `Rejected` status is defined in the domain model, but no separate rejection workflow is currently implemented.

## Payment Statistics

The statistics endpoint returns:
- Total payment count
- Payment counts grouped by currency
- Total amounts grouped by currency
- Daily transaction counts and totals using UTC dates

Amounts belonging to different currencies are not combined because no exchange-rate conversion is performed.

## Build Verification

Build the backend:

```bash
dotnet build backend/PaymentService.slnx
```

Build and lint the frontend:

```bash
cd frontend
npm ci
npm run build
npm run lint
```

## Troubleshooting

### API Returns 401 Unauthorized

Check that the API Key entered in the frontend matches `API_SECURITY_KEY` in the root `.env` file for Docker, or `ApiSecurityKey:Key` in the local backend configuration.

### Database Connection Failure

Check container status:

```bash
docker compose ps
```

View database logs:

```bash
docker compose logs db
```

If the database volume was initialized with a different password, updating `.env` alone does not change the existing PostgreSQL user's password.

### API Container Fails During Startup

Check API logs:

```bash
docker compose logs api
```

The API applies pending EF Core migrations at startup when `Database__ApplyMigrations=true`.

### Frontend Shows "Failed to fetch"

Check that the backend is running at `http://localhost:8080` in Docker mode or `http://localhost:5190` in local development mode.

For local development, also verify the frontend CORS origin and `VITE_API_BASE_URL`.

## Security and Limitations

- This is a demonstration application, not a production payment system.
- No actual money transfers are performed.
- No payment gateway integration is implemented.
- The API Key mechanism provides simple request protection, not end-user authentication.
- Manually entering an API Key in the browser is intended for local demonstrations only.
- Transaction history and statistics are loaded and aggregated in application memory; database-side aggregation and pagination would be preferable for larger datasets.
- The frontend uses Vite Preview for Docker-based demonstration, not a production-grade web server.

## Project Purpose

Developed as a full-stack .NET demonstration project to showcase REST APIs, layered architecture, data validation, database persistence, and Docker-based deployment.
