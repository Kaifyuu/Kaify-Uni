# Product Filter & Search Architecture

## 1. Concurrency Contract
| Feature | Implementation | QA Benefit |
| :--- | :--- | :--- |
| **Search Debounce** | `setTimeout(300ms)` | Prevents excessive API spam while typing. |
| **Race Condition** | `AbortController` | Kills previous fetch if user changes filters rapidly. |
| **Data Sync** | `allProducts` Master Update | Syncs local grid stock with live server data during filter. |

## 2. Sequence Diagram (Debounced Search)
```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Controller as AbortController
    participant API as Backend (MySQL)

    User->>Browser: Types "App..."
    note right of Browser: Wait 300ms
    Browser->>Controller: abort() previous request (if any)
    Browser->>API: GET /api/products?category=...
    activate API
    API-->>Browser: Return fresh product data (with stock)
    deactivate API
    Browser->>Browser: Update allProducts Master Array
    Browser->>Browser: Filter data by "App"
    Browser->>User: Render UI Grid
```
