export type TaskStatus = "not-started" | "in-progress" | "completed" | "delayed" | "cancelled" | "Ej påbörjad" | "Pågående" | "Avslutad" | "Pausad"
export type TaskPriority = "low" | "medium" | "high" | "critical" | "Låg" | "Medium" | "Hög"

export interface Resource {
  id: string
  name: string
  role?: string
  avatar?: string
  availability?: number // percentage
  color?: string
  
  // Nya fält från integrationen
  type?: string
  email?: string
  phone?: string
  costRate?: number
  capacity?: number
  skills?: Skill[]
  availabilityExceptions?: AvailabilityException[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Dependency {
  id?: string
  fromTaskId?: string
  toTaskId?: string
  type: "finish-to-start" | "start-to-start" | "finish-to-finish" | "start-to-finish" | "Start-till-Start" | "Start-till-Slut" | "Slut-till-Start" | "Slut-till-Slut"
  
  // Nya fält från integrationen
  predecessorId?: string
  successorId?: string
  lagDays?: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Task {
  id: string
  name: string
  description?: string
  startDate: string | Date
  endDate: string | Date
  progress: number
  status: TaskStatus
  priority: TaskPriority
  resources: string[] | ResourceAssignment[]
  dependencies: Dependency[]
  parentTaskId?: string
  milestoneId?: string
  color?: string
  collapsed?: boolean
  isPhase?: boolean
  subTasks?: string[] | Task[]
  
  // Nya fält
  activityType?: string // "task", "milestone", "delivery", "decision"
  
  // Nya fält från integrationen
  estimatedCost?: number
  actualCost?: number
  budgetVariance?: number
  projectId?: string
  phaseId?: string
  isMilestone?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
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
  description?: string
  customer: string
  company?: string
  manager: string
  startDate: Date | string
  plannedEndDate: Date | string
  actualEndDate?: Date | string
  status: string
  budget: number
  costToDate: number
  estimatedTotalCost: number
  phases?: Phase[]
  tasks?: Task[]
  resources?: ResourceAssignment[]
  materialDeliveries?: MaterialDelivery[]
  createdAt?: Date | string
  updatedAt?: Date | string
  isArchived?: boolean
  
  // Äldre fält för kompabilitet
  endDate?: Date | string
  milestones?: Milestone[]
  color?: string
  progress?: number
}

export interface Phase {
  id: string
  name: string
  description?: string
  status: string
  startDate?: Date | string
  endDate?: Date | string
  completionRate: number
  color?: string
  projectId: string
  project?: Project
  tasks?: Task[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface ResourceAssignment {
  id: string
  resourceId: string
  resource?: Resource
  projectId: string
  project?: Project
  phaseId?: string
  phase?: Phase
  taskId?: string
  task?: Task
  startDate: Date | string
  endDate: Date | string
  hoursPerDay: number
  notes?: string
  estimatedCost: number
  actualCost: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface MaterialDelivery {
  id: string
  description: string
  supplier: string
  quantity: number
  unit: string
  cost: number
  expectedDate: Date | string
  actualDate?: Date | string
  status: string
  projectId: string
  project?: Project
  phaseId?: string
  phase?: Phase
  trackingNumber?: string
  contactPerson?: string
  notes?: string
  showOnGantt?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Skill {
  id: string
  name: string
  level: number
  resourceId: string
  resource?: Resource
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface AvailabilityException {
  id: string
  startDate: Date | string
  endDate: Date | string
  reason: string
  notes?: string
  resourceId: string
  resource?: Resource
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  projectId: string
  project?: Project
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type ProjectStatus = 'Planering' | 'Pågående' | 'Färdigt' | 'Försenat'
export type Priority = 'Låg' | 'Medium' | 'Hög'
export type DependencyType = 'Start-till-Start' | 'Start-till-Slut' | 'Slut-till-Start' | 'Slut-till-Slut'

export type TimeScale = "day" | "week" | "month" | "quarter" | "year"
export type ViewMode = "standard" | "compact" | "detailed" 