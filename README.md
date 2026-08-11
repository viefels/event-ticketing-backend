# Event Ticketing Platform (Backend)

> Core data layer for an event ticketing platform handling user authentication, real-time seat booking, and simulated payments.

**Author:** Livingstone Sanmi Isaac  
**Date:** August 2026

## Technology Stack
*   **Environment:** Node.js (ESM)
*   **Framework:** Express
*   **Database ORM:** Sequelize
*   **Database:** PostgreSQL
*   **Real-Time Concurrency:** Socket.IO
*   **Data Validation:** Zod

---

## 🗄️ Database Models

| Model | Attributes / Datatypes |
| :--- | :--- |
| **User** | `id` (UUID), `email` (String, Unique), `password` (String), `name` (String) |
| **Event** | `id` (UUID), `title` (String), `description` (Text), `date` (Date), `totalSeats` (Int), `availableSeats` (Int), `price` (Decimal) |
| **Booking** | `id` (UUID), `status` (Enum: pending, confirmed, cancelled), `seatNumber` (String), `expiresAt` (Date) |
| **Ticket** | `id` (UUID), `seatNumber` (String), `qrCode` (String), `isValidated` (Boolean, default: false) |
| **SeatLock** | `id` (UUID), `seatNumber` (String), `lockedBy` (String), `lockedAt` (Date), `expiresAt` (Date) |
| **Payment** | `id` (UUID), `amount` (Decimal), `status` (Enum: pending, completed, failed), `transactionId` (String) |
| **Review** | `id` (UUID), `rating` (Int 1-5), `comment` (Text) |

The relationships between models are natively managed via Sequelize (`hasMany`, `belongsTo`, `hasOne`).

---

## 📡 API Reference & Payloads

> Note: All validation is strictly run via **Zod Middlewares**. Standard Zod error signature:
> `400 Bad Request: { "error": "Validation failed", "details": [ { ...zodError } ] }`
> All generic server errors return: `500 Internal Server Error: { "error": "Message" }`

### 1. User Management (`/api/users`)

*   **POST** `/register`
    *   **Description:** Register a new user.
    *   **Request Body:** `{ "email": "user@example.com", "password": "min6chars", "name": "John Doe" }`
    *   **Success (201):** `{ "message": "User registered successfully", "userId": "uuid-..." }`
    *   **Errors (400):** `{ "error": "Email already in use" }`

*   **POST** `/login`
    *   **Description:** Login (dummy access token generation).
    *   **Request Body:** `{ "email": "user@example.com", "password": "password123" }`
    *   **Success (200):** `{ "message": "Login successful", "token": "token-...", "userId": "uuid-..." }`
    *   **Errors (401):** `{ "error": "Invalid credentials" }`

### 2. Event Management (`/api/events`)

*   **POST** `/`
    *   **Request Body:** `{ "title": "Concert", "description": "...", "date": "2026-10-10T19:00:00Z", "totalSeats": 100, "price": 49.99 }`
    *   **Success (201):** `{ "message": "Event created successfully", "event": { ... } }`

*   **GET** `/`
    *   **Success (200):** `{ "events": [ ... array of events ... ] }`

*   **PUT** `/:id`
    *   **Request Body:** Fully optional event properties.
    *   **Success (200):** `{ "message": "Event {id} updated", "event": { ... } }`
    *   **Errors (404):** `{ "error": "Event not found" }`

### 3. Seat Booking / Real-Time (`/api/bookings`)

*   **POST** `/lock-seat`
    *   **Description:** Implements a temporary 10-minute lock on a seat. Broadcasts a `seat-locked` WebSocket event logic on success.
    *   **Request Body:** `{ "seatNumber": "A12", "eventId": "uuid-...", "userId": "uuid-..." }`
    *   **Success (200):** `{ "message": "Seat locked temporarily" }`
    *   **Errors (409):** `{ "error": "Seat is currently locked" }` OR `{ "error": "Seat is already booked" }`

*   **POST** `/book`
    *   **Description:** Generates a permanent `pending` booking (expires after 15 mins mapped to payment gateway wait times). Destroys the lock and broadcasts `seat-booked` WebSocket event logic.
    *   **Request Body:** `{ "seatNumber": "A12", "eventId": "uuid-...", "userId": "uuid-..." }`
    *   **Success (201):** `{ "message": "Seat booked successfully (pending payment)", "booking": { ... } }`
    *   **Errors (409):** `{ "error": "Seat is already booked" }`

### 4. Payments Simulator (`/api/payments`)

*   **POST** `/create-order`
    *   **Description:** Triggers a mock pending gateway transaction context.
    *   **Request Body:** `{ "bookingId": "uuid-...", "amount": 49.99 }`
    *   **Success (201):** `{ "message": "Order created successfully", "payment": { ... } }`
    *   **Errors (404/400):** `{ "error": "Booking not found" }` OR `{ "error": "Booking is already confirmed or cancelled" }`

*   **POST** `/verify-order`
    *   **Description:** Reconciles the callback status of a mock transaction. Converts Bookings to `confirmed` and auto-generates the `Ticket`. 
    *   **Request Body:** `{ "transactionId": "txn_...", "success": true }`
    *   **Success (200):** `{ "message": "Order verified successfully", "ticket": { ... } }` (If `success: true`)
    *   **Failed (400):** `{ "error": "Payment failed, booking cancelled" }` (If `success: false` - Booking converted to `cancelled` automatically) 
    *   **Error (404):** `{ "error": "Payment record not found" }`

### 5. Ticket Management (`/api/tickets`)

*   **GET** `/my-tickets?userId={uuid}`
    *   **Success (200):** `{ "tickets": [ ... ] }` 
    *   **Errors (400):** `{ "error": "userId is required" }`

*   **GET** `/:ticketId`
    *   **Description:** Generates an inner-joined ticket summary holding User and Event relationships.
    *   **Success (200):** `{ "ticket": { ... } }`
    *   **Errors (404):** `{ "error": "Ticket not found" }`

*   **POST** `/validate`
    *   **Description:** Prevents duplicate entry switching `isValidated` state permanently true.
    *   **Request Body:** `{ "ticketId": "uuid-...", "qrCode": "qr_..." }`
    *   **Success (200):** `{ "message": "Ticket validated successfully", "ticket": { ... } }`
    *   **Errors (404/400):** `{ "error": "Ticket not found or invalid QR code" }` OR `{ "error": "Ticket has already been used" }`

### 6. Reviews (`/api/reviews`)

*   **POST** `/`
    *   **Request Body:** `{ "rating": 5, "comment": "Amazing experience!", "userId": "uuid-...", "eventId": "uuid-..." }`
    *   **Success (201):** `{ "message": "Review created successfully", "review": { ... } }`

*   **GET** `/event/:eventId`
    *   **Success (200):** `{ "reviews": [ ... ] }`
