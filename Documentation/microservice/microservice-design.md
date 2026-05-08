# Microservice Boundary Map

## 1. GenAI Prompt
**Prompt:** "Act as a Software Architect. I currently have a Node.js Modular Monolith with three main routes: Auth, Products, and Checkout. I want to migrate this to a Microservice Architecture. Write a markdown document that maps the boundaries of these three components into distinct, independent services, explaining what database tables they would own and how they would communicate."

## 2. Component Boundaries (Future State)

When migrating our Modular Monolith to Microservices, the system will be split into three independent servers to ensure isolation and vertical scalability:

### Service A: Identity & Auth Service
* **Responsibility:** Manages user registration, login, and JWT token issuance.
* **Database Ownership:** `users` table.
* **Simulated Communication:** Other services will rely on the JWT token generated here. If a direct check is needed, they would use a fetch call like `fetch('http://auth-service/api/verify')` instead of direct DB queries.

### Service B: Product Catalog Service
* **Responsibility:** Serves product data, handles search/filtering, and manages inventory levels.
* **Database Ownership:** `products` table.
* **Decoupling Proof:** This service operates entirely independently. If the Auth Service goes offline, guests can still browse the catalog seamlessly.

### Service C: Order & Checkout Service
* **Responsibility:** Validates payment methods, calculates totals, and persists historical orders.
* **Database Ownership:** `orders` table.
* **Simulated Communication:** When an order is placed, this service would theoretically send an event to the Product Catalog Service to decrement the stock using a message broker or simulated fetch call.
