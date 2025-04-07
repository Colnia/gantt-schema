```mermaid
graph LR
    A[Startar Applikationen] --> B{Projektöversikt (/)}
    B -- Klickar på projekt --> C{Gantt-vy (/gantt/[id])}
    B -- Klickar "Nytt Projekt" --> D[Skapa Projekt Dialog]
    D -- Sparar --> B
    C -- Klickar "Lägg till uppgift" --> E[Lägg till Uppgift Dialog]
    E -- Sparar --> C
    C -- Klickar på uppgiftsstapel --> F[Uppgiftsdetaljer Dialog]
    F -- Klickar "Redigera" --> G[Redigera Uppgift Dialog]
    G -- Sparar --> C
    F -- Klickar "Stäng" --> C
    C -- Använder Gantt Toolbar --> C
    C -- Byter Vy (Faser/Lista) --> C
    C -- Går Tillbaka --> B

    subgraph "Gantt-vy Interaktioner"
        direction LR
        C -- Drar uppgiftsstapel --> C
        C -- Resizar uppgiftsstapel --> C
        C -- Högerklickar på uppgift --> H[Kontextmeny]
        H -- Väljer alternativ --> C
    end

    subgraph "Dialoger"
        direction TB
        D
        E
        F
        G
    end

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
``` 