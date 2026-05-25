# Database Design — XWZ Parking System

## ER Diagram (Conceptual)

```mermaid
erDiagram
    USER ||--o{ CAR_ENTRY : creates
    PARKING ||--o{ CAR_ENTRY : hosts
    USER {
        string id PK
        string firstName
        string lastName
        string email UK
        string passwordHash
        enum role
        datetime createdAt
        datetime updatedAt
    }
    PARKING {
        string id PK
        string code UK
        string name
        int totalSpaces
        int availableSpaces
        string location
        float feePerHour
        datetime createdAt
        datetime updatedAt
    }
    CAR_ENTRY {
        string id PK
        string plateNumber
        string parkingId FK
        string attendantId FK
        datetime entryDateTime
        datetime exitDateTime
        float chargedAmount
        datetime createdAt
        datetime updatedAt
    }
```

## Tables

### `User`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| firstName | VARCHAR(100) | NOT NULL |
| lastName | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (bcrypt hash) |
| role | ENUM | `ADMIN`, `PARKING_ATTENDANT` |
| createdAt | TIMESTAMP | DEFAULT now |
| updatedAt | TIMESTAMP | |

### `Parking`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| code | VARCHAR(50) | UNIQUE, NOT NULL |
| name | VARCHAR(200) | NOT NULL |
| totalSpaces | INT | NOT NULL, > 0 |
| availableSpaces | INT | NOT NULL, >= 0 |
| location | VARCHAR(500) | NOT NULL |
| feePerHour | DECIMAL(10,2) | NOT NULL, >= 0 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### `CarEntry`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| plateNumber | VARCHAR(20) | NOT NULL |
| parkingId | UUID | FK → Parking |
| attendantId | UUID | FK → User (nullable for system) |
| entryDateTime | TIMESTAMP | NOT NULL |
| exitDateTime | TIMESTAMP | NULL on entry |
| chargedAmount | DECIMAL(10,2) | DEFAULT 0 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

**Business rules**

- On insert: `exitDateTime = null`, `chargedAmount = 0`, `availableSpaces -= 1`
- On exit: set `exitDateTime`, compute `chargedAmount`, `availableSpaces += 1`
- Active entry: same `plateNumber` + `parkingId` where `exitDateTime IS NULL`
