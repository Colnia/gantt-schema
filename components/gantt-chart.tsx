"use client"

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react"
import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  parseISO,
  endOfMonth,
  addMonths,
  getMonth,
  getYear,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  isSameDay,
} from "date-fns"
import { sv } from "date-fns/locale"
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flag,
  Link,
  Plus,
  Save,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
  ChevronDown,
} from "lucide-react"

import { GanttToolbar, Timeline, TaskList, TaskBar } from "@/components/gantt"
import { Milestone } from "@/components/gantt/Milestone"
import { DependencyLine } from "@/components/gantt/Dependency"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { CreateProjectDialog } from "@/components/gantt/dialogs/CreateProjectDialog"
import { AddTaskDialog } from "@/components/gantt/dialogs/AddTaskDialog"
import { EditTaskDialog } from "@/components/gantt/dialogs/EditTaskDialog"

// Kontext-hooks
import { useProjects } from "@/lib/context/ProjectContext"
import { useUI } from "@/lib/context/UIContext" 
import { useSelection } from "@/lib/context/SelectionContext" 
import { useInteraction } from "@/lib/context/InteractionContext"

// Typer och Utils
import { Project, Task, Resource, Dependency, TaskStatus, TaskPriority, TimeScale, ViewMode, Milestone as MilestoneType } from "@/lib/types"
import {
  getTaskWidth,
  getTaskLeft,
  getDates,
  getTimelineItems,
  getDefaultDayWidth,
  formatDate,
  ensureMinimumViewDuration,
  getTodayFormatted,
  getFutureDateFormatted,
} from "@/lib/utils/date-utils"
import {
  getStatusColor,
  getPriorityColor,
  groupTasksByParent,
  filterTasksBySearchTerm,
  filterTasksByView,
  calculatePhaseProgress,
  calculateProjectProgress,
  updatePhasesProgress,
} from "@/lib/utils/task-utils"
import { getDependencyCoordinates } from "@/lib/utils/dependency-utils"

// Hämta exempeldata (bör tas bort när data laddas externt)
// import { sampleProjects } from "@/lib/context/ProjectContext" // Behövs inte längre här

export default function GanttChart() {
  // --- Projektkontext --- 
  const {
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
  } = useProjects()

  // --- UI Kontext --- 
  const {
    viewStartDate,
    setViewStartDate,
    viewEndDate,
    setViewEndDate,
    dayWidth,
    setDayWidth,
    searchTerm,
    setSearchTerm,
    showResources,
    setShowResources,
    showDependencies,
    setShowDependencies,
    showMilestones,
    setShowMilestones,
    timeScale,
    viewMode,
    currentView,
    setCurrentView,
    currentPhase,
    setCurrentPhase,
    breadcrumbs,
    setBreadcrumbs,
    contextMenuPosition,
    setContextMenuPosition,
    contextMenuTaskId,
    setContextMenuTaskId,
    handleTimeScaleChange,
    handleViewModeChange,
    handleZoomIn,
    handleZoomOut,
  } = useUI();

  // --- Selection Kontext --- 
  const {
    selectedTask,
    setSelectedTask,
    selectedTasks,
    setSelectedTasks,
    isMultiSelecting,
    handleTaskClick,
    clearSelection,
  } = useSelection();

  // --- Interaction Kontext --- 
  const {
    draggingTask,
    setDraggingTask,
    resizingTask,
    setResizingTask,
    editingTask,
    setEditingTask,
    isAddingTask,
    setIsAddingTask,
    isAddingProject,
    setIsAddingProject,
  } = useInteraction();

  // --- Temporärt State (för formulär och taskToEdit) --- 
  const [taskToEdit, setTaskToEdit] = useState<string | null>(null)

  // Refs
  const ganttRef = useRef<HTMLDivElement>(null)
  const taskListRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const timelineHeaderRef = useRef<HTMLDivElement>(null)
  const timelineContentRef = useRef<HTMLDivElement>(null)

  // useEffects

  // Uppdatera viewStartDate/viewEndDate när activeProject ändras
  useEffect(() => {
    if (activeProject) {
      const initialDates = ensureMinimumViewDuration(
        parseISO(activeProject.startDate),
        parseISO(activeProject.endDate)
      );
      setViewStartDate(initialDates.viewStartDate);
      setViewEndDate(initialDates.viewEndDate);
    } else {
       const today = new Date();
       setViewStartDate(today);
       setViewEndDate(addMonths(today, 6));
    }
  }, [activeProject]);

  // useEffect för att justera dayWidth baserat på timeScale finns nu i UIContext

  // --- Helper Functions (wrappa med useCallback) ---
  const getTaskPosition = useCallback((task: Task) => {
    if (!viewStartDate || dayWidth <= 0) return { left: 0, width: 0 }; 
    const left = getTaskLeft(task, dayWidth, viewStartDate)
    const width = getTaskWidth(task, dayWidth, viewStartDate)
    return { left, width }
  }, [viewStartDate, dayWidth]); // Beroenden: viewStartDate, dayWidth

  const getMilestonePosition = useCallback((milestone: MilestoneType) => {
    if (!viewStartDate || dayWidth <= 0) return { left: 0 };
    const milestoneDate = parseISO(milestone.date);
    const daysFromStart = differenceInDays(milestoneDate, viewStartDate);
    const left = daysFromStart * dayWidth;
    return { left };
  }, [viewStartDate, dayWidth]); // Beroenden: viewStartDate, dayWidth

  // --- Handlers som använder Project/UI Context (wrappa med useCallback) ---
  const handleTaskResizeInternal = useCallback((taskId: string, newStartDate?: string, newEndDate?: string) => {
     if (activeProjectId) {
        const changes: Partial<Task> = {};
        if (newStartDate) changes.startDate = newStartDate;
        if (newEndDate) changes.endDate = newEndDate;
        if (Object.keys(changes).length > 0) {
           updateTask(activeProjectId, taskId, changes); // updateTask från useProjects
        }
     }
  }, [activeProjectId, updateTask]); // Beroenden: activeProjectId, updateTask
  
  const handleSaveInlineEditInternal = useCallback((taskId: string, field: keyof Task, value: any) => {
     if (activeProjectId) {
        updateTask(activeProjectId, taskId, { [field]: value }); // updateTask från useProjects
     }
  }, [activeProjectId, updateTask]); // Beroenden: activeProjectId, updateTask
  
  const handleDeleteTaskInternal = useCallback((taskId: string) => {
      if (activeProjectId) {
          deleteTask(activeProjectId, taskId); // deleteTask från useProjects
          setContextMenuPosition(null); // setContextMenuPosition från useUI
          setContextMenuTaskId(null); // setContextMenuTaskId från useUI
      }
  }, [activeProjectId, deleteTask, setContextMenuPosition, setContextMenuTaskId]); // Beroenden

  // --- Navigations Handlers (behöver ej useCallback om de inte skickas till memoized komponenter)
  const navigateToProject = (projectId: string) => {
    if (typeof projectId === 'string') { 
        const projectToView = projects.find((p) => p.id === projectId)
        if (projectToView) {
            setActiveProjectId(projectId!)
            setCurrentView("project")
            setBreadcrumbs([
                { id: "projects", name: "Alla projekt", type: "projects" },
                { id: projectId, name: projectToView.name, type: "project" },
            ])
        }
    }
  }

  const navigateToProjects = () => {
    setActiveProjectId(null)
    setCurrentView("projects")
    setBreadcrumbs([{ id: "projects", name: "Alla projekt", type: "projects" }])
  }

  const navigateToPhase = (phaseId: string) => {
    if (!activeProject) return;
    const phase = activeProject.tasks.find((t) => t.id === phaseId)
    if (phase && phase.isPhase) {
      setCurrentPhase(phaseId)
      setCurrentView("phase")
      setBreadcrumbs([
        { id: "projects", name: "Alla projekt", type: "projects" },
        { id: activeProject.id, name: activeProject.name, type: "project" },
        { id: phaseId, name: phase.name, type: "phase" },
      ])
    } else {
        console.warn(`Task with id ${phaseId} is not a phase or not found in active project.`);
    }
  }
  
  // --- Memoized värden (Använder nu states från useUI) --- 

  const dates = useMemo(() => {
    if (!viewStartDate || !viewEndDate) return [];
    return getDates(viewStartDate, viewEndDate)
  }, [viewStartDate, viewEndDate])

  const timelineItems = useMemo(() => {
     if (!viewStartDate || !viewEndDate) return [];
     // Skicka med dayWidth till getTimelineItems
     return getTimelineItems(timeScale, viewStartDate, viewEndDate, dayWidth)
  }, [timeScale, viewStartDate, viewEndDate, dayWidth]); // Lägg till dayWidth som beroende

  const filteredTasks = useMemo(() => {
    if (!activeProject) return [];
    const searchFiltered = filterTasksBySearchTerm(activeProject.tasks, searchTerm);
    if (currentView === "project") {
       return searchFiltered.filter(task => task.isPhase);
    } else if (currentView === "phase" && currentPhase) {
       return searchFiltered.filter(task => task.parentId === currentPhase);
    }
    if (searchTerm) {
       return searchFiltered;
    }
    if (currentView === "projects") {
        return [];
    }
    return []; 
  }, [activeProject, searchTerm, currentView, currentPhase])
  
  // --- Beräkna koordinater för beroendelinjer --- 
  const dependencyCoordinates = useMemo(() => {
    if (!showDependencies || !activeProject || !viewStartDate) return [];

    // Anropa den nya hjälpfunktionen
    return getDependencyCoordinates(
      activeProject.tasks, // Skicka med hela listan av tasks
      filteredTasks,       // Skicka med den filtrerade listan
      getTaskPosition,     // Skicka med funktionen för att hämta position
      viewStartDate,       // Skicka med startdatum för vyn
      dayWidth             // Skicka med bredden per dag
    );
    
    /* // Gammal logik som flyttats
    const coordinates = [];
    const taskHeight = 36; // Uppskattad höjd för en TaskBar-rad
    ...
    return coordinates;
    */
  }, [showDependencies, activeProject, filteredTasks, getTaskPosition, viewStartDate, dayWidth]); // Uppdatera beroenden

  // --- Interaction Handlers (wrappa med useCallback) ---
  const handleTaskDragStart = useCallback((taskId: string, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingTask(taskId); // setDraggingTask från useInteraction
    e.dataTransfer.setData("taskId", taskId);
    // Spara ursprunglig startposition i dataTransfer för att beräkna skillnad vid drop?
    // Detta är lite knepigt pga begränsningar i dataTransfer.
    // Alternativt: Hämta task i onDrop och beräkna offset där.
    e.dataTransfer.effectAllowed = "move";
  }, [setDraggingTask]); // Beroenden: setDraggingTask

  const handleTaskDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []); // Inga beroenden

  const handleTaskDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const targetElement = e.target as HTMLElement;
    
    if (!taskId || !ganttRef.current || !activeProject || !viewStartDate || dayWidth <= 0) {
        setDraggingTask(null);
        return; // Avbryt om nödvändig data saknas
    }

    const task = activeProject.tasks.find(t => t.id === taskId);
    if (!task) {
        setDraggingTask(null);
        return; // Avbryt om uppgiften inte hittas
    }

    // Beräkna droppositionen relativt till Gantt-containern
    const ganttRect = ganttRef.current.getBoundingClientRect();
    const dropX = e.clientX - ganttRect.left + ganttRef.current.scrollLeft; // Justera för scroll

    // Beräkna antal dagar från start av vyn
    const daysFromViewStart = Math.round(dropX / dayWidth);

    // Beräkna nytt startdatum
    const newStartDate = addDays(viewStartDate, daysFromViewStart);

    // Säkerställ att det nya startdatumet inte är före projektets start
    if (isBefore(newStartDate, parseISO(activeProject.startDate))) {
        console.warn("Kan inte flytta uppgift före projektets startdatum.");
        setDraggingTask(null);
        return;
    }

    // Beräkna varaktighet och nytt slutdatum
    const originalTaskStart = parseISO(task.startDate);
    const originalTaskEnd = parseISO(task.endDate);
    const durationDays = differenceInDays(originalTaskEnd, originalTaskStart); // Behåll samma varaktighet
    const newEndDate = addDays(newStartDate, durationDays);

    // Säkerställ att det nya slutdatumet inte är efter projektets slut
    if (isAfter(newEndDate, parseISO(activeProject.endDate))) {
        console.warn("Kan inte flytta uppgift efter projektets slutdatum.");
        setDraggingTask(null);
        return;
    }

    console.log(`Task ${taskId} dropped. New start date: ${formatDate(newStartDate)}`); 

    // Anropa updateTask med de nya datumen
    updateTask(activeProject.id, taskId, {
      startDate: formatDate(newStartDate),
      endDate: formatDate(newEndDate),
    });

    setDraggingTask(null); // Återställ drag-state
  }, [activeProject, viewStartDate, dayWidth, setDraggingTask, updateTask]); // Lägg till beroenden
  
  const handleTaskResizeStart = useCallback((taskId: string, edge: "start" | "end", e: React.MouseEvent) => {
    setResizingTask({ id: taskId, edge }); // setResizingTask från useInteraction
    e.stopPropagation();

    const ganttElement = ganttRef.current;
    if (!ganttElement || !activeProject) return;

    const initialMouseX = e.clientX;
    const task = activeProject.tasks.find((t) => t.id === taskId);
    if (!task) return;
    
    const originalStartDate = parseISO(task.startDate);
    const originalEndDate = parseISO(task.endDate);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const movementX = moveEvent.clientX - initialMouseX;
      const daysChange = Math.round(movementX / dayWidth); // dayWidth från useUI

      if (resizingTask?.edge === "start") { // resizingTask från useInteraction
        const newStartDate = addDays(originalStartDate, daysChange);
        if (isBefore(newStartDate, parseISO(activeProject.startDate))) return;
        handleTaskResizeInternal(taskId, formatDate(newStartDate)); // Kallar annan useCallback-funktion
      } else if (resizingTask?.edge === "end") {
        const newEndDate = addDays(originalEndDate, daysChange);
        if (isAfter(newEndDate, parseISO(activeProject.endDate))) return;
        handleTaskResizeInternal(taskId, undefined, formatDate(newEndDate));
      }
    };

    const handleMouseUp = () => {
      setResizingTask(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  // Beroenden: setResizingTask, activeProject, dayWidth, resizingTask, handleTaskResizeInternal
  }, [setResizingTask, activeProject, dayWidth, resizingTask, handleTaskResizeInternal]); 
  
  const handleTaskContextMenu = useCallback((taskId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY }); // setContextMenuPosition från useUI
    setContextMenuTaskId(taskId); // setContextMenuTaskId från useUI
  }, [setContextMenuPosition, setContextMenuTaskId]); // Beroenden

  // Dessa används inte direkt av memoized komponenter (än), men kan wrappas för konsekvens
  const handleStartInlineEdit = useCallback((taskId: string) => {
    setEditingTask(taskId); // setEditingTask från useInteraction
    clearSelection(); // clearSelection från useSelection
  }, [setEditingTask, clearSelection]);

  const handleFinishInlineEdit = useCallback(() => {
     setEditingTask(null); // setEditingTask från useInteraction
  }, [setEditingTask]);

  const openTaskEditor = useCallback((taskId: string) => {
    setTaskToEdit(taskId); // Lokal state setter
    console.log("Öppnar redigeringsdialog för:", taskId);
  }, [setTaskToEdit]); // Beroende på lokal state setter

  // --- Rendering --- 

  if (!activeProject && currentView !== 'projects') {
      return <div>Laddar projekt... eller inget projekt valt.</div>; 
  }
  
  if (currentView === 'projects') {
     return (
         <Card className="w-full">
             <CardContent className="p-4">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">Projektöversikt</h2>
                     <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
                         <DialogTrigger asChild>
                             <Button>
                                 <Plus className="mr-2 h-4 w-4" />
                                 Skapa projekt
                             </Button>
                         </DialogTrigger>
                     </Dialog>
                 </div>
                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     {projects.map(proj => (
                         <Card key={proj.id} onClick={() => navigateToProject(proj.id)} className="cursor-pointer hover:shadow-lg transition-shadow">
                             <CardContent className="p-4">
                                 <h3 className="font-semibold mb-2">{proj.name}</h3>
                                 <p className="text-sm text-muted-foreground">
                                     {formatDate(proj.startDate, "d MMM")} - {formatDate(proj.endDate, "d MMM yyyy")}
                                 </p>
                             </CardContent>
                         </Card>
                     ))}
                 </div>
             </CardContent>
         </Card>
     );
  }

  if (!activeProject) {
      console.error("Rendering error: activeProject is null when it shouldn't be.");
      return <div>Ett fel uppstod vid laddning av projektet.</div>;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <GanttToolbar
          currentView={currentView}
          project={activeProject}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          timeScale={timeScale}
          handleTimeScaleChange={handleTimeScaleChange}
          handleViewModeChange={handleViewModeChange}
          showResources={showResources}
          setShowResources={setShowResources}
          showDependencies={showDependencies}
          setShowDependencies={setShowDependencies}
          showMilestones={showMilestones}
          setShowMilestones={setShowMilestones}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          isAddingTask={isAddingTask}
          setIsAddingTask={setIsAddingTask}
        />

        <div className="flex h-[calc(100vh-200px)]">
          <TaskList
            tasks={filteredTasks}
            selectedTask={selectedTask}
            selectedTasks={selectedTasks}
            handleTaskClick={handleTaskClick}
            clearSelection={clearSelection}
          />

          <div ref={ganttRef} className="w-2/3 overflow-x-auto overflow-y-hidden flex flex-col" onClick={clearSelection} onDragOver={handleTaskDragOver} onDrop={handleTaskDrop}>
            <Timeline
              dates={dates}
              timelineItems={timelineItems}
              dayWidth={dayWidth}
              timeScale={timeScale}
              timelineHeaderRef={timelineHeaderRef}
              timelineContentRef={timelineContentRef}
            >
              <div className="relative h-full" style={{ width: `${dates.length * dayWidth}px` }}>
                {filteredTasks.map((task, index) => {
                    return (
                        <TaskBar
                          key={task.id}
                          task={task}
                          index={index}
                          getTaskPosition={getTaskPosition}
                          isSelected={selectedTask === task.id || selectedTasks.has(task.id)}
                          isBeingEdited={editingTask === task.id}
                          handleTaskClick={handleTaskClick}
                          handleTaskContextMenu={handleTaskContextMenu}
                          handleStartInlineEdit={handleStartInlineEdit}
                          handleFinishInlineEdit={handleFinishInlineEdit}
                          handleSaveInlineEditInternal={handleSaveInlineEditInternal}
                          handleTaskDragStart={handleTaskDragStart}
                          handleTaskResizeStart={handleTaskResizeStart}
                        />
                    );
                })}
                {showMilestones && activeProject && activeProject.milestones.map(milestone => {
                  const { left } = getMilestonePosition(milestone);
                  if (left >= 0 && left <= dates.length * dayWidth) {
                    return (
                      <Milestone
                        key={milestone.id}
                        milestone={milestone}
                        left={left}
                      />
                    );
                  }
                  return null;
                })}
                {showDependencies && (
                   <svg 
                      width="100%" 
                      height="100%" // Behöver kanske justeras baserat på antal tasks
                      style={{
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         pointerEvents: 'none', // Ignorera muspekaren
                         overflow: 'visible' // Se till att linjer utanför syns om SVG:n är för liten
                      }}
                   >
                     {dependencyCoordinates.map(coords => (
                         <DependencyLine key={coords.id} {...coords} />
                     ))}
                   </svg>
                )}
              </div>
            </Timeline>
          </div>
        </div>
        
        <CreateProjectDialog />
        <AddTaskDialog activeProjectId={activeProjectId} />
        <EditTaskDialog taskId={taskToEdit} isOpen={taskToEdit !== null} onClose={() => setTaskToEdit(null)} />

        {contextMenuPosition && contextMenuTaskId && (
           <DropdownMenu open={!!contextMenuPosition} onOpenChange={(open) => !open && setContextMenuPosition(null)}>
              <DropdownMenuTrigger 
                 style={{ position: 'fixed', left: contextMenuPosition.x, top: contextMenuPosition.y, width: 0, height: 0 }} 
              />
              <DropdownMenuContent align="start">
                 <DropdownMenuItem onClick={() => handleStartInlineEdit(contextMenuTaskId)}>Byt namn</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => openTaskEditor(contextMenuTaskId)}>Redigera detaljer...</DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTaskInternal(contextMenuTaskId)}>Ta bort uppgift</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        )}

      </CardContent>
    </Card>
  )
}

