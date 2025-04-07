"use client"

import React, { createContext, useState, useContext, useMemo, useCallback, ReactNode, useEffect } from "react"
import { Project, Task, ResourceAssignment, Phase } from "@/lib/types"
import { ProjectSchema, TaskSchema } from "../schemas"
import { getTodayFormatted, getFutureDateFormatted } from "@/lib/utils/date-utils"
import { updatePhasesProgress, calculateProjectProgress } from "@/lib/utils/task-utils"

// Hjälpfunktion för att läsa projekt från localStorage
const getStoredProjects = (): Project[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      return JSON.parse(storedProjects);
    }
  } catch (error) {
    console.error("Fel vid läsning av projekt från localStorage:", error);
  }
  
  return [];
};

// Hjälpfunktion för att spara projekt till localStorage
const storeProjects = (projects: Project[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem("projects", JSON.stringify(projects));
  } catch (error) {
    console.error("Fel vid sparande av projekt till localStorage:", error);
  }
};

interface ProjectContextProps {
  projects: Project[]
  activeProjectId: string | null
  activeProject: Project | null
  setActiveProjectId: React.Dispatch<React.SetStateAction<string | null>>
  addProject: (projectData: Partial<Project>) => Promise<string | undefined>
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  addTask: (newTask: Task, projectId: string) => Promise<string | undefined>
  updateTask: (updatedTask: Task) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  deletePhase: (phaseId: string) => Promise<void>
  updatePhase: (updatedPhaseData: Partial<Phase> & { id: string }) => Promise<void>
  isLoading: boolean
  error: string | null
  setActiveProject: (project: Project | null | ((prev: Project | null) => Project | null)) => void
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined)

// Hjälpfunktion för att generera ID
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ladda projekt från API när komponenten mountas
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Kunde inte hämta projekt');
        }
        const data = await response.json();

        // Convert date strings to Date objects
        const projectsWithDates = data.map((project: Project) => ({
          ...project,
          startDate: new Date(project.startDate),
          plannedEndDate: new Date(project.plannedEndDate),
          tasks: project.tasks?.map((task: Task) => ({
            ...task,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate),
          })) || [],
        }));

        setProjects(projectsWithDates);
        if (projectsWithDates.length > 0) {
          setActiveProjectId(projectsWithDates[0].id);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Kunde inte ladda projekt. Använder exempeldata.');
        // Använd fallbackdata om API inte fungerar
        setProjects(getStoredProjects());
        setActiveProjectId(getStoredProjects()[0]?.id || null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Update activeProject when activeProjectId changes or projects list updates
  useEffect(() => {
    if (activeProjectId && projects.length > 0) {
      setActiveProject(projects.find((p: Project) => p.id === activeProjectId) || null);
    }
  }, [activeProjectId, projects]);

  const addProject = useCallback(async (projectData: Partial<Project>) => {
    // Vi antar att projektet redan lagts till via API:n i CreateProjectDialog
    // Därför behöver vi bara uppdatera den lokala listan
    // Om id redan finns antar vi att det är ett projekt vi fått från API:n
    
    if (projectData.id) {
      setProjects((prevProjects: Project[]) => [...prevProjects, projectData as Project]);
      return projectData.id;
    }
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectData.name || "Nytt projekt",
          description: projectData.description || "",
          customer: projectData.customer || "Okänd kund",
          manager: projectData.manager || "Okänd projektledare",
          startDate: projectData.startDate || getTodayFormatted(),
          plannedEndDate: projectData.endDate || getFutureDateFormatted(30),
          status: projectData.status || "Planering",
          budget: projectData.budget || 0,
          costToDate: projectData.costToDate || 0,
          estimatedTotalCost: projectData.estimatedTotalCost || 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte skapa projekt');
      }
      
      const data = await response.json();
      
      const newProject: Project = {
        ...data.project,
        tasks: [],
        milestones: [],
        resources: [],
      };
      
      setProjects((prevProjects: Project[]) => [...prevProjects, newProject]);
      return newProject.id;
    } catch (error) {
      console.error('Error adding project:', error);
      return undefined;
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, projectData: Partial<Project>) => {
    if (!projectId) return;
    
    try {
      // Uppdatera UI omedelbart för att ge en responsiv känsla
      setProjects((prev: Project[]) =>
        prev.map((p: Project) => (p.id === projectId ? { ...p, ...projectData } : p))
      );
      
      // Skicka uppdateringen till API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        // Om API-anropet misslyckas, återställ till tidigare data
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte uppdatera projekt');
      }
      
    } catch (error) {
      console.error('Error updating project:', error);
      // Ingen återställning här, det kan vara svårt att implementera rätt
    }
  }, [])

  const deleteProject = useCallback(async (projectId: string) => {
    if (!projectId) return;
    
    try {
      // Optimistisk uppdatering för UI-responsive feeling
      setProjects((prev: Project[]) => prev.filter((p: Project) => p.id !== projectId));
      
      // Ändra aktivt projekt om det borttagna var aktivt
      if (activeProjectId === projectId) {
        const remainingProjects = projects.filter((p: Project) => p.id !== projectId);
        setActiveProjectId(remainingProjects[0]?.id || null);
      }
      
      // Skicka borttagningsförfrågan till API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte ta bort projekt');
      }
      
    } catch (error) {
      console.error('Error deleting project:', error);
      // Vi kan återställa projektet i lokalt tillstånd om API-anropet misslyckas
    }
  }, [activeProjectId, projects])

  const addTask = useCallback(async (newTask: Task, projectId: string) => {
    console.log("===== DEBUGGING ProjectContext.addTask =====");
    
    // Validering av indata
    if (!projectId || typeof projectId !== 'string') {
      console.error('ERROR: Invalid projectId:', projectId);
      return undefined;
    }
    
    try {
      // Generera ID endast om det inte redan finns
      const taskData = {
        ...newTask,
        id: newTask.id || undefined, // ID kommer genereras av databasen
      };
      
      // Optimistisk UI-uppdatering
      const tempId = generateId();
      const tempTask = { ...taskData, id: tempId };
      
      setProjects((prevProjects: Project[]) => {
        return prevProjects.map((project: Project) => {
          if (project.id !== projectId) return project;
          
          // Säkerställ att project.tasks finns
          const currentTasks = project.tasks || [];
          let updatedTasks = [...currentTasks, tempTask] as Task[];
          
          // Uppdatera framsteg
          updatedTasks = updatePhasesProgress(updatedTasks) as Task[];
          const progress = calculateProjectProgress(updatedTasks);
          
          return {
            ...project,
            tasks: updatedTasks,
            progress,
          } as Project;
        });
      });
      
      // Skicka till API
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      // Logga rått svar från API
      const responseStatus = response.status;
      let responseText = "";
      try {
          responseText = await response.text(); // Läs som text först
      } catch (readError) {
          console.error("===== FAILED TO READ RESPONSE BODY =====", readError);
          throw new Error(`Kunde inte läsa svar från API. Status: ${responseStatus}`);
      }
      
      console.log("===== DEBUGGING addTask API Response =====");
      console.log("Status:", responseStatus);
      console.log("Raw Body:", responseText);
      console.log("========================================");

      if (responseStatus !== 201) {
          // Försök parsa som JSON om det är ett fel för att få mer detaljer
          let errorDetails = responseText;
          try {
             const errorJson = JSON.parse(responseText);
             errorDetails = errorJson.error || errorJson.details || responseText;
          } catch (e) { /* Ignorera om det inte är JSON */ }
          throw new Error(`Kunde inte skapa uppgift. Status: ${responseStatus}, Svar: ${errorDetails}`);
      }
      
      // Försök parsa texten som JSON nu
      let createdTask: Task | null = null;
      if (responseText) { // Only parse if there is a body
          try {
             createdTask = JSON.parse(responseText) as Task;
             console.log("Successfully parsed createdTask:", createdTask);
          } catch (parseError) {
             console.error("===== FAILED TO PARSE API RESPONSE JSON =====");
             console.error("Parse Error:", parseError);
             console.error("Raw text was:", responseText);
             console.error("========================================");
             throw new Error('Kunde inte tolka svar från API vid skapande av uppgift.');
          }
      } else {
          console.warn("API response body was empty, cannot get createdTask.");
          throw new Error('API returnerade ett tomt svar.');
      }
      
      // Extra kontroll innan användning
      if (!createdTask || typeof createdTask.id === 'undefined') {
          console.error("createdTask is invalid or missing id after parsing:", createdTask);
          throw new Error('API returnerade inte en giltig uppgift med ett ID.');
      }
      
      console.log("Attempting final UI update with createdTask.id:", createdTask.id);
      
      // Uppdatera UI med korrekt ID från servern
      setProjects((prevProjects: Project[]) => {
        return prevProjects.map((project: Project) => {
          if (project.id !== projectId) return project;
          
          const updatedTasks = project.tasks?.map(task => 
            task.id === tempId ? { ...task, id: createdTask.id } : task
          ) || [];
          
          return {
            ...project,
            tasks: updatedTasks,
          } as Project;
        });
      });
      
      console.log("Final UI update done. Returning task ID.");
      return createdTask.id;
    } catch (error) {
      console.error('ERROR i addTask:', error);
      return undefined;
    }
  }, []);

  const updateTask = useCallback(async (updatedTaskData: Partial<Task> & { id: string }) => {
    console.log('[ProjectContext] updateTask called with:', updatedTaskData); // Log input
    setIsLoading(true);
    setError(null);
    try {
      // TODO: API call to update task on backend
      // const response = await fetch(`/api/tasks/${updatedTaskData.id}`, { method: 'PUT', ... });
      // const updatedTaskFromServer = await response.json();

      setProjects(prevProjects => {
        const newProjects = prevProjects.map(p => {
          if (p.tasks?.some(t => t.id === updatedTaskData.id)) {
            // Update the task first
            const updatedTasks = p.tasks.map(t => 
              t.id === updatedTaskData.id ? { ...t, ...updatedTaskData } : t
            );
            
            // Then apply the phase progress updates
            const tasksWithUpdatedPhases = updatePhasesProgress(updatedTasks);
            
            // Finally calculate the project progress
            const projectProgress = calculateProjectProgress(tasksWithUpdatedPhases);
            
            return {
              ...p,
              tasks: tasksWithUpdatedPhases,
              progress: projectProgress
            };
          }
          return p;
        });
        console.log('[ProjectContext] updateTask - State before setProjects:', prevProjects);
        console.log('[ProjectContext] updateTask - Calculated newProjects:', newProjects); // Log data before setting state
        return newProjects;
      });
      console.log('[ProjectContext] updateTask - setProjects presumably called'); // Log after setting state
    } catch (err: any) {
      console.error("Error updating task:", err);
      setError(err.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  }, [setProjects, setIsLoading, setError]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!taskId) {
      console.error('Invalid task ID for deletion');
      return;
    }
    
    // Hitta projektet som innehåller uppgiften
    const projectWithTask = projects.find((project: Project) => 
      project.tasks?.some((task: Task) => task.id === taskId)
    );
    
    if (!projectWithTask) {
      console.error('Could not find project containing task');
      return;
    }
    
    try {
      // Optimistisk UI-uppdatering först
      setProjects((prevProjects: Project[]) => {
        return prevProjects.map((project: Project) => {
          if (!project.tasks || !project.tasks.some((task: Task) => task.id === taskId)) {
            return project;
          }
          
          let updatedTasks = project.tasks.filter((task: Task) => task.id !== taskId) as Task[];
          updatedTasks = updatePhasesProgress(updatedTasks) as Task[];
          const progress = calculateProjectProgress(updatedTasks);
          
          return {
            ...project,
            tasks: updatedTasks,
            progress,
          } as Project;
        });
      });
      
      // Skicka borttagningsbegäran till API
      const response = await fetch(`/api/projects/${projectWithTask.id}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte ta bort uppgift');
      }
      
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [projects]);

  // Funktion för att ta bort en fas (och dess uppgifter via API)
  const deletePhase = useCallback(async (phaseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/phases/${phaseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte ta bort fasen');
      }

      // Uppdatera lokalt state efter lyckad borttagning
      setProjects((prevProjects: Project[]) => {
        // Find the project containing the phase
        const projectIndex = prevProjects.findIndex((p: Project) => p.phases?.some((ph: Phase) => ph.id === phaseId));
        if (projectIndex === -1) return prevProjects; // Project not found

        const updatedProjects = [...prevProjects];
        const projectToUpdate = { ...updatedProjects[projectIndex] };
        
        // Filter out the deleted phase
        projectToUpdate.phases = projectToUpdate.phases?.filter((ph: Phase) => ph.id !== phaseId) || [];
        
        // Filter out tasks belonging to the deleted phase
        projectToUpdate.tasks = projectToUpdate.tasks?.filter((t: Task) => t.phaseId !== phaseId) || [];
        
        updatedProjects[projectIndex] = projectToUpdate;
        return updatedProjects;
      });

      // Handle activeProject if the deleted phase was in it
      if (activeProject?.phases?.some((ph: Phase) => ph.id === phaseId)) {
        setActiveProject((prevActive: Project | null) => {
          if (!prevActive) return null;
          const updatedActiveProject = { ...prevActive };
          updatedActiveProject.phases = updatedActiveProject.phases?.filter((ph: Phase) => ph.id !== phaseId) || [];
          updatedActiveProject.tasks = updatedActiveProject.tasks?.filter((t: Task) => t.phaseId !== phaseId) || [];
          return updatedActiveProject;
        });
      }

      console.log(`Phase ${phaseId} deleted successfully.`);
      // Optionally add success notification here

    } catch (error: any) {
      console.error("Error deleting phase:", error);
      setError(error.message || 'Ett oväntat fel uppstod vid borttagning av fas');
      // Optionally add error notification here
      // We don't re-throw here, error state is enough for UI feedback
    } finally {
      setIsLoading(false);
    }
  }, [projects, setProjects, activeProject, setActiveProject]);

  // --- Add updatePhase function ---
  const updatePhase = useCallback(async (updatedPhaseData: Partial<Phase> & { id: string }) => {
    console.log('[ProjectContext] updatePhase called with:', updatedPhaseData);
    setIsLoading(true);
    setError(null);
    try {
      // TODO: API call to update phase on backend
      // const response = await fetch(`/api/phases/${updatedPhaseData.id}`, { method: 'PUT', ... });
      // const updatedPhaseFromServer = await response.json();

      setProjects(prevProjects => {
        const newProjects = prevProjects.map(p => {
          if (p.phases?.some(ph => ph.id === updatedPhaseData.id)) {
            return {
              ...p,
              phases: p.phases.map(ph => 
                ph.id === updatedPhaseData.id ? { ...ph, ...updatedPhaseData } : ph
              )
            };
          }
          return p;
        });
        console.log('[ProjectContext] updatePhase - State before setProjects:', prevProjects);
        console.log('[ProjectContext] updatePhase - Calculated newProjects:', newProjects);
        return newProjects;
      });
      console.log('[ProjectContext] updatePhase - setProjects presumably called');
    } catch (err: any) {
      console.error("Error updating phase:", err);
      setError(err.message || 'Failed to update phase');
    } finally {
      setIsLoading(false);
    }
  }, [setProjects, setIsLoading, setError]);
  // --- End add updatePhase function ---

  // Uppdatera valuet med isLoading och error
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
      deletePhase,
      updatePhase,
      isLoading,
      error,
      setActiveProject,
    }),
    [projects, activeProjectId, activeProject, setActiveProjectId, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, deletePhase, updatePhase, isLoading, error, setActiveProject]
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