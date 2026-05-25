# XWZ LTD — Parking Management System

Microservices-oriented parking management upgrade for XWZ LTD (Kigali & Rwanda). Built with **React**, **Node.js/Express**, **Prisma/SQLite**, **JWT**, and **Swagger**.

## Project structure

```
RESTFUL Cursor/
├── docs/                 # Requirements, DB design, architecture, Figma spec
├── backend/              # Express API
├── frontend/             # React SPA
└── README.md
```

## Features (by task)

| Task | Implementation |
|------|----------------|
| **Task 1** | `docs/DATABASE_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/FIGMA_MOCKUP_SPEC.md` |
| **Task 2** | JWT auth, roles (ADMIN, PARKING_ATTENDANT), signup/login UI |
| **Task 3** | Register & list parkings with spaces and fees |
| **Task 4** | Car entry/exit, ticket, bill, vacant space updates |
| **Task 5** | Outgoing & entered reports with date range + pagination |

## Quick start

### Prerequisites

- Node.js 18+

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API: http://localhost:3001  
Swagger: http://localhost:3001/api-docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Demo accounts (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@xwz.rw | Admin@123 |
| Parking Attendant | attendant@xwz.rw | Attendant@123 |

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | User signup |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/profile` | JWT | Current user |
| POST | `/api/parkings` | Admin | Register parking |
| GET | `/api/parkings` | JWT | List parkings (paginated) |
| POST | `/api/entries` | Attendant+ | Car entry + ticket |
| POST | `/api/entries/exit` | Attendant+ | Car exit + bill |
| GET | `/api/reports/outgoing` | Admin | Exits in date range |
| GET | `/api/reports/entered` | Admin | Entries in date range |
| GET | `/api/reports/occupancy` | Admin | Cars per location |

## Security

- JWT bearer authentication
- bcrypt password hashing
- Helmet, CORS, rate limiting on auth
- Input validation (express-validator)
- Winston request/error logging

## Figma mockup (Task 1.3)

Recreate the signup page using `docs/FIGMA_MOCKUP_SPEC.md`, or use the live page at `/register` which matches the spec.

## Billing rule

Charged amount = `ceil(hours parked) × feePerHour`, minimum 1 hour.
