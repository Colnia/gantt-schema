import { Task, TaskPriority, TaskStatus, Project } from "@/lib/types"

/**
 * Returnerar CSS-klassnamn för bakgrundsfärg baserat på uppgiftsstatus.
 */
export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case "not-started":
      return "bg-slate-400"
    case "in-progress":
      return "bg-blue-500"
    case "completed":
      return "bg-green-500"
    case "delayed":
      return "bg-amber-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-slate-400"
  }
}

/**
 * Returnerar CSS-klassnamn för bakgrundsfärg baserat på uppgiftsprioritet.
 */
export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "low":
      return "bg-slate-400"
    case "medium":
      return "bg-blue-500"
    case "high":
      return "bg-amber-500"
    case "critical":
      return "bg-red-500"
    default:
      return "bg-slate-400"
  }
}

/**
 * Grupperar uppgifter efter förälder.
 */
export const groupTasksByParent = (tasks: Task[]): { [key: string]: Task[] } => {
  const result: { [key: string]: Task[] } = {
    root: [],
  }

  tasks.forEach((task) => {
    if (task.parentId) {
      if (!result[task.parentId]) {
        result[task.parentId] = []
      }
      result[task.parentId].push(task)
    } else {
      result.root.push(task)
    }
  })

  return result
}

/**
 * Filtrerar uppgifter baserat på sökterm.
 */
export const filterTasksBySearchTerm = (tasks: Task[], searchTerm: string): Task[] => {
  if (!searchTerm) return tasks

  return tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )
}

/**
 * Filtrerar uppgifter baserat på aktuell vy.
 */
export const filterTasksByView = (
  tasks: Task[], 
  currentView: "projects" | "project" | "phase", 
  currentPhase: string | null
): Task[] => {
  // Om vi är i projektöversikten, visa ingen uppsättning av uppgifter
  if (currentView === "projects") {
    return []
  }

  // Om vi är i projektvy, visa bara faser
  if (currentView === "project") {
    return tasks.filter((task) => task.isPhase)
  }

  // Om vi är i fasvy, visa bara uppgifter i den aktuella fasen
  if (currentView === "phase" && currentPhase) {
    return tasks.filter((task) => task.parentId === currentPhase)
  }

  return []
}

/**
 * Beräknar framsteg för en fas baserat på dess underuppgifter.
 */
export const calculatePhaseProgress = (tasks: Task[], phaseId: string): number => {
  const phase = tasks.find((t) => t.id === phaseId)
  if (!phase || !phase.subTasks || phase.subTasks.length === 0) return 0

  const subTasks = tasks.filter((t) => phase.subTasks?.includes(t.id))
  if (subTasks.length === 0) return 0

  const totalProgress = subTasks.reduce((sum, task) => sum + task.progress, 0)
  return Math.round(totalProgress / subTasks.length)
}

/**
 * Beräknar projektframsteg baserat på faser.
 */
export const calculateProjectProgress = (project: Project): number => {
  const phases = project.tasks.filter((t) => t.isPhase)
  if (phases.length === 0) return 0

  const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0)
  return Math.round(totalProgress / phases.length)
}

/**
 * Uppdaterar framsteg för alla faser i ett projekt.
 */
export const updatePhasesProgress = (project: Project): Project => {
  const updatedTasks = project.tasks.map((task) => {
    if (task.isPhase) {
      const progress = calculatePhaseProgress(project.tasks, task.id)
      return { ...task, progress }
    }
    return task
  })

  return {
    ...project,
    tasks: updatedTasks,
  }
} 