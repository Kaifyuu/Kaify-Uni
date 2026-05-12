# Registration Security Architecture

## 1. Security Contract
| Layer | Constraint | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Regex + Pattern | Immediate UX feedback for strong passwords. |
| **Backend** | bcrypt (Salt 10) | Ensures passwords are never stored in plaintext. |
| **Database** | Unique Constraint | Prevents duplicate usernames (email) at the storage layer. |

## 2. Activity Diagram (Validation Flow)
```mermaid
flowchart TD
    Start((Start)) --> Input[User enters Data]
    Input --> ValFrontend{Frontend Regex Match?}
    ValFrontend -- No --> Err1[Display Pattern Error]
    ValFrontend -- Yes --> Post[POST /api/register]
    
    Post --> CheckDB{Username Exists?}
    CheckDB -- Yes --> Err2[Return 409 Conflict]
    CheckDB -- No --> Hash[Hash with bcrypt]
    
    Hash --> Save[INSERT INTO users]
    Save --> Success[Return 201 Created]
    
    Err1 --> Input
    Err2 --> Input
```
