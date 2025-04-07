```mermaid
graph TD
    Start(Användare Loggar In/Start) --> Dashboard(/)

    subgraph Huvudmeny/Navigation
        Dashboard --> Projekt(Projekt /projekt)
        Dashboard --> Resurser(Resurser /resurser)
        Dashboard --> Rapporter(Rapporter /rapporter)
        Dashboard --> Offert(Offerter /offert)
        Dashboard --> Inställningar(Inställningar /inställningar)
    end

    subgraph Projektsektion
        Projekt --> ProjektOversikt(Översikt /projekt/oversikt)
        Projekt --> ProjektDetaljer(Detaljer /projekt/[id]/detaljer)
        ProjektDetaljer --> Gantt(Gantt-vy /projekt/[id]/gantt)
        ProjektDetaljer --> Kanban(Kanban-vy /projekt/[id]/kanban)
        ProjektDetaljer --> Lista(Listvy /projekt/[id]/lista)
        ProjektDetaljer --> Ekonomi(Ekonomi /projekt/[id]/ekonomi)
    end

    %% Styling för att highlighta start och huvudsidor
    style Dashboard fill:#f9f,stroke:#333,stroke-width:2px
    style Projekt fill:#ccf,stroke:#333,stroke-width:2px
    style Resurser fill:#ccf,stroke:#333,stroke-width:2px
    style Rapporter fill:#ccf,stroke:#333,stroke-width:2px
    style Offert fill:#ccf,stroke:#333,stroke-width:2px
    style Inställningar fill:#ccf,stroke:#333,stroke-width:2px
``` 

```mermaid
graph TD
    Start(Användare Loggar In/Start) --> Dashboard(/)

    subgraph Huvudmeny/Navigation
        Dashboard --> Projekt(Projekt /projekt)
        Dashboard --> Resurser(Resurser /resurser)
        Dashboard --> Rapporter(Rapporter /rapporter)
        Dashboard --> Offert(Offerter /offert)
        Dashboard --> Inställningar(Inställningar /inställningar)
    end

    subgraph Projektsektion
        Projekt --> ProjektOversikt(Översikt /projekt/oversikt)
        Projekt --> ProjektDetaljer(Detaljer /projekt/[id]/detaljer)
        ProjektDetaljer --> Gantt(Gantt-vy /projekt/[id]/gantt)
        ProjektDetaljer --> Kanban(Kanban-vy /projekt/[id]/kanban)
        ProjektDetaljer --> Lista(Listvy /projekt/[id]/lista)
        ProjektDetaljer --> Ekonomi(Ekonomi /projekt/[id]/ekonomi)
    end

    subgraph Resurssektion
        Resurser --> ResourceDashboard(Dashboard /resources)
        ResourceDashboard --> ResourceDetail(Resursdetalj /resources/[id])
        ResourceDashboard --> ResourceAllocation(Resursallokering /resources/allocation)
        ResourceDashboard --> ResourceCapacity(Kapacitetsoversikt /resources/capacity)
    end

    %% Styling för att highlighta start och huvudsidor
    style Dashboard fill:#f9f,stroke:#333,stroke-width:2px
    style Projekt fill:#ccf,stroke:#333,stroke-width:2px
    style Resurser fill:#ccf,stroke:#333,stroke-width:2px
    style Rapporter fill:#ccf,stroke:#333,stroke-width:2px
    style Offert fill:#ccf,stroke:#333,stroke-width:2px
    style Inställningar fill:#ccf,stroke:#333,stroke-width:2px
    style ResourceDashboard fill:#cfc,stroke:#333,stroke-width:2px
``` 