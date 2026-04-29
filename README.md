# Kaify-Uni
A repository made for my university project.
You can view the progress so far at https://kaifyuu.github.io/Kaify-Uni/

![E-Commerce UML Diagram](https://uml.planttext.com/plantuml/png/VLNhRjem5FuVAUzWCMdxHLSAj1GXL9f2LwdLK14Fu3c7O3MnaUsqOvTtt_4DceWkI1X_v_FvpitXHXkgJ5sLQLB2nX0ZYUB5rf2SAs26Iv4cQVA5V4EGP58OHRKXAxClkIZIHBzmiQEALgJMmAW6yZjD23wtbBqKIjOYpsGf5Vaqxos6YtamIfM32eRpYz7ehkSD2nI8i7kEy8h_0j8RfCdVzwgK6IH_fBbmpodDblCMt93OeLTQV9pOOcO_9qJwxlcVY2tip6QWqyHdqhcl0UkRrTh82bI7K4qST20yGy6r0GLvauNuMeCwy5Ru3MIMLrmWNr7SEfv33gmbtLSW3Bcd1jxetZ4YDfdCVwAGeELqUdIxvRiTjfxCbW-EVG2QT9lQWzY2ueOA1caIuYFTFrEV4Hb7WhRqMEREl9l92hDYG9ObDHkfgauiVXoopgsIRxX-9YkWYk5aKaDBMRY8rbclnNwYmhfURQKFDSEH3zIB5ZNR0dkHTJJtM-POVVALFCg2Yq0Rd1PSAhdXfGtpkvqB7TX3p_xmJ5upWxLvnIP8jG-7Bbjqv37G6dqlwX9LogR6rMdljWNspBCi8L979yE9_iCq1EvrkroqP3Ls2Ovpy8oxwBftdFEbuXLLUymBoqVTcmNxxYUXsvtwhhtVNZIt_UPsOBqUPif1GmkvyGx0PNDxrToEV5ohFVQpmdx6wMr5Y3cx0w4E5kYTEoHcxFsidnxn92lh70WLkNE7ontiS071E6X_9nnbZEyHhDyw8xaZQ295jEK8Mva-EJkpWLxZJPbCk3VQktKqOIGjczNmqkEmsfwW3isjoCvcXJd-W2rzvNYXyNqV8h5-1y5ltxa5TzvxlS5V-2_n3m00)

```mermaid
flowchart TD
    %% Styling for UML Activity Diagram conventions
    classDef startEnd fill:#333,stroke:#333,stroke-width:2px,color:#fff,shape:circle;
    classDef activity fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef decision fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,shape:diamond;

    %% Nodes
    Start((Start)):::startEnd
    Nav[Navigate to Registration Page]:::activity
    Input[Enter Name, Email, and Password]:::activity
    Validate{Is Input Valid?}:::decision
    ShowErr[Display Validation Error]:::activity
    CheckDB{Does Email Exist?}:::decision
    ShowExistErr[Display 'Email in Use' Error]:::activity
    SaveDB[Save User to Database]:::activity
    SendEmail[Send Verification Email]:::activity
    Success[Display Success Message]:::activity
    End((End)):::startEnd

    %% Flow/Paths
    Start --> Nav
    Nav --> Input
    Input --> Validate
    
    %% Validation Loop
    Validate -->|No| ShowErr
    ShowErr --> Input
    
    %% Database Check Loop
    Validate -->|Yes| CheckDB
    CheckDB -->|Yes| ShowExistErr
    ShowExistErr --> Input
    
    %% Success Path
    CheckDB -->|No| SaveDB
    SaveDB --> SendEmail
    SendEmail --> Success
    Success --> End
```
```mermaid
sequenceDiagram
    %% Actors and Objects
    participant Browser
    participant JS as JavaScript
    participant Server

    %% The Execution Flow
    Browser->>JS: requestProducts()
    
    activate JS
    JS->>Server: fetch()
    
    activate Server
    Server-->>JS: return JSON
    deactivate Server
    
    JS->>Browser: renderProducts()
    deactivate JS
```
```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#333,stroke:#333,stroke-width:2px,color:#fff,shape:circle;
    classDef activity fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef decision fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,shape:diamond;

    %% Nodes
    Start((Start)):::startEnd
    UserAction[User Action: <br> Type Search or Select Category]:::activity
    CaptureInput[Capture Input: <br> Get Search Term & Category]:::activity
    FilterArray[Filter Array: <br> Compare inputs against allProducts]:::activity
    CheckResults{Are there matching <br> products?}:::decision
    UpdateDOM_Grid[Update DOM: <br> Render Product Grid]:::activity
    UpdateDOM_Empty[Update DOM: <br> Show 'No results found' message]:::activity
    End((End)):::startEnd

    %% Flow
    Start --> UserAction
    UserAction --> CaptureInput
    
    %% Implicitly answering Consideration #1
    CaptureInput -->|If inputs are empty, matches ALL| FilterArray
    
    FilterArray --> CheckResults
    
    %% Answering Consideration #2
    CheckResults -->|Yes| UpdateDOM_Grid
    CheckResults -->|No| UpdateDOM_Empty
    
    UpdateDOM_Grid --> End
    UpdateDOM_Empty --> End
```
```mermaid
@startuml
left to right direction
skinparam componentStyle rectangle

' High Contrast Styling
skinparam component {
    BackgroundColor #E1F5FE
    BorderColor #0288D1
    FontColor #000000
}
skinparam database {
    BackgroundColor #FFF9C4
    BorderColor #FBC02D
    FontColor #000000
}
skinparam cloud {
    BackgroundColor #F5F5F5
    BorderColor #9E9E9E
    FontColor #000000
}

package "Client Tier (What we built)" {
    [Web Browser\n(HTML/CSS/Vanilla JS)] as Client
}

package "Application Tier (The Next Frontier)" {
    [API Router / Web Server\n(e.g., Node.js / Express)] as Server
    [Auth Controller\n(JWT / Sessions)] as Auth
    [Inventory Controller] as Inventory
    [Order & Checkout Controller] as Checkout
}

database "Data Tier (Replaces localStorage & JSON)" {
    [User Accounts DB] as UserDB
    [Product Catalog DB] as ProductDB
    [Order History DB] as OrderDB
}

cloud "External Services (Real World Integrations)" {
    [Payment Gateway\n(e.g., Stripe API)] as Stripe
    [Shipping API\n(e.g., EasyPost)] as ShipAPI
    [Email Service\n(e.g., SendGrid)] as Email
}

' Flow of data
Client <--> Server : " HTTPS / REST API \n(Replaces direct JSON fetch)"

Server --> Auth : Routes Login/Register
Server --> Inventory : Routes Product Searches
Server --> Checkout : Routes Cart Submission

Auth --> UserDB : Reads/Writes Credentials
Inventory <--> ProductDB : Reads Catalog / Updates Stock
Checkout --> OrderDB : Saves Finalized Orders
Checkout --> Inventory : Triggers Stock Reduction

Auth --> Email : Triggers "Welcome" Email
Checkout --> Stripe : Processes Real Credit Card
Checkout --> ShipAPI : Generates Real Tracking #
Checkout --> Email : Triggers "Order Confirmed" Email

@enduml
```
