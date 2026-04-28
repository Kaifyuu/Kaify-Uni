# Kaify-Uni
A repository made for my university projects.

```mermaid
flowchart LR
    %% Actor Definition
    Customer([Customer / Site Visitor])

    %% System Subject Boundary
    subgraph E-Commerce Store Template
        direction TB
        UC1([View Home Banner])
        UC2([Browse Products Grid])
        UC3([Add Item to Cart])
        UC4([Subscribe to Service])
        UC5([Navigate to Contact Footer])
    end

    %% Associations (Actor to Use Cases)
    Customer --- UC1
    Customer --- UC2
    Customer --- UC3
    Customer --- UC4
    Customer --- UC5

    %% Styling to resemble UML Use Cases
    classDef usecase fill:#f9f9f9,stroke:#333,stroke-width:1px;
    class UC1,UC2,UC3,UC4,UC5 usecase;
    classDef actor fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    class Customer actor;
