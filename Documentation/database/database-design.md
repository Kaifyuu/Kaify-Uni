# Database Schema Architecture

## 1. GenAI Prompt
**Prompt:** "Act as a Database Administrator. Write the Node.js code to connect my Express app to a MySQL database using the mysql2/promise library. Then, write a SQL INSERT statement that saves an order consisting of user_id, items, and total_price."

## 2. Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"

    ORDERS {
        int id PK
        int userId FK
        date date
        float total
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }
