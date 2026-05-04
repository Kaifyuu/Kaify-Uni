# Registration Security Architecture

## 1. Contract Table
| Component | Request (The Order) | Response (The Delivery) |
| :--- | :--- | :--- |
| **Method** | POST | |
| **Endpoint** | `/api/register` | |
| **Headers** | `Content-Type: application/json` | `Content-Type: application/json` |
| **Status Code** | | 201 Created (or 400 Bad Request / 409 Conflict) |
| **Body** | `{"name": "...", "email": "...", "password": "..."}` | `{"message": "User registered successfully"}` |

## 2. Activity Diagram (Frontend Validation)
```mermaid
flowchart TD
    Start((Start)) --> Input[User enters Name, Email, Password]
    Input --> ValLength{Password >= 8 chars?}
    ValLength -- No --> Err1[Show Length Error]
    ValLength -- Yes --> ValUpper{Has 1 Uppercase?}
    
    ValUpper -- No --> Err2[Show Uppercase Error]
    ValUpper -- Yes --> ValSpec{Has 1 Special Char?}
    
    ValSpec -- No --> Err3[Show Special Char Error]
    ValSpec -- Yes --> Submit[Send POST /api/register]
    
    Err1 --> Input
    Err2 --> Input
    Err3 --> Input
    Submit --> End((End))
```
```mermaid
sequenceDiagram
    participant Client as Browser
    participant API as Express Server
    participant DB as MySQL Database

    Client->>API: POST /api/register (name, email, password)
    activate API
    API->>DB: SELECT id FROM users WHERE username = email
    activate DB
    DB-->>API: Return Result
    deactivate DB
    
    alt User Exists
        API-->>Client: 409 Conflict (User exists)
    else User is New
        API->>API: Hash password with bcrypt
        API->>DB: INSERT INTO users (email, hash)
        activate DB
        DB-->>API: Success
        deactivate DB
        API-->>Client: 201 Created
    end
    deactivate API
```
