# Kaify-Uni
A repository made for my university projects.

```mermaid
flowchart LR
    %% Primary Actors
    Guest([Guest Customer])
    RegUser([Registered Customer])
    Admin([Store Administrator])

    %% Secondary / External Actors
    Payment([External: Payment Gateway])
    Shipping([External: Shipping API])

    %% Actor Inheritance (Registered User can do everything a Guest can)
    RegUser -.->|Inherits| Guest

    %% System Boundary
    subgraph E-Commerce Platform
        direction TB
        
        %% Frontend / Customer Use Cases
        UC1(Browse & Search Catalog)
        UC2(Manage Shopping Cart)
        UC3(Checkout)
        UC4(Register / Login)
        UC5(Manage Profile & Order History)

        %% Backend / Admin Use Cases
        UC6(Manage Product Inventory)
        UC7(Process & Fulfill Orders)
        UC8(Manage Users & Roles)

        %% System / Included Use Cases
        UC9(Process Payment)
        UC10(Calculate Shipping Rates)
    end

    %% Guest Associations
    Guest --- UC1
    Guest --- UC2
    Guest --- UC3
    Guest --- UC4

    %% Registered User Associations
    RegUser --- UC5

    %% Admin Associations
    Admin --- UC6
    Admin --- UC7
    Admin --- UC8

    %% External System Associations
    UC9 --- Payment
    UC10 --- Shipping

    %% Include / Extend Relationships
    UC3 -.->|"<<include>>"| UC9
    UC3 -.->|"<<include>>"| UC10
    UC3 -.->|"<<extend>> \n (If not logged in)"| UC4

    %% Styling for UML distinction
    classDef usecase fill:#f9f9f9,stroke:#333,stroke-width:1px;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10 usecase;
    classDef actor fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef extSystem fill:#ffe0b2,stroke:#f57c00,stroke-width:2px;
    class Guest,RegUser,Admin actor;
    class Payment,Shipping extSystem;
    classDef actor fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    class Customer actor;
