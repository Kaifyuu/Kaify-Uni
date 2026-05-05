# Checkout Flow Logic Map

## 1. GenAI Prompt
**Prompt:** "Write an Express POST route for /api/checkout. The logic should check: 1. the incoming cart items. 2. An email using regex. 3. A 16-digit credit card number. 4. Then, it should calculate the total. Crucially, include a try...catch block so that if the 'Save Order' step fails, it sends a 400 status with a specific error message for each failed field, and does NOT clear the user's cart on the frontend."

## 2. Decision Tree (Logic Map)
```mermaid
graph TD
    A[Browser Sends POST /api/checkout] --> B{Is Cart Empty?}
    B -- Yes --> C[Reject: 400 Cart Empty]
    B -- No --> D{Is Email Valid?}
    D -- No --> E[Reject: 400 Invalid Email]
    D -- Yes --> F{Is CC 16 Digits?}
    F -- No --> G[Reject: 400 Invalid CC]
    F -- Yes --> H[Calculate Total Server-Side]
    H --> I[Execute DB INSERT]
    I --> J{Did DB Save Succeed?}
    J -- No --> K[Reject: 500 Server Error, Cart Intact]
    J -- Yes --> L[Success 200: Return Order ID, Clear Local Cart]
