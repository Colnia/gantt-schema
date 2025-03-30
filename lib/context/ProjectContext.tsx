"use client"

import React, { createContext, useState, useContext, useMemo, useCallback, ReactNode } from "react"
import { Project, Task } from "@/lib/types"
import { ProjectSchema, TaskSchema } from "../schemas"
import { getTodayFormatted, getFutureDateFormatted } from "@/lib/utils/date-utils"

// Exempeldata (kan flyttas till en separat fil senare)
const sampleProject1: Project = {
  id: "proj-1",
  name: "Webbplats Redesign",
  startDate: "2025-04-01",
  endDate: "2025-07-15",
  tasks: [
    {
      id: "phase-1",
      name: "Planering & Analys",
      description: "Definiera projektets omfattning och mål",
      startDate: "2025-04-01",
      endDate: "2025-04-14",
      progress: 100,
      status: "completed",
      priority: "high",
      resources: ["res-1", "res-2"],
      dependencies: [],
      color: "#4338ca",
      isPhase: true,
      subTasks: ["task-1-1", "task-1-2"],
    },
    {
      id: "task-1-1",
      name: "Kravanalys",
      description: "Samla in och dokumentera krav från intressenter",
      startDate: "2025-04-01",
      endDate: "2025-04-07",
      progress: 100,
      status: "completed",
      priority: "high",
      resources: ["res-2"],
      dependencies: [],
      parentId: "phase-1",
      color: "#4338ca",
    },
    // ... (resten av uppgifterna för sampleProject1)
  ],
  milestones: [
    { id: "milestone-1", name: "Design Godkänd", date: "2025-05-15" },
    // ... (resten av milstolparna för sampleProject1)
  ],
  resources: [
    { id: "res-1", name: "Projektledare", role: "Ledning", availability: 100, color: "#fbbf24" },
    // ... (resten av resurserna)
  ],
}

const sampleProjects: Project[] = [sampleProject1];

interface ProjectContextProps {
  projects: Project[]
  activeProjectId: string | null
  activeProject: Project | null
  setActiveProjectId: (projectId: string | null) => void
  addProject: (projectData: Partial<Project>) => void
  updateProject: (projectId: string, projectData: Partial<Project>) => void
  deleteProject: (projectId: string) => void
  addTask: (projectId: string, taskData: Partial<Task>, parentId?: string) => void
  updateTask: (projectId: string, taskId: string, taskData: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
  // Lägg till fler funktioner vid behov (t.ex. för resurser, milstolpar)
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(sampleProjects[0]?.id || null)

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || null
  }, [projects, activeProjectId])

  const addProject = useCallback((projectData: Partial<Project>) => {
    const newId = `proj-${Date.now()}`
    // Skapa ett preliminärt projektobjekt med standardvärden
    const rawProjectToAdd: Project = {
      id: newId,
      name: projectData.name || "Nytt projekt",
      startDate: projectData.startDate || getTodayFormatted(),
      endDate: projectData.endDate || getFutureDateFormatted(90),
      tasks: projectData.tasks || [],
      milestones: projectData.milestones || [],
      resources: projectData.resources || sampleProjects[0]?.resources || [],
      color: projectData.color || "#0891b2",
      description: projectData.description || "",
      progress: projectData.progress ?? 0,
      // Se till att alla fält som krävs av ProjectSchema finns med
    }

    // Validera projektet
    const validationResult = ProjectSchema.safeParse(rawProjectToAdd);

    if (!validationResult.success) {
      console.error("Fel vid validering av nytt projekt:", validationResult.error.flatten());
      // TODO: Implementera bättre felhantering (t.ex. visa meddelande till användaren)
      return; // Avbryt om datan är ogiltig
    }

    // Använd den validerade datan
    const validatedProject = validationResult.data;

    setProjects((prev) => [...prev, validatedProject])
    setActiveProjectId(newId); // Sätt det nya projektet som aktivt
  }, [])

  const updateProject = useCallback((projectId: string, projectData: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...projectData } : p))
    )
  }, [])

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    if (activeProjectId === projectId) {
      setActiveProjectId(projects[0]?.id || null) // Sätt första projektet som aktivt om det aktiva tas bort
    }
  }, [activeProjectId, projects])

  const addTask = useCallback((projectId: string, taskData: Partial<Task>, parentId?: string) => {
    // Generera ID först
    const newTaskId = `task-${Date.now()}`;

    // Skapa ett preliminärt task-objekt med standardvärden
    // Säkerställ att alla potentiella fält från taskData och standardvärden finns med
    // för att matcha TaskSchema så gott det går innan validering.
    const rawNewTask: any = { // Använd 'any' temporärt för att tillåta partiell data innan validering
      id: newTaskId,
      name: taskData.name || "Ny uppgift",
      startDate: taskData.startDate || getTodayFormatted(),
      endDate: taskData.endDate || getFutureDateFormatted(7),
      progress: taskData.progress ?? 0, // Använd nullish coalescing för default 0
      status: taskData.status || "not-started",
      priority: taskData.priority || "medium",
      resources: taskData.resources || [],
      dependencies: taskData.dependencies || [],
      parentId: parentId,
      description: taskData.description || "",
      color: taskData.color,
      collapsed: taskData.collapsed,
      isPhase: taskData.isPhase,
      subTasks: taskData.subTasks,
      // Ta bort fält som inte tillhör Task-typen om de finns i taskData?
    };

    // Validera uppgiften
    const validationResult = TaskSchema.safeParse(rawNewTask);

    if (!validationResult.success) {
      console.error(`Fel vid validering av ny uppgift för projekt ${projectId}:`, validationResult.error.flatten());
      // TODO: Implementera bättre felhantering
      return; // Avbryt om datan är ogiltig
    }

    // Använd den validerade datan - TypeScript vet nu att detta är en giltig Task
    const validatedTask = validationResult.data;

    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          let updatedTasks = [...p.tasks, validatedTask]; // Använd validerad data

          // Om det finns en parentId, uppdatera förälderns subTasks
          if (validatedTask.parentId) { // Kolla på validerad data
             updatedTasks = updatedTasks.map(task => {
               if (task.id === validatedTask.parentId) {
                 // Säkerställ att subTasks finns innan spridning
                 const currentSubTasks = task.subTasks || [];
                 return {
                   ...task,
                   subTasks: [...currentSubTasks, validatedTask.id] // Använd validerat ID
                 }
               }
               return task;
             })
          }

          return { ...p, tasks: updatedTasks }
        }
        return p
      })
    )
  }, [])

  const updateTask = useCallback((projectId: string, taskId: string, taskData: Partial<Task>) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.map((task) => (task.id === taskId ? { ...task, ...taskData } : task)),
          }
        }
        return p
      })
    )
    // TODO: Lägg till logik för att uppdatera fas-/projektframsteg om nödvändigt
  }, [])

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          const taskToDelete = p.tasks.find(t => t.id === taskId);
          // Ta bort uppgiften från task-listan
          let remainingTasks = p.tasks.filter((task) => task.id !== taskId);
          
          // Ta bort referenser till uppgiften från andra uppgifters beroenden
          remainingTasks = remainingTasks.map(task => ({
             ...task,
             dependencies: task.dependencies.filter(dep => dep.fromTaskId !== taskId && dep.toTaskId !== taskId)
          }))
          
          // Ta bort referenser från förälderns subTasks (om den finns)
          if (taskToDelete?.parentId) {
             remainingTasks = remainingTasks.map(task => {
               if (task.id === taskToDelete.parentId) {
                 return {
                   ...task,
                   subTasks: task.subTasks?.filter(subId => subId !== taskId)
                 }
               }
               return task;
             })
          }
          
          // TODO: Hantera borttagning av underuppgifter om en fas tas bort?
          
          return { ...p, tasks: remainingTasks }
        }
        return p
      })
    )
  }, [])

  const value = useMemo(
    () => ({
      projects,
      activeProjectId,
      activeProject,
      setActiveProjectId,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
    }),
    [projects, activeProjectId, activeProject, setActiveProjectId, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
} 