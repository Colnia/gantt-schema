```mermaid
graph TD
    AppContext(AppContextProvider) --> ProjectCtx(ProjectProvider)
    AppContext --> UICtx(UIProvider)
    AppContext --> SelectionCtx(SelectionProvider)
    AppContext --> InteractionCtx(InteractionProvider)

    ProjectCtx --> UseProjects(useProjects Hook)
    UICtx --> UseUI(useUI Hook)
    SelectionCtx --> UseSelection(useSelection Hook)
    InteractionCtx --> UseInteraction(useInteraction Hook)

    style AppContext fill:#f9f,stroke:#333,stroke-width:2px
``` 