# Product Filter Architecture

## 1. The Contract Table
| Component | Request (The Order) | Response (The Delivery) |
| :--- | :--- | :--- |
| **Method** | GET | |
| **Endpoint** | `/api/products?category=Merchandise` | |
| **Headers** | `Accept: application/json` | `Content-Type: application/json` |
| **Status Code** | | 200 OK (or 500 Internal Server Error) |
| **Body** | (Empty) | `[{"id": "3", "name": "Physical Merchandise T-Shirt", "category": "Merchandise"...}]` |

## 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant Client as Browser (Frontend)
    participant API as Express Gatekeeper
    participant Logic as Controller / Service

    Client->>API: GET /api/products?category=Merchandise
    activate API
    API->>Logic: Pass query param 'Merchandise'
    activate Logic
    Logic->>Logic: Filter products.json by category
    Logic-->>API: Return filtered subset
    deactivate Logic
    API-->>Client: 200 OK + Filtered JSON Body
    deactivate API
```
