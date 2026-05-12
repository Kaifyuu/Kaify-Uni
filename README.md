# Kaify-Uni 🛍️
A robust Full-Stack E-Commerce platform built for the 960121 University Course. 
The project features a secure Express.js backend, a high-performance MySQL database, and a visually immersive, responsive frontend hosted on GitHub Pages.

**Live Demo:** [https://kaifyuu.github.io/Kaify-Uni/](https://kaifyuu.github.io/Kaify-Uni/)

---

## 🚀 Key Features

### 🛒 Customer Experience
- **Dynamic Catalog:** Real-time search and category filtering with **AbortController** to prevent race conditions.
- **Smart Recommendations:** Personalized product suggestions based on relational SQL joins.
- **Atomic Checkout:** Secure payment simulation with **MM/YY & CVV validation** and server-side total verification.
- **Inventory Awareness:** Real-time stock tracking with "Low Stock" warnings and optimistic/pessimistic UI updates.
- **Order Tracking:** Visual progress bar for real-time tracking of order fulfillment steps.

### 🔐 Security & Architecture
- **JWT Authentication:** Stateless authentication with JWT tokens stored securely.
- **Role-Based Access (RBAC):** Strict separation between Customers and Admin roles.
- **Controller-Route-Service Pattern:** Decoupled backend architecture for maximum maintainability.
- **Concurrency Control:** SQL `FOR UPDATE` locking to prevent inventory overselling during high-traffic checkout.
- **Input Sanitization:** Regex-based validation and parameterized SQL queries to prevent XSS and SQL Injection.

### 🛠️ Admin Powers
- **Inventory CRUD:** Full ability to add, edit, and delete products (names, IDs, prices, stock, etc.).
- **Numerical ID Sorting:** Smart inventory view sorted numerically (1, 2, 10 instead of 1, 10, 2).
- **Order Processing:** Advance order status (Placed → Packed → Shipped → Delivered).
- **Advanced Cancellation:** Cancel orders with mandatory reason comments and automatic stock recovery.

---

## 🛠️ Setup Instructions

To run this project locally:

### 1. Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`.
3. Create a `.env` file in the `backend` folder with your credentials:
   ```env
   DB_HOST=your_mysql_host
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=your_database
   JWT_SECRET=your_super_secret_key
   PORT=3000
   ```
4. (Optional) Run the migration script if tables are missing: `node migrate.js` (if provided).
5. Start the server: `npm start`.

### 2. Frontend Setup
1. Open `index.html` using a local server (e.g., VS Code Live Server).
2. The frontend automatically detects if it's running on `localhost` and connects to your local backend.

---

## 📂 Project Structure

```text
├── backend/
│   ├── controllers/      # Route logic handlers
│   ├── services/         # Business logic & DB transactions
│   ├── routes/           # API Endpoint definitions
│   ├── db.js             # MySQL Connection Pool
│   └── server.js         # Express configuration & Middleware
├── Documentation/        # Technical design & UML diagrams
├── data/json/            # Local fallback data for offline mode
└── index.html            # Main E-Commerce SPA
```

---

## 🎓 Course Alignment (960121)
This project implements several advanced concepts from the course sessions:
- **Session 3-4:** Event Delegation, Debouncing, and LocalStorage state persistence.
- **Session 9:** Microservice thinking via Controller-Route-Service separation.
- **Session 10:** Production "Go-Live" audit (Payload limits, Global Error Handling, environment isolation).

---

## 🛡️ License
Distributed under the ISC License. See `package.json` for more information.
