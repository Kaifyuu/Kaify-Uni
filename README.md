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

![E-Commerce System Architecture Component Diagram](https://uml.planttext.com/plantuml/png/ZLLTJzim57sFbFzmLIG-f44P6XAWQO9-X88OL4rO7xOzkCbjwk76aUrIkcd_VTUE4qe7qzeNQfzpp_6zn-PS6wRCOYx2GE3KW96WU3upa765gU6o20Fzm8kIAJQ7LCvBMM1XOhCI21R1YbnW68J13Wo825rP6CMq0GlXHVug7Nw50T2dmzA7NCb5aNMba0gs-k-ZuwZlDwNAKFcDmwEJazxxQYCYYNhPVSBWzxfCnWoRC8rlgaHHTDhzy8fArEaU7lN-JoKLSf6zBN5ilwz8dFRjzryIOL1IDPOZjBg2ssub71NiZcVCm19Xik32xBLgwQzZd417oQL6zQtO7IIVRzhTE6v_OGKNWi5rlFSTc8QgrgR2HLaAdZ8xQ2-Jp11kySb0fCWUBQr9NGolO2GNXd1jiBengaSdYmVvmJkubHaU_D2qsNyg5MfTILUekiR2-9H88HptUfmG8oOukV0KY_A4g-AHZ4krMcCvJBFXWNUspR0DtHcc3-Ho4r-l-nuqCMdrw2z_-X6MWgMeGSYKYPYgspPjKnVlRjSQSK_DXeiqfOaR3RsEgsyNUnsF62gPBLBoGBM5p6kCNsvWbUS1r-w07kGMBSJvh8BMwZzHsmicN3UvjKXcwUTOAf5HBmpcoirHh_aSijNS9kYI6LooLJEes2XU8j0y_OJSRq-APxmiwUhQxORHPterbDfuF45ernFwSyORNyyQM6INYcSLms7yYNOW4d89SkgkQXZuc7_St__aim9dq891aWnZIiQe7oVM2r3fPZxL--Jc0bCqwMolPKjxkgtaWdPMvLN3ZSnvqHvXJgssMLm3FWUiGTVJYv6fT8Rw1Rx9LmFlqXiAyM8ovox3reXJj-Wg5HQBBDFjiUAEeJ0ZKSu4rNusu5hGPAGcDI5gmtr9BKCxC9a-KETgAvRdOqEic3qI9k8K5_uJisf7Ry3NZvtGevyJfAfBgjR0vacgCQ-1MsCKzAPZgvxkY_e-OsVsF3GnJOvSOEtHkRqOAjjaLAaYoYKMgDn17ILHz5xPH6vjCFwsL5qeklbJhkQODTR2u9poIF_e_W00)
