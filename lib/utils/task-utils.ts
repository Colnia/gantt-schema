import { Task, TaskPriority, TaskStatus, Project } from "@/lib/types"

export interface StatusInfo {
  label: string;
  color: string;
  textColor: string;
  description: string;
}

export const STATUS_INFO: Record<TaskStatus, StatusInfo> = {
  "not-started": {
    label: "Ej påbörjad",
    color: "bg-slate-400",
    textColor: "text-white",
    description: "Uppgiften är inte påbörjad än"
  },
  "in-progress": {
    label: "Pågående",
    color: "bg-blue-500",
    textColor: "text-white",
    description: "Arbete pågår med uppgiften"
  },
  "completed": {
    label: "Avslutad",
    color: "bg-green-500",
    textColor: "text-white", 
    description: "Uppgiften är slutförd"
  },
  "delayed": {
    label: "Försenad",
    color: "bg-amber-500",
    textColor: "text-white",
    description: "Uppgiften har försenats"
  },
  "cancelled": {
    label: "Avbruten",
    color: "bg-red-500",
    textColor: "text-white",
    description: "Uppgiften har avbrutits"
  },
  // Svenska alias
  "Ej påbörjad": {
    label: "Ej påbörjad",
    color: "bg-slate-400",
    textColor: "text-white",
    description: "Uppgiften är inte påbörjad än"
  },
  "Pågående": { 
    label: "Pågående",
    color: "bg-blue-500", 
    textColor: "text-white",
    description: "Arbete pågår med uppgiften"
  },
  "Avslutad": { 
    label: "Avslutad",
    color: "bg-green-500", 
    textColor: "text-white",
    description: "Uppgiften är slutförd"
  },
  "Pausad": { 
    label: "Pausad",
    color: "bg-purple-500", 
    textColor: "text-white",
    description: "Arbetet med uppgiften är tillfälligt pausat"
  }
};

/**
 * Returnerar CSS-klassnamn för bakgrundsfärg baserat på uppgiftsstatus.
 */
export const getStatusColor = (status: TaskStatus): string => {
  return STATUS_INFO[status]?.color || "bg-slate-400";
}

/**
 * Returnerar information om en status.
 */
export const getStatusInfo = (status: TaskStatus): StatusInfo => {
  return STATUS_INFO[status] || STATUS_INFO["not-started"];
}

/**
 * Returnerar alla statustyper som ska visas i legenden
 */
export const getStatusLegendItems = (): StatusInfo[] => {
  // Returnera bara de unika statustyperna (ej duplicerade svenska/engelska versioner)
  const uniqueStatuses = new Set<string>();
  const legendItems: StatusInfo[] = [];
  
  Object.entries(STATUS_INFO).forEach(([key, info]) => {
    if (!uniqueStatuses.has(info.label)) {
      uniqueStatuses.add(info.label);
      legendItems.push(info);
    }
  });
  
  return legendItems;
}

/**
 * Returnerar CSS-klassnamn för bakgrundsfärg baserat på uppgiftsprioritet.
 */
export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "low":
    case "Låg":
      return "bg-slate-400"
    case "medium":
    case "Medium":
      return "bg-blue-500"
    case "high":
    case "Hög":
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
  // Hitta fasen själv
  const phase = tasks.find((t) => t.id === phaseId);
  if (!phase) return 0;

  // Hitta alla uppgifter som tillhör denna fas (via phaseId)
  const childTasks = tasks.filter((t) => t.phaseId === phaseId);
  
  // Om det inte finns några underuppgifter, använd fasens egen progress
  if (childTasks.length === 0) return phase.progress || 0;

  // Beräkna genomsnittlig progress för alla underuppgifter
  const totalProgress = childTasks.reduce((sum, task) => {
    // Räkna avslutade uppgifter som 100% klara
    if (task.status === "completed" || task.status === "Avslutad") {
      return sum + 100;
    }
    // Använd uppgiftens progress-värde (eller 0 om det saknas)
    return sum + (task.progress || 0);
  }, 0);

  return Math.round(totalProgress / childTasks.length);
}

/**
 * Beräknar projektframsteg baserat på faser eller alla uppgifter.
 */
export const calculateProjectProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0;
  
  // Hitta alla faser (uppgifter med isPhase=true)
  const phases = tasks.filter((t) => t.isPhase);
  
  // Om det finns faser, beräkna framsteg baserat på faserna
  if (phases.length > 0) {
    const totalProgress = phases.reduce((sum, phase) => {
      // Använd fasens egen progress om den finns, annars beräkna från dess underuppgifter
      const phaseProgress = phase.progress || calculatePhaseProgress(tasks, phase.id);
      return sum + phaseProgress;
    }, 0);
    
    return Math.round(totalProgress / phases.length);
  }
  
  // Om det inte finns några faser, beräkna framsteg baserat på alla uppgifter
  const totalProgress = tasks.reduce((sum, task) => {
    if (task.status === "completed" || task.status === "Avslutad") {
      return sum + 100;
    }
    return sum + (task.progress || 0);
  }, 0);
  
  return Math.round(totalProgress / tasks.length);
}

/**
 * Uppdaterar framsteg för alla faser i ett projekt och projektet själv.
 */
export const updatePhasesProgress = (tasks: Task[]): Task[] => {
  // Hitta alla faser
  const phases = tasks.filter((t) => t.isPhase);
  
  // Uppdatera progress för varje fas
  const updatedTasks = tasks.map((task) => {
    if (task.isPhase) {
      const progress = calculatePhaseProgress(tasks, task.id);
      return { ...task, progress };
    }
    return task;
  });
  
  return updatedTasks;
}

/**
 * Calculates progress for a task based on its current state.
 */
export const calculateTaskProgress = (task: Task): number => {
  // If task has progress value, use it
  if (task.progress !== undefined) {
    return task.progress;
  }
  
  // If it's a phase and has subtasks, calculate from subtasks
  if (task.isPhase && task.subTasks && task.subTasks.length > 0) {
    // If we can't access the subtasks directly, return 0 or current progress
    return 0;
  }
  
  // Default progress based on status
  switch (task.status) {
    case "completed":
      return 100;
    case "in-progress":
      return 50;
    case "delayed":
      return 30;
    case "cancelled":
      return 0;
    case "not-started":
    default:
      return 0;
  }
} 