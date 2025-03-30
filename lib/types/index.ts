export type TaskStatus = "not-started" | "in-progress" | "completed" | "delayed" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "critical"

export interface Resource {
  id: string
  name: string
  role: string
  avatar?: string
  availability: number // percentage
  color?: string
}

export interface Dependency {
  fromTaskId: string
  toTaskId: string
  type: "finish-to-start" | "start-to-start" | "finish-to-finish" | "start-to-finish"
}

export interface Task {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  progress: number
  status: TaskStatus
  priority: TaskPriority
  resources: string[]
  dependencies: Dependency[]
  parentId?: string
  milestoneId?: string
  color?: string
  collapsed?: boolean
  isPhase?: boolean
  subTasks?: string[]
}

export interface Milestone {
  id: string
  name: string
  date: string
  color?: string
}

export interface Project {
  id: string
  name: string
  startDate: string
  endDate: string
  tasks: Task[]
  milestones: Milestone[]
  resources: Resource[]
  color?: string
  progress?: number
  description?: string
}

export type TimeScale = "day" | "week" | "month" | "quarter" | "year"
export type ViewMode = "standard" | "compact" | "detailed" 