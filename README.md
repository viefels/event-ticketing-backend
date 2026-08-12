# Event Ticketing Backend

A robust, concurrency-safe backend architecture designed for managing event ticket sales. Features include role-based access control, volatile seat lockers via WebSocket broadcasting, and automated mocked payment validation lifecycles that natively prevent race conditions and over-booking.

---

##  Architecture & Features

### Core Mechanisms
*   **Role-Based Security:** Supports `attendee` and `organizer` accounts dynamically. Organizers can only modify their own events. Organizers are completely sandboxed from locking seats, manipulating checkouts, or writing reviews.
*   **Concurrency Sandbox (`SeatLocks`):** To avoid the "Double-Booking Race Condition," querying `/lock-seat` natively secures physical seats actively for exactly `10 minutes`. Attempting to lock seats automatically scrubs all globally expired locks globally.
*   **Volatile Limiting:** Attendees can only securely hold a maximum of `5` seats at a given time organically. Attempting to hold more actively halts transactions.
*   **Checkout Validation Flow:** Checkouts instantiate sandbox transactions (`create-order`). Executing `verify-order` dynamically measures time. If the sandbox breaches exactly `10 minutes`, or fails verification `5 times`, the checkout fails and forces lock obliterations mapping.

---

##  API Flow Pipeline

The end-to-end checkout logic must follow this sequence exactly:
1.  **Authentication Mode:** User runs `POST /api/users/login` and binds the JWT inside the `Authorization: Bearer <TOKEN>` header.
2.  **Selection (Lock):** User runs `POST /api/bookings/lock-seat` passing an array of `seatNumbers`. This blocks anyone else globally without committing the payment dynamically.
3.  **Checkout Initialization:** User evaluates total, and queries `POST /api/payments/create-order` feeding their `seatNumbers`. The backend initiates exactly 5 trial allowances internally natively.
4.  **Transaction Resolution:** The frontend hits `POST /api/payments/verify-order`. On `success: true`: 
    - Physical `Booking` ledgers map perfectly. 
    - Volatile `SeatLocks` are globally obliterated organically. 
    - `Ticket` models drop flawlessly natively.

---

##  API Documentation

###  1. Users Layer
Handles JSON Web Token (JWT) provisioning mapping arrays.

#### `POST /api/users/register`
Creates a local identity. Defaults to `attendee` if `role` is omitted entirely.
*   **Request Body:**
    ```json
    {
      "email": "user@test.com",
      "password": "securepassword123",
      "name": "Jane Doe",
      "role": "attendee" 
    }
    ```
*   **Response (201 OK):**
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "userId": "uuid-v4-string"
    }
    ```
*   **Error (400 Bad Request):**
    ```json
    {
      "success": false,
      "error": "Email already in use"
    }
    ```

#### `POST /api/users/login`
Dynamically binds `uid` arrays returning `Bearer <token>`.
*   **Request Body:**
    ```json
    {
      "email": "user@test.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Logged In successfully",
      "token": "eyJhb...",
      "profile": { "email": "...", "name": "...", "id": "...", "role": "attendee" }
    }
    ```
*   **Error (401 Unauthorized):**
    ```json
    {
      "success": false,
      "error": "Invalid email or password"
    }
    ```

---

###  2. Events Layer
Event management ledgers mapped cleanly. 

#### `POST /api/events` (Organizer Only)
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "title": "Neon Festival",
      "description": "Annual music event mapping.",
      "date": "2026-10-31T20:00:00.000Z",
      "totalSeats": 500,
      "price": 99.99
    }
    ```
*   **Response (201 OK):**
    ```json
    {
      "success": true,
      "message": "Event created successfully",
      "event": { "id": "uuid-v4", ... }
    }
    ```

#### `PUT /api/events/:id` (Organizer Only)
Updates configurations natively. Evaluates JWT against the event's `organizerId` organically.
*   **Request Body:**
    ```json
    {
       "title": "Neon Festival - Day 2",
       "price": 105.00
    }
    ```
*   **Error (403 Forbidden):**
    ```json
    {
       "success": false,
       "error": "Access denied. You can only modify events you created."
    }
    ```

---

###  3. Bookings (Seat Lock Sandbox)
Volatile seat claim endpoints handling concurrency and locking architectures.

#### `POST /api/bookings/lock-seat` (Attendee Only)
Dynamically binds 10-minute hold intervals natively against string arrays. Limit globally bounds at `5`.
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "seatNumbers": ["A1", "A2"],
      "eventId": "uuid-v4-string"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Seats locked temporarily"
    }
    ```
*   **Error (409 Conflict):**
    ```json
    {
      "success": false,
      "error": "One or more requested seats are currently locked by other users."
    }
    ```
*   **Error (403 Forbidden):**
    ```json
    {
      "success": false,
      "error": "You cannot lock more than 5 seats without paying. Please complete your checkout for existing seats."
    }
    ```

---

###  4. Payments Checkout Processing
Handles order verification securely tracking states against time limits organically.

#### `POST /api/payments/create-order` (Attendee Only)
Generates physical transaction object mapping inherently.
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "seatNumbers": ["A1", "A2"],
      "eventId": "uuid-v4-string",
      "amount": 199.98
    }
    ```
*   **Response (201 OK):**
    ```json
    {
      "success": true,
      "message": "Order initiated for checkout verification",
      "payment": { "transactionId": "txn_897123984_90", "trials": 0, ... }
    }
    ```
*   **Error (400 Bad Request):**
    ```json
    {
       "success": false,
       "error": "You do not hold active locks for all requested seats or some expired"
    }
    ```

#### `POST /api/payments/verify-order` (Attendee Only)
Mocks webhooks natively triggering ticket creation organically on valid evaluations dynamically.
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "transactionId": "txn_897123984_90",
      "success": true
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Order verified successfully. Cart moved to Bookings.",
      "booking": { "id": "uuid-v4", "status": "confirmed", ... },
      "tickets": [...]
    }
    ```
*   **Error (400 Bad Request - Exhausted Trials/Time):**
    ```json
    {
       "success": false,
       "error": "Maximum payment trials (5) exceeded. Locks destroyed."
    }
    ```
*   **Error (400 Bad Request - Failed Once):**
    ```json
    {
       "success": false,
       "error": "Payment failed. You have 4 attempts remaining."
    }
    ```

---

###  5. Ticket Validation
Digital entry arrays mapping securely physically.

#### `GET /api/tickets/my-tickets`
Returns completely instantiated tickets attached explicitly against the active JWT token natively.
*   **Headers:** `Authorization: Bearer <token>`

#### `POST /api/tickets/validate`
Used organically mapping real-world QR scanners logically.
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "ticketId": "uuid-v4-string",
      "qrCode": "qr_bookingstring_A1"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Ticket validated successfully! Enjoy the event.",
      "ticket": { "isValidated": true, ... }
    }
    ```
*   **Error (400 Bad Request):**
    ```json
    {
      "success": false,
      "error": "Ticket has already been successfully validated for entry"
    }
    ```

---

###  6. Event Reviews
Dynamically ensures organizers objectively cannot manipulate score systems organically natively.

#### `POST /api/reviews` (Attendee Only)
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "eventId": "uuid-v4-string",
      "rating": 5,
      "comment": "Incredible!"
    }
    ```
*   **Response (201 OK):**
    ```json
    {
      "success": true,
      "message": "Review added natively successfully"
    }
    ```
