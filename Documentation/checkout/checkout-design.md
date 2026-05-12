# Checkout Flow Logic Map

## 1. GenAI Prompt
**Prompt:** "Write an Express POST route for /api/checkout using a Controller-Route-Service pattern. The logic should use a MySQL transaction to: 1. Lock product rows with FOR UPDATE to prevent race conditions. 2. Verify stock availability. 3. Calculate the total server-side including shipping. 4. Insert records into 'orders' and 'order_items' tables. 5. Decrement stock. 6. Handle errors with a rollback and return specific HTTP 400 errors for invalid inputs like email regex or card formatting."

## 2. Decision Tree (Logic Map)
```mermaid
graph TD
    A[Browser Sends POST /api/checkout] --> B{Is Cart Empty?}
    B -- Yes --> C[Reject: 400 Cart Empty]
    B -- No --> D{Input Validation<br>Email & Card Regex}
    D -- Fail --> E[Reject: 400 Invalid Input]
    D -- Pass --> F[Checkout Service:<br>Begin Transaction]
    F --> G[SELECT ... FOR UPDATE<br>Lock Product Rows]
    G --> H{Stock Available?}
    H -- No --> I[Rollback & Reject: 400 Out of Stock]
    H -- Yes --> J[Calculate Total &<br>Insert Parent Order]
    J --> K[Insert Child Order Items]
    K --> L[Update Product Stock<br>Stock = Stock - Qty]
    L --> M[Commit Transaction]
    M --> N[Success 200: Return Order Summary]
```
