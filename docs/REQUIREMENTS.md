# XWZ LTD Parking Management System — Software Requirements

## 1. Introduction

XWZ LTD manages parking in Kigali and other areas in Rwanda. This document defines functional and non-functional requirements for the microservices-oriented parking management upgrade (implemented as a modular monolith with clear service boundaries for demonstration).

## 2. Functional Requirements

### 2.1 User Management (Task 2)

| ID | Requirement |
|----|-------------|
| FR-01 | System shall allow user registration with: id, firstName, lastName, email, password |
| FR-02 | System shall support roles: **admin**, **parking attendant** |
| FR-03 | Users shall authenticate via JWT after signup/login |
| FR-04 | Admin and parking attendants shall access the system after registration |

### 2.2 Parking Management (Task 3)

| ID | Requirement |
|----|-------------|
| FR-05 | Admin shall register parking: code, name, available spaces, location, fee per hour |
| FR-06 | Parking attendants shall view available parkings, spaces, and hourly fees |

### 2.3 Car Entry & Exit (Task 4)

| ID | Requirement |
|----|-------------|
| FR-07 | Register car entry: id, plate number, parking code, entry datetime; exit datetime null; charged amount 0 |
| FR-08 | On entry, generate a parking ticket |
| FR-09 | On exit, update exit datetime and charged amount; generate bill with duration and total |
| FR-10 | Decrement/increment vacant spaces on entry/exit respectively |

### 2.4 Reporting (Task 5)

| ID | Requirement |
|----|-------------|
| FR-11 | Report outgoing cars with total charged between two datetimes (paginated) |
| FR-12 | Report entered cars between two datetimes (paginated) |

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | RESTful APIs documented with Swagger UI |
| NFR-02 | JWT for authentication and role-based authorization |
| NFR-03 | All list endpoints paginated |
| NFR-04 | Structured logging (request + errors) |
| NFR-05 | Input validation and consistent error responses |
| NFR-06 | CORS, Helmet, rate limiting, password hashing |
| NFR-07 | Responsive, accessible UI (React) |

## 4. Data Flow

```
[Browser] → Signup/Login → [Auth API] → JWT stored
         → Register Parking (Admin) → [Parking API] → DB
         → Car Entry → [Entry API] → Ticket + decrement spaces
         → Car Exit → [Entry API] → Bill + increment spaces
         → Reports → [Reports API] → Filtered paginated data
```

## 5. UI Forms (Screens)

| Form / Page | Role | Purpose |
|-------------|------|---------|
| User Registration | Public | Signup (firstName, lastName, email, password) |
| Login | All | Email + password |
| Dashboard | All | Navigation hub |
| Register Parking | Admin | code, name, spaces, location, fee/hour |
| Parking List | Attendant, Admin | View availability and fees |
| Car Entry | Attendant | plate, parking code, entry time |
| Car Exit | Attendant | entry id or plate, process exit & bill |
| Outgoing Report | Admin | date range, paginated exits |
| Entered Cars Report | Admin | date range, paginated entries |
| Users List | Admin | Manage users (optional extension) |

## 6. Actors

- **Admin**: full parking CRUD, reports, user oversight
- **Parking Attendant**: view parkings, car entry/exit, tickets/bills

## 7. Assumptions

- Charging: hourly rate × ceiling of hours parked (minimum 1 hour after exit)
- Plate numbers unique per active (non-exited) session per parking
- Default admin seeded for first login (documented in README)
