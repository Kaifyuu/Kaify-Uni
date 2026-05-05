# Login Security Architecture

## Sequence Diagram (Login Handshake)
```mermaid
sequenceDiagram
    participant Client as Client (Browser)
    participant Gateway as API Gateway
    participant Server as Auth Server (Express.js)
    participant DB as Database (MySQL)

    note over Client, Gateway: 1. Client sends email/password
    Client->>Gateway: POST /login {email, password} (via HTTPS)
    Gateway->>Server: Route request to Auth Controller
    
    note over Server, DB: 2. Server checks database
    Server->>DB: Query: findUser(email)
    
    alt User Found
        DB-->>Server: Return User Data (with Hashed Password)
        Server->>Server: bcrypt.compare(inputPassword, storedHash)
        
        alt Password Matches
            note over Server, Server: 3. Server creates a Token
            Server->>Server: jwt.sign({userId}, secret) -> Token
            
            note over Server, Client: 4. Server sends Token back to Client
            Server-->>Gateway: Return 200 OK + { token }
            Gateway-->>Client: Response 200 OK + { token }
            
            note over Client, Client: 5. Client stores Token
            Client->>Client: localStorage.setItem('token', token)
        else Password Invalid
            Server-->>Gateway: Return 401 Unauthorized
            Gateway-->>Client: Response 401 (Invalid email or password)
        end
        
    else User Not Found
        DB-->>Server: Return null
        Server-->>Gateway: Return 401 Unauthorized
        Gateway-->>Client: Response 401 (Invalid email or password)
    end
