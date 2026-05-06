# Database Schema Architecture

## 1. GenAI Prompt
**Prompt:** "Act as a Database Administrator. Write the Node.js code to connect my Express app to a MySQL database using the mysql2/promise library. Then, write a SQL INSERT statement that saves an order consisting of user_id, items, and total_price."

## 2. Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    USERS ||--o{ ORDERS : "User_ID"
    
    USERS {
        int id PK
        string name
        string username
        string password
    }
    
    ORDERS {
        int id PK
        int userId FK
        date date
        float total
        json items
        int statusStep
        string statusText
    }
    
    PRODUCTS {
        int id PK
        string name
        string category
        float price
        int stock
        float rating
        string description
        string imageUrl
    }
    
    ORDERS }o--|{ PRODUCTS : "contains"
