# Oktawave Loan Origination System

A REST API for a loan origination system built with Node.js, Express, and MongoDB. Supports user authentication, a multi-step loan application form (customer details, income details), and landing page content delivery.

## Features

- **Authentication**: Register, login, and JWT-protected routes
- **Loan Application Flow**: Multi-step form with progress tracking
  - Step 1: Customer Details (personal info)
  - Step 2: Income Details (employment & income)
  - Step 3: Document Upload (planned)
- **Landing Page API**: Returns structured content, branding, sections, testimonials, and FAQ
- **Health Check**: `/api/health` endpoint for monitoring
- **In-Memory MongoDB**: Optional in-memory database for local development/testing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **CORS**: Configured for frontend integration

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or cloud), OR use the in-memory option for testing

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ide_workspace

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=9001
FRONTEND_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/oktawave
JWT_SECRET=your-secret-key-here
USE_MEMORY_MONGO=0   # Set to 1 to use in-memory MongoDB for testing
```

### Running the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev

# Or use the start script (Windows)
start.bat
```

The server will start on `http://localhost:9001` (or the port specified in `.env`).

## API Endpoints

### Root

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | API info & available endpoints |

### Health Check

| Method | Endpoint      | Description          |
|--------|---------------|----------------------|
| GET    | `/api/health` | Server health status |

### Authentication

| Method | Endpoint                | Auth Required | Description                |
|--------|-------------------------|---------------|----------------------------|
| POST   | `/api/auth/register`    | No            | Register a new user        |
| POST   | `/api/auth/login`       | No            | Log in and receive JWT     |
| GET    | `/api/auth/me`          | Yes           | Get current user info      |
| POST   | `/api/auth/customer-details` | Yes      | Submit customer details    |
| POST   | `/api/auth/income-details`   | Yes      | Submit income details    |
| GET    | `/api/auth/form-status` | Yes           | Get form progress status   |

### Landing Page

| Method | Endpoint                      | Auth Required | Description                 |
|--------|-------------------------------|---------------|-----------------------------|
| GET    | `/api/landing`                | No            | Full landing page content   |
| GET    | `/api/landing/content/:section` | No          | Specific section (branding, testimonials, faq) |

## Request Examples

### Register

```bash
curl -X POST http://localhost:9001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123","role":"client"}'
```

### Login

```bash
curl -X POST http://localhost:9001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

### Submit Customer Details

```bash
curl -X POST http://localhost:9001/api/auth/customer-details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "+1-555-1234",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "dateOfBirth": "1990-01-15",
    "ssn": "123-45-6789"
  }'
```

### Submit Income Details

```bash
curl -X POST http://localhost:9001/api/auth/income-details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "employmentType": "employed",
    "employerName": "Acme Corp",
    "jobTitle": "Software Engineer",
    "annualIncome": 120000,
    "monthlyIncome": 10000,
    "additionalIncome": 5000,
    "incomeSource": "Freelance"
  }'
```

### Get Landing Page Content

```bash
curl http://localhost:9001/api/landing
```

## Project Structure

```
.
├── server.js               # Entry point
├── package.json            # Dependencies & scripts
├── .env                    # Environment variables (not committed)
├── start.bat               # Windows startup script
├── manual_test_cases/      # Exported test case CSVs
└── src/
    ├── config/
    │   └── db.js           # MongoDB connection setup
    ├── middleware/
    │   └── auth.js         # JWT authentication middleware
    ├── models/
    │   └── User.js         # Mongoose user model
    ├── routes/
    │   ├── index.js        # Route aggregator
    │   ├── auth.js         # Auth & loan form routes
    │   └── landing.js      # Landing page content routes
    └── utils/
        └── jwt.js          # JWT sign/verify helpers
```

## User Model Fields

| Field                  | Type    | Description                              |
|------------------------|---------|------------------------------------------|
| `name`                 | String  | Full name                                |
| `email`                | String  | Unique email address                     |
| `password`             | String  | Hashed password                          |
| `role`                 | String  | `client`, `freelancer`, or `admin`       |
| `customerDetails`      | Object  | Personal info (address, DOB, SSN, etc.)  |
| `incomeDetails`        | Object  | Employment and income data               |
| `formProgress`         | Object  | Flags for completed form steps           |
| `loanApplicationStatus`| String  | `not-started` → `in-progress` → `submitted` → `under-review` → `approved`/`rejected` |

## Scripts

| Script         | Command         | Description                |
|----------------|-----------------|----------------------------|
| `start`        | `node server.js`| Run in production mode       |
| `dev`          | `nodemon server.js`| Run with auto-reload     |

## Testing with In-Memory MongoDB

Set `USE_MEMORY_MONGO=1` in your `.env` to run the server with an ephemeral in-memory database. Useful for CI/CD and local testing without a real MongoDB instance.

## License

Private / Oktawave Financial Services
