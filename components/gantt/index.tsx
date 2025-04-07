"use client"

// Re-export components for easier imports

// Timeline components
export { Timeline } from './Timeline'
export { TaskBar } from './TaskBar'

// Gantt components
export { GanttToolbar } from './GanttToolbar'
export { TaskList } from './TaskList'
export { GanttLegend } from './GanttLegend'
export { TaskGroup } from './TaskGroup'
export { EnhancedTaskList } from './EnhancedTaskList'

// Resource components
export { ResourceSelector } from './ResourceSelector'

// Dialog components
export { AddTaskDialog } from './dialogs/AddTaskDialog'
export { CreateProjectDialog } from './dialogs/CreateProjectDialog'
export { EditTaskDialog } from './dialogs/EditTaskDialog'
export { TaskDetailsDialog } from './dialogs/TaskDetailsDialog'
export { ResourceDetailsDialog } from "./dialogs/ResourceDetailsDialog"
export { ResourceAssignmentDialog } from "./dialogs/ResourceAssignmentDialog"

// Kommer att expanderas med fler komponentexporter allt eftersom vi bryter ut dem 