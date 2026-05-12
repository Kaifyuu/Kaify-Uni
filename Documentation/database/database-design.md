# Database Schema Architecture

## 1. GenAI Prompt
**Prompt:** "Act as a Database Administrator. Write a relational MySQL schema for an e-commerce platform. Include: 1. A 'users' table with an 'isAdmin' flag. 2. A 'products' table with 'stock' and 'id' as VARCHAR. 3. An 'orders' table to track parent metadata. 4. An 'order_items' table that links products to orders using foreign keys, supporting CASCADE deletes. Use the mysql2/promise library for async connection pooling."

## 2. Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"

    USERS {
        int id PK
        varchar username UNI
        varchar password
        tinyint isAdmin
    }

    PRODUCTS {
        varchar id PK
        varchar name
        decimal price
        int stock
        varchar category
    }

    ORDERS {
        int id PK
        int userId FK
        varchar date
        decimal total
        json items
        int statusStep
        varchar statusText
        text cancelComment
    }

    ORDER_ITEMS {
        int id PK
        int orderId FK
        varchar productId FK
        int quantity
        decimal price
    }
```
