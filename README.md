[English](README.md) | [Русский](README_RU.md)
# Payment Management System

A full-stack application for collecting, storing, and viewing payment records.

The application provides payment creation, transaction history, and aggregated statistics through a REST API and a React-based interface.

> This project is a demonstration system. It does not process real money or perform actual financial transactions.

## Tech Stack

### Backend
- C# / .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL 18
- FluentValidation
- API Key authentication

### Frontend
- React 19
- TypeScript
- Vite
- CSS

### Infrastructure
- Docker Compose
- EF Core Migrations

## Features

- Create payment records
- Validate payment data on both client and server
- View transaction history
- View aggregated statistics by currency and UTC date
- Protect API endpoints using an API Key
- Handle application errors through centralized middleware

## Architecture

The backend follows a layered architecture:

- **Domain:** Entities, enums, and business rules
- **Application:** DTOs, interfaces, validators, and services
- **Infrastructure:** EF Core, database context, and repositories
- **API:** Controllers, middleware, and dependency injection

## Prerequisites

- .NET 10 SDK
- Node.js and npm
- Docker Desktop with Docker Compose
- EF Core CLI tools (version 10.x)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tamirlanm/payment-form-fullstack.git
cd payment-form-fullstack
```

### 2. Configure PostgreSQL

Copy `.env.example` to `.env` and set a local database password.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Example:

```dotenv
POSTGRES_PASSWORD=your_local_password
```

Start PostgreSQL:

```bash
docker compose up -d
```

The PostgreSQL container is accessible on `localhost:5433`.

### 3. Configure the backend

Copy the example configuration:

```powershell
Copy-Item backend/PaymentService.Api/appsettings.Development.example.json backend/PaymentService.Api/appsettings.Development.json
```

Update `DefaultConnection` with the same PostgreSQL password used in `.env`.

Set a random local API Key under `ApiSecurityKey:Key`.

Do not commit passwords or API keys to Git.

### 4. Apply database migrations

Install the EF Core CLI if it is not already installed:

```bash
dotnet tool install --global dotnet-ef --version 10.0.15
```

Apply migrations from the repository root:

```bash
dotnet ef database update --project backend/PaymentService.Infrastructure --startup-project backend/PaymentService.Api --context PaymentDbContext
```

This creates the required database schema and tables.

### 5. Run the backend

```bash
dotnet run --project backend/PaymentService.Api --launch-profile http
```

Default API address:

`http://localhost:5190`

### 6. Run the frontend

Navigate to `frontend`:

```bash
cd frontend
npm install
```

Create `.env.local` if the API address differs from the default:

```dotenv
VITE_API_BASE_URL=http://localhost:5190
```

Start Vite:

```bash
npm run dev
```

Open:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create a payment |
| GET | `/api/payments` | Get payment history |
| GET | `/api/payments/stats` | Get payment statistics |

### API Security

Payment endpoints require the following header:

```http
X-API-Key: your_demo_api_key
```

For local demonstration, the frontend allows entering the API key manually. It is held in memory and is not intended for use with production credentials.

## Example Payment Request

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

Supported currencies: USD, EUR, RUB.

## Statistics

The API provides:
- Total payment count
- Total amounts and counts grouped by currency
- Daily payment amounts and counts grouped by UTC date

Amounts in different currencies are not added together.

## Validation

The application checks:
- Required fields
- Wallet number format and length
- Email format
- Optional phone number format
- Positive payment amounts
- Supported currencies
- Comment length

## Build and Verification

Backend:

```bash
dotnet build backend/PaymentService.slnx
```

Frontend:

```bash
cd frontend
npm run build
npm run lint
```

## Stopping the Database

```bash
docker compose down
```

The database volume is preserved by default.

## Limitations

- No real payment processing
- No payment gateway integration
- API Key protection is intended for demonstration, not end-user authentication
- Aggregated statistics are calculated using application-level LINQ

## License

For educational and demonstration purposes.
