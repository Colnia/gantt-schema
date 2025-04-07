```mermaid
graph TD
    Layout(app/layout.tsx) --> AppCtx(AppContextProvider)
    AppCtx --> Page(app/gantt/[id]/page.tsx)
    Page --> ViewCtrl(ViewControls)
    Page --> GC(GanttChart)

    subgraph GanttChart Komponenter
        direction TB
        GC --> Toolbar(GanttToolbar)
        GC --> TaskList(EnhancedTaskList)
        GC --> TimelineContainer(div ref=ganttRef)
        TimelineContainer --> Timeline(Timeline)
        Timeline --> TaskBars(TaskBar)
        Timeline --> Milestones(Milestone)
        Timeline --> DepLines(DependencyLine)
        TimelineContainer --> Legend(GanttLegend)
        GC --> Dialogs(...)
    end

    subgraph Dialoger
        Dialogs --> CreateProjDlg(CreateProjectDialog)
        Dialogs --> AddTaskDlg(AddTaskDialog)
        Dialogs --> EditTaskDlg(EditTaskDialog)
        Dialogs --> DetailsDlg(TaskDetailsDialog)
        Dialogs --> ResourceDlg(ResourceDetailsDialog)
    end

    style GC fill:#ccf,stroke:#333,stroke-width:2px
``` 

```mermaid
graph TD
    Layout(app/layout.tsx) --> AppCtx(AppContextProvider)
    AppCtx --> Page1(app/gantt/[id]/page.tsx)
    AppCtx --> Page2(app/resources/page.tsx)
    Page1 --> ViewCtrl(ViewControls)
    Page1 --> GC(GanttChart)
    Page2 --> RD(ResourceDashboard)

    subgraph GanttChart Komponenter
        direction TB
        GC --> Toolbar(GanttToolbar)
        GC --> TaskList(EnhancedTaskList)
        GC --> TimelineContainer(div ref=ganttRef)
        TimelineContainer --> Timeline(Timeline)
        Timeline --> TaskBars(TaskBar)
        Timeline --> Milestones(Milestone)
        Timeline --> DepLines(DependencyLine)
        TimelineContainer --> Legend(GanttLegend)
        GC --> GDialogs(Gantt-Dialoger)
    end

    subgraph Resurskomponenter
        direction TB
        RD --> ResSummary(ResourceSummary)
        RD --> ResCards(ResourceCards)
        RD --> ResHistogram(ResourceHistogram)
        RD --> RDialogs(Resurs-Dialoger)
    end

    subgraph Dialoger
        GDialogs --> CreateProjDlg(CreateProjectDialog)
        GDialogs --> AddTaskDlg(AddTaskDialog)
        GDialogs --> EditTaskDlg(EditTaskDialog)
        GDialogs --> DetailsDlg(TaskDetailsDialog)
        GDialogs --> ResourceDlg(ResourceDetailsDialog)
        GDialogs --> PhaseDlg(PhaseDialog)
        GDialogs --> ActivityDlg(ActivityDialog)
        RDialogs --> ResAssignDlg(ResourceAssignmentDialog)
    end

    style GC fill:#ccf,stroke:#333,stroke-width:2px
    style RD fill:#cfc,stroke:#333,stroke-width:2px
    style ResHistogram fill:#cfc,stroke:#333,stroke-width:2px
``` 