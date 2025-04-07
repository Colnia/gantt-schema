```mermaid
graph TD
    API(app/api)

    subgraph Projekt
        direction LR
        API --> Proj(/projects)
        Proj --> ProjId(/[id])
        ProjId --> ProjTasks(/tasks)
        ProjTasks --> ProjTaskId(/[taskId])
        ProjId --> ProjPhases(/phases)
        ProjId --> ProjBaselines(/baselines)
        ProjId --> ProjComplete(/complete)
        ProjId --> ProjCritPath(/critical-path)
    end

    subgraph Resurser
        direction LR
        API --> Res(/resources)
        Res --> ResId(/[id])
    end

    subgraph Uppgifter
        direction LR
        API --> Task(/tasks)
        Task --> TaskId(/[id])
        TaskId --> TaskReschedule(/reschedule)
        Task --> TaskDeps(/dependencies)
        Task --> TaskRes(/resources)
    end

     subgraph Faser
        direction LR
        API --> Phase(/phases)
        Phase --> PhaseId(/[id])
     end


    style API fill:#f9f,stroke:#333,stroke-width:2px
``` 

```mermaid
graph TD
    API(app/api)

    subgraph Projekt
        direction LR
        API --> Proj(/projects)
        Proj --> ProjId(/[id])
        ProjId --> ProjTasks(/tasks)
        ProjTasks --> ProjTaskId(/[taskId])
        ProjId --> ProjPhases(/phases)
        ProjId --> ProjBaselines(/baselines)
        ProjId --> ProjComplete(/complete)
        ProjId --> ProjCritPath(/critical-path)
    end

    subgraph Resurser
        direction LR
        API --> Res(/resources)
        Res --> ResId(/[id])
        Res --> ResUtil(/utilization)
    end

    subgraph Uppgifter
        direction LR
        API --> Task(/tasks)
        Task --> TaskId(/[id])
        TaskId --> TaskReschedule(/reschedule)
        Task --> TaskDeps(/dependencies)
        Task --> TaskRes(/resources)
    end

     subgraph Faser
        direction LR
        API --> Phase(/phases)
        Phase --> PhaseId(/[id])
     end


    style API fill:#f9f,stroke:#333,stroke-width:2px
    style ResUtil fill:#ccf,stroke:#333,stroke-width:2px
``` 