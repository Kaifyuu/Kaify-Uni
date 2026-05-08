# Application Component Diagram

## 1. GenAI Prompt
**Prompt:** "Based on my current Node.js/Express Modular Monolith, generate a UML Component Diagram using Mermaid.js. The diagram should show the Client making HTTP requests to the Express Router (`server.js`), which then routes traffic to three distinct modular components: Auth (`routes/auth.js`), Products (`routes/products.js`), and Checkout (`routes/checkout.js`). These components should all communicate with a shared Database Connection Pool (`db.js`), which connects to the Aiven MySQL database tables."

## 2. Component Diagram

```mermaid
flowchart TB
    subgraph Client [Client Interface]
        Browser["Web Browser (index.html, JS)"]
    end

    subgraph Server [Node.js Application Server]
        Router["API Router (server.js)"]
        
        subgraph Components [Service Components]
            Auth["Auth Service (routes/auth.js)"]
            Products["Product Service (routes/products.js)"]
            Checkout["Checkout Service (routes/checkout.js)"]
        end

        DBClient["Database Connection Pool (db.js)"]
    end

    subgraph Database [Aiven MySQL Database]
        DB_Users[("users table")]
        DB_Products[("products table")]
        DB_Orders[("orders table")]
    end

    %% Client to Server interactions
    Browser -- "HTTP GET/POST" --> Router

    %% Router delegating to components
    Router -- "/api/login, /api/register" --> Auth
    Router -- "/api/products" --> Products
    Router -- "/api/checkout" --> Checkout

    %% Components to Database Interface
    Auth -. "Queries/Inserts" .-> DBClient
    Products -. "Queries" .-> DBClient
    Checkout -. "Validates/Inserts" .-> DBClient

    %% Database Interface to actual Tables
    DBClient ===> DB_Users
    DBClient ===> DB_Products
    DBClient ===> DB_Orders
