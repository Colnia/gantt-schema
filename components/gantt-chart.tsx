/// <reference types="react" />

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
  isWeekend,
  isEqual,
  getISOWeek
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

import { GanttToolbar, Timeline, TaskBar, GanttLegend, EnhancedTaskList } from "@/components/gantt"
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
import { TaskDetailsDialog } from "@/components/gantt/dialogs/TaskDetailsDialog"
import { ResourceDetailsDialog } from "@/components/gantt/dialogs/ResourceDetailsDialog"
import { PhaseDialog } from "@/components/gantt/dialogs/PhaseDialog"
import { ActivityDialog } from "@/components/gantt/dialogs/ActivityDialog"
import GanttTaskTree from "./gantt/GanttTaskTree"
import { TaskArea } from './gantt/TaskArea'

// Kontext-hooks
import { useProjects } from "@/lib/context/ProjectContext"
import { useUI } from "@/lib/context/UIContext" 
import { useSelection } from "@/lib/context/SelectionContext" 
import { useInteraction } from "@/lib/context/InteractionContext"

// Typer och Utils
import { Project, Task, Resource, Dependency, TaskStatus, TaskPriority, TimeScale, ViewMode, Milestone as MilestoneType, Phase } from "@/lib/types"
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
  ensureDate,
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
import { getDependencyCoordinates, ROW_HEIGHT } from "@/lib/utils/dependency-utils"

// Add AlertDialog imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { cn } from "@/lib/utils"

interface GanttChartProps {
  projectId?: string;
}

export default function GanttChart({ projectId }: GanttChartProps) {
  // --- DEBUG LOGGING for received projectId --- 
  console.log('[GanttChart] Received projectId prop:', projectId);
  // --- END DEBUG LOGGING ---

  // --- Context Hooks ---
  const { projects, activeProjectId, activeProject, setActiveProjectId, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, deletePhase, updatePhase } = useProjects();
  const { viewStartDate, viewEndDate, dayWidth, timeScale, setViewStartDate, setViewEndDate, setDayWidth, setTimeScale, searchTerm, setSearchTerm, showResources, setShowResources, showDependencies, setShowDependencies, showMilestones, setShowMilestones, showColorLegend, setShowColorLegend, viewMode, currentView, setCurrentView, currentPhase, setCurrentPhase, breadcrumbs, setBreadcrumbs, contextMenuPosition, setContextMenuPosition, contextMenuTaskId, setContextMenuTaskId, expandedPhases, togglePhase, handleTimeScaleChange, handleViewModeChange, handleZoomIn, handleZoomOut, handleMoveLeft, handleMoveRight, handleJumpLeft, handleJumpRight } = useUI();
  const { selectedTask, setSelectedTask, selectedTasks, setSelectedTasks, isMultiSelecting, handleTaskClick: selectionHandleTaskClick, clearSelection } = useSelection();
  const { draggingTask, setDraggingTask, resizingTask, setResizingTask, editingTask, setEditingTask, isAddingProject, setIsAddingProject, isAddingTask, setIsAddingTask, isAddingPhase, setIsAddingPhase, isAddingActivity, setIsAddingActivity } = useInteraction();

  // --- State & Refs ---
  const [taskToEdit, setTaskToEdit] = useState<string | null>(null);
  const [taskToView, setTaskToView] = useState<string | null>(null);
  const [resourceToView, setResourceToView] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<string>("task");
  const [phaseToEdit, setPhaseToEdit] = useState<string | null>(null);
  const [currentParentTaskId, setCurrentParentTaskId] = useState<string | null>(null);
  const [phaseToDelete, setPhaseToDelete] = useState<string | null>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);
  const [timelineHeaderHeight, setTimelineHeaderHeight] = useState(0);
  const [dragPreview, setDragPreview] = useState<{ left: number; date: Date } | null>(null);
  const [resizePreview, setResizePreview] = useState<{ edge: 'start' | 'end', left: number, date: Date } | null>(null);
  
  // --- Refs for stable values in event listeners ---
  const resizingTaskRef = useRef(resizingTask); // Ref to mirror resizingTask state
  const dayWidthRef = useRef(dayWidth); // Ref to mirror dayWidth prop/state

  // Keep refs updated
  useEffect(() => {
    resizingTaskRef.current = resizingTask;
  }, [resizingTask]);

  useEffect(() => {
    dayWidthRef.current = dayWidth;
  }, [dayWidth]);
  // --- End Refs ---

  // --- Log activeProject changes ---
  useEffect(() => {
    console.log('[GanttChart] activeProject state updated:', activeProject);
  }, [activeProject]);
  // --- End log ---

  // --- useEffects ---
  useEffect(() => {
    console.log("[useEffect Set initial view dates] Triggered. activeProject:", activeProject);
    if (activeProject && activeProject.startDate) {
      try {
        let earliestStartDate: Date | null = ensureDate(activeProject.startDate);
        let latestEndDate: Date | null = ensureDate(activeProject.endDate || activeProject.startDate); // Fallback to startDate if endDate is missing

        // Find the actual earliest and latest dates among all tasks and phases
        const allItems = [...(activeProject.tasks || []), ...(activeProject.phases || [])];
        allItems.forEach(item => {
          const itemStart = ensureDate(item.startDate);
          const itemEnd = ensureDate(item.endDate);
          // Ensure earliestStartDate is valid before comparison
          if (itemStart && earliestStartDate && isBefore(itemStart, earliestStartDate)) {
            earliestStartDate = itemStart;
          }
          // Ensure latestEndDate is valid before comparison
          if (itemEnd && latestEndDate && isAfter(itemEnd, latestEndDate)) {
            latestEndDate = itemEnd;
          }
        });
        
        // --- Add checks for null before proceeding --- 
        if (!earliestStartDate || !latestEndDate) {
          console.error("Could not determine valid earliest/latest dates for project:", activeProject.id);
          // Set default dates on error
          const today = new Date();
          setViewStartDate(addDays(today, -30));
          setViewEndDate(addDays(today, 60));
          return; // Exit early
        }
        // --- End checks ---
        
        console.log("[useEffect Set initial view dates] Calculated bounds:", { earliestStartDate, latestEndDate });

        // Add some padding/margin (Now safe to use dates)
        const viewStart = addDays(earliestStartDate, -7); 
        let viewEnd = addDays(latestEndDate, 14); 

        // Ensure a minimum duration for the view (e.g., 2 months)
        const minDurationDays = 60; 
        // differenceInDays should be safe as viewStart/viewEnd are derived from valid dates
        if (differenceInDays(viewEnd, viewStart) < minDurationDays) {
             viewEnd = addDays(viewStart, minDurationDays);
        }

        console.log("[useEffect Set initial view dates] Setting view dates:", { viewStart, viewEnd });
        setViewStartDate(viewStart);
        setViewEndDate(viewEnd);

      } catch (error) {
        console.error("Error setting initial view dates:", error, activeProject);
        // Optionally set default dates on error
        const today = new Date();
        setViewStartDate(addDays(today, -30));
        setViewEndDate(addDays(today, 60));
      }
    } else {
       console.log("[useEffect Set initial view dates] No active project or start date, skipping.");
       // Maybe set default dates if no project?
       // const today = new Date();
       // setViewStartDate(addDays(today, -30));
       // setViewEndDate(addDays(today, 60));
    }
  }, [activeProject, setViewStartDate, setViewEndDate]);
  
  useEffect(() => { 
    // --- DEBUG LOGGING --- 
    console.log('[useEffect Set active project] Triggered. projectId:', projectId, 'ActiveProjectId:', activeProjectId);
    // --- END DEBUG LOGGING ---
    if (projectId && projectId !== activeProjectId) {
      console.log('[useEffect Set active project] Calling setActiveProjectId with:', projectId);
      setActiveProjectId(projectId);
    }
  }, [projectId, activeProjectId, setActiveProjectId]);

  // --- Helper Function: normalizeDate ---
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return normalized;
  };
  
  // --- Memoized derived data ---
  const dates = useMemo(() => {
    const normalizedViewStart = viewStartDate ? normalizeDate(viewStartDate) : null;
    const normalizedViewEnd = viewEndDate ? normalizeDate(viewEndDate) : null;
    if (!normalizedViewStart || !normalizedViewEnd || isNaN(normalizedViewStart.getTime()) || isNaN(normalizedViewEnd.getTime())) return [];
    return getDates(normalizedViewStart, normalizedViewEnd);
  }, [viewStartDate, viewEndDate, normalizeDate]);

  const timelineItems = useMemo(() => {
    const normalizedViewStart = viewStartDate ? normalizeDate(viewStartDate) : null;
    const normalizedViewEnd = viewEndDate ? normalizeDate(viewEndDate) : null;
    if (!normalizedViewStart || !normalizedViewEnd) return [];
    return getTimelineItems(timeScale, normalizedViewStart, normalizedViewEnd, dayWidth);
  }, [timeScale, viewStartDate, viewEndDate, dayWidth, normalizeDate]);

  const filteredTasks = useMemo(() => {
    if (!activeProject) return [];
    const phasesAsTasks: Task[] = activeProject.phases?.map((phase: Phase) => ({
      id: phase.id,
      name: phase.name,
      startDate: phase.startDate || activeProject.startDate,
      endDate: phase.endDate || activeProject.endDate,
      status: phase.status,
      progress: phase.completionRate,
      priority: "medium",
      resources: [],
      dependencies: [],
      color: phase.color || "#4169E1",
      isPhase: true,
      description: phase.description,
      projectId: phase.projectId,
      createdAt: phase.createdAt,
      updatedAt: phase.updatedAt,
    } as Task)) || [];
    const searchFiltered = searchTerm ? (activeProject.tasks || []).filter((task: Task) => task.name.toLowerCase().includes(searchTerm.toLowerCase())) : (activeProject.tasks || []);
    const tasksWithoutPhase: Task[] = searchFiltered.filter((task: Task) => !task.phaseId && !task.parentTaskId && !task.isPhase);
    return [...phasesAsTasks, ...tasksWithoutPhase];
  }, [activeProject, searchTerm]);

  const displayedItems = useMemo(() => {
    const items: Task[] = [];
    if (!activeProject) return items;
    const phases = activeProject.phases || [];
    const tasks = activeProject.tasks || [];
    const tasksByPhase: Record<string, Task[]> = {};
    const tasksWithoutPhase: Task[] = [];
    const subTasksByParent: Record<string, Task[]> = {};
    tasks.forEach((task: Task) => {
      if (task.phaseId) {
        if (!tasksByPhase[task.phaseId]) tasksByPhase[task.phaseId] = [];
          if (!task.parentTaskId) { tasksByPhase[task.phaseId].push(task); }
          else { if (!subTasksByParent[task.parentTaskId]) { subTasksByParent[task.parentTaskId] = []; } subTasksByParent[task.parentTaskId].push(task); }
        } else if (task.parentTaskId) { if (!subTasksByParent[task.parentTaskId]) { subTasksByParent[task.parentTaskId] = []; } subTasksByParent[task.parentTaskId].push(task); }
        else if (!task.isPhase) { tasksWithoutPhase.push(task); }
    });
    const addTaskWithSubtasks = (task: Task, currentItems: Task[]) => {
      currentItems.push(task);
      const subtasks = subTasksByParent[task.id] || [];
      subtasks.forEach(subtask => { addTaskWithSubtasks(subtask, currentItems); });
    };
    phases.forEach((phase: Phase) => {
      items.push({
        id: phase.id,
        name: phase.name,
        startDate: phase.startDate || activeProject.startDate,
        endDate: phase.endDate || activeProject.endDate,
        status: phase.status,
        progress: phase.completionRate,
        priority: "medium",
        resources: [],
        dependencies: [],
        color: phase.color || "#4169E1",
        isPhase: true,
        description: phase.description,
        projectId: phase.projectId,
        createdAt: phase.createdAt,
        updatedAt: phase.updatedAt,
      } as Task);
      if (expandedPhases.has(phase.id)) {
        const phaseTasks = tasksByPhase[phase.id] || [];
        phaseTasks.forEach((task: Task) => { addTaskWithSubtasks(task, items); });
      }
    });
    tasksWithoutPhase.forEach(task => { addTaskWithSubtasks(task, items); });
    if (searchTerm) { return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())); }
    return items;
  }, [activeProject, expandedPhases, searchTerm]);

  // --- Measure TimelineHeader Height ---
  useEffect(() => {
    if (timelineHeaderRef.current) {
      const measuredHeight = timelineHeaderRef.current.offsetHeight;
      console.log(`[useEffect Measure Header] Measured Height: ${measuredHeight}`);
      // Only update if the height actually changed to avoid potential loops if other deps change height slightly
      if (measuredHeight !== timelineHeaderHeight) { 
          setTimelineHeaderHeight(measuredHeight);
      }
    }
    // Re-measure if timescale changes, or dates array length changes (indicative of view range change)
  }, [timeScale, dates.length, timelineHeaderHeight]); // Added timelineHeaderHeight to deps

  // --- Helper Function: findDateIndexes (Moved IN) ---
  const findDateIndexes = (taskStartDate: Date | null, taskEndDate: Date | null, datesArray: Date[]): { startIndex: number, endIndex: number } => {
    let startIndex = -1, endIndex = -1;
    if (!taskStartDate || !taskEndDate || datesArray.length === 0) return { startIndex: 0, endIndex: 0 };
    
    // Use normalized dates for comparison, but maybe not strictly necessary if using isSameDay?
    // Let's keep them for clarity for now.
    const normalizedTaskStart = normalizeDate(taskStartDate);
    const normalizedTaskEnd = normalizeDate(taskEndDate);
    
    // --- Use isSameDay for robust comparison --- 
    for (let i = 0; i < datesArray.length; i++) {
      const currentDate = datesArray[i]; 
      // Compare current date in array with the normalized task start date
      if (startIndex === -1 && isSameDay(currentDate, normalizedTaskStart)) {
        startIndex = i;
      }
      // Compare current date in array with the normalized task end date
      if (isSameDay(currentDate, normalizedTaskEnd)) {
        endIndex = i;
        // Optimization: If we've found start already, and now found end, we can stop.
        if (startIndex !== -1) break; 
      }
    }
    // --- End isSameDay comparison ---

    // Fallback logic if dates are outside the current view range
    if (startIndex === -1) {
      startIndex = isBefore(normalizedTaskStart, datesArray[0]) ? 0 : datesArray.length -1; 
      console.warn(`[findDateIndexes] Start date ${formatDate(normalizedTaskStart)} not found in range, setting startIndex to ${startIndex}`);
    }
    if (endIndex === -1) {
       // If start was found, but end wasn't, end must be after the range
      if (startIndex !== -1 && isAfter(normalizedTaskEnd, datesArray[datesArray.length - 1])) {
          endIndex = datesArray.length - 1;
      } 
      // If start was *not* found, and end is before the range start, set end to 0
      else if (startIndex === -1 && isBefore(normalizedTaskEnd, datesArray[0])) {
          endIndex = 0;
      }
      // General fallback if end date is somehow missed within the loop but should be in range (less likely with isSameDay)
      else {
          endIndex = isAfter(normalizedTaskEnd, datesArray[datesArray.length - 1]) ? datesArray.length - 1 : startIndex; // Default to startIndex if end is before start or still not found
      }
      console.warn(`[findDateIndexes] End date ${formatDate(normalizedTaskEnd)} not found or adjusted, setting endIndex to ${endIndex}`);
    }

    // Ensure endIndex is not before startIndex
    if (endIndex < startIndex) {
        console.warn(`[findDateIndexes] Calculated endIndex ${endIndex} is before startIndex ${startIndex}. Adjusting endIndex.`);
        endIndex = startIndex;
    }

    return { startIndex, endIndex };
  };

  // --- Position Calculation Callbacks (Moved IN) ---
  const getTaskPosition = useCallback(
    (task: Task): { left: number; width: number } => {
      const normalizedViewStart = viewStartDate ? normalizeDate(viewStartDate) : null;
      
      // --- DEBUG LOGGING ---
      console.log('[getTaskPosition] Input:', { 
        taskId: task.id, 
        taskStart: task.startDate,
        taskEnd: task.endDate,
        viewStart: normalizedViewStart,
        datesCount: dates?.length,
        dayWidth,
        firstDateInArray: dates?.[0],
        lastDateInArray: dates?.[dates?.length - 1]
      });
      // --- END DEBUG LOGGING ---
      
      if (!normalizedViewStart || !dates || dates.length === 0) { 
        console.warn('[getTaskPosition] Missing viewStart or dates', { normalizedViewStart, datesLength: dates?.length });
        return { left: 0, width: 0 }; 
      }
      try {
        let taskStartDate: Date | null = ensureDate(task.startDate);
        let taskEndDate: Date | null = ensureDate(task.endDate);
        if (!taskStartDate || !taskEndDate) { 
          console.warn('[getTaskPosition] Invalid task dates', { taskId: task.id, taskStartDate, taskEndDate });
          return { left: 0, width: 0 }; 
        }
        const { startIndex, endIndex } = findDateIndexes(taskStartDate, taskEndDate, dates);
        const left = startIndex * dayWidth;
        const width = Math.max(1, (endIndex - startIndex + 1) * dayWidth);
        
        // --- DEBUG LOGGING ---
        console.log('[getTaskPosition] Output:', { taskId: task.id, startIndex, endIndex, left, width });
        // --- END DEBUG LOGGING ---

        return { left: Math.max(0, left), width };
      } catch (error) { console.error("Error in getTaskPosition:", error, task); return { left: 0, width: 0 }; }
    },
    [viewStartDate, dayWidth, normalizeDate, dates]
  );

  const getMilestonePosition = useCallback((milestone: MilestoneType) => {
    // --- DEBUG LOGGING ---
    console.log('[getMilestonePosition] Input:', { 
      milestoneId: milestone.id, 
      milestoneDate: milestone.date,
      viewStart: viewStartDate ? normalizeDate(viewStartDate) : null,
      datesCount: dates?.length,
      dayWidth
    });
    // --- END DEBUG LOGGING ---

    if (!viewStartDate || !dates || dates.length === 0 || dayWidth <= 0) { 
      console.warn('[getMilestonePosition] Missing viewStart, dates, or invalid dayWidth');
      return { left: 0 }; 
    }
    try {
      const milestoneDate = ensureDate(milestone.date);
      if (!milestoneDate) { 
        console.warn('[getMilestonePosition] Invalid milestone date', { milestoneId: milestone.id, milestoneDate: milestone.date });
        return { left: 0 }; 
      }
      const { startIndex } = findDateIndexes(milestoneDate, milestoneDate, dates);
      const left = startIndex * dayWidth;

      // --- DEBUG LOGGING ---
      console.log('[getMilestonePosition] Output:', { milestoneId: milestone.id, startIndex, left });
      // --- END DEBUG LOGGING ---

      return { left };
    } catch (error) { console.error("Error parsing milestone date:", error, milestone.date); return { left: 0 }; }
  }, [viewStartDate, dayWidth, normalizeDate, dates]);

  // --- Dependency Coordinates Calculation (Depends on getTaskPosition) ---
  const dependencyCoordinates = useMemo(() => {
    const normalizedViewStart = viewStartDate ? normalizeDate(viewStartDate) : null;
    if (!showDependencies || !activeProject || !normalizedViewStart) return [];
    if (!activeProject?.tasks) { return []; }
    const coords: { x1: number; y1: number; x2: number; y2: number; id: string }[] = [];
    const taskPositions: Record<string, { top: number; left: number; width: number; height: number }> = {};
    const timelineContentElement = timelineContentRef.current;
    const taskListElement = taskListRef.current;
    if (!timelineContentElement || !taskListElement) { return []; }
    displayedItems.forEach((item, index) => {
      if (!item.isPhase) {
        const taskElement = taskListElement.querySelector(`[data-task-id="${item.id}"]`) as HTMLElement;
        if (taskElement) {
           const position = getTaskPosition(item);
           const top = taskElement.offsetTop + taskElement.offsetHeight / 2;
           taskPositions[item.id] = { top: top, left: position.left, width: position.width, height: taskElement.offsetHeight };
        }
      }
    });
    activeProject.tasks.forEach((task: Task) => { 
       if (task.dependencies && task.dependencies.length > 0 && taskPositions[task.id]) {
          task.dependencies.forEach((dep: Dependency) => { 
            const predecessorId = dep.predecessorId || dep.fromTaskId;
            if (!predecessorId) { return; } 
            const predecessorTask = activeProject.tasks?.find((t: Task) => t.id === predecessorId);
            if (predecessorTask && taskPositions[predecessorId]) { 
               const startPos = taskPositions[predecessorId];
               const endPos = taskPositions[task.id]; 
               const x1 = startPos.left + startPos.width;
               const y1 = startPos.top;
               const x2 = endPos.left;
               const y2 = endPos.top;
               coords.push({ x1, y1, x2, y2, id: `${predecessorId}-${task.id}` }); 
            } 
          });
       }
    });
    return coords;
  }, [showDependencies, activeProject, viewStartDate, displayedItems, getTaskPosition, normalizeDate]);

  // --- Interaction Handlers (Callbacks - Order Matters!) ---
  const handleTaskResizeInternal = useCallback((itemId: string, itemType: 'task' | 'phase', newStartDate?: string | Date, newEndDate?: string | Date) => {
     // console.log('[handleTaskResizeInternal] Called with:', { itemId, itemType, newStartDate, newEndDate }); 
     if (activeProjectId) {
        const changes: Partial<Task | Phase> = {}; // Use union type
        const ensuredStartDate = newStartDate ? ensureDate(newStartDate) : null;
        const ensuredEndDate = newEndDate ? ensureDate(newEndDate) : null;
        if (ensuredStartDate) { changes.startDate = formatDate(ensuredStartDate); }
        if (ensuredEndDate) { changes.endDate = formatDate(ensuredEndDate); }
        if (Object.keys(changes).length > 0) { 
            // console.log('[handleTaskResizeInternal] Attempting update with changes:', changes);
            if (itemType === 'task') {
                updateTask({ id: itemId, ...changes } as Task);
            } else {
                updatePhase({ id: itemId, ...changes } as Phase);
            }
        }
     }
  }, [activeProjectId, updateTask, updatePhase]); // Added updatePhase

  const handleSaveInlineEditInternal = useCallback((taskId: string, field: keyof Task, value: any) => {
     if (activeProjectId) { updateTask({ id: taskId, [field]: value } as Task); }
  }, [activeProjectId, updateTask]);
  
  const handleDeleteTaskInternal = useCallback((taskId: string) => {
      if (activeProjectId) { deleteTask(taskId); setContextMenuPosition(null); setContextMenuTaskId(null); }
  }, [activeProjectId, deleteTask, setContextMenuPosition, setContextMenuTaskId]);

  const handleTaskDragStart = useCallback((taskId: string, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingTask(taskId);
    setDragPreview(null);
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  }, [setDraggingTask, setDragPreview]);

  const handleTaskDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { 
      e.preventDefault(); 
      e.dataTransfer.dropEffect = "move"; 
      
      // --- Calculate and set drag preview --- 
      if (viewStartDate && dayWidth > 0 && rightScrollRef.current) {
        try {
          const scrollContainerRect = rightScrollRef.current.getBoundingClientRect();
          // Calculate X relative to the scroll container's content area
          // Note: scrollLeft applies to the container doing the scrolling (rightScrollRef)
          const dropX = e.clientX - scrollContainerRect.left + rightScrollRef.current.scrollLeft; 
          const daysFromViewStart = Math.max(0, Math.round(dropX / dayWidth)); // Ensure non-negative days
          const currentDate = addDays(viewStartDate, daysFromViewStart);
          const currentLeft = daysFromViewStart * dayWidth;
          
          // Optional: Throttle this update if needed
          setDragPreview({ left: currentLeft, date: currentDate });
        } catch (error) {
            console.error("Error calculating drag preview position:", error);
            setDragPreview(null); // Clear preview on error
        }
      } else {
          setDragPreview(null); // Clear if necessary data is missing
      }
      // --- End drag preview calculation ---
      
  }, [viewStartDate, dayWidth, setDragPreview]);

  const handleTaskDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("taskId"); 
    console.log(`[handleTaskDrop] Drop detected for itemId: ${itemId}`); 
    if (!itemId || !ganttRef.current || !activeProject || (!activeProject.tasks && !activeProject.phases) || !viewStartDate || dayWidth <= 0) { 
      console.warn('[handleTaskDrop] Aborted - Pre-condition failed:', {
        hasItemId: !!itemId,
        hasGanttRef: !!ganttRef.current,
        hasActiveProject: !!activeProject,
        hasTasksOrPhases: !!(activeProject?.tasks || activeProject?.phases),
        hasViewStart: !!viewStartDate,
        isDayWidthPositive: dayWidth > 0
      });
      setDraggingTask(null); return; 
    }
    
    // --- Find item (could be task or phase) ---
    let item: Task | Phase | undefined = activeProject.tasks?.find((t: Task) => t.id === itemId);
    let itemType: 'task' | 'phase' = 'task';
    if (!item) {
        item = activeProject.phases?.find((p: Phase) => p.id === itemId);
        if (item) {
            itemType = 'phase';
        } else {
            console.warn('[handleTaskDrop] Aborted - Item not found (checked tasks and phases): ', itemId);
            setDraggingTask(null); return; 
        }
    }
    // --- End Find item ---
    
    console.log(`[handleTaskDrop] Found ${itemType}:`, item);
    try {
      const ganttRect = ganttRef.current.getBoundingClientRect();
      const dropX = e.clientX - ganttRect.left + ganttRef.current.scrollLeft;
      const daysFromViewStart = Math.round(dropX / dayWidth);
      const newDropDate = addDays(viewStartDate, daysFromViewStart);
      console.log('[handleTaskDrop] Calculated newDropDate:', newDropDate);
      
      const projectStart = ensureDate(activeProject.startDate), projectEnd = ensureDate(activeProject.endDate);
      const taskStart = ensureDate(item.startDate), taskEnd = ensureDate(item.endDate);
      
      if (!projectStart || /* !projectEnd || */ !taskStart || !taskEnd) { 
         console.warn('[handleTaskDrop] Aborted - Invalid project start or item dates:', { projectStart, taskStart, taskEnd });
         setDraggingTask(null); return; 
      }
      
      if (isBefore(newDropDate, projectStart)) { 
          console.warn('[handleTaskDrop] Aborted - New drop date is before project start:', { newDropDate, projectStart });
          setDraggingTask(null); return; 
      }
      
      const durationDays = differenceInDays(taskEnd, taskStart);
      const newEndDate = addDays(newDropDate, durationDays);
      // console.log('[handleTaskDrop] Calculated newEndDate:', newEndDate);
      
      // Modify boundary check: Check against projectEndDate ONLY if it exists
      if (projectEnd && isAfter(newEndDate, projectEnd)) { 
          console.warn('[handleTaskDrop] Aborted - New end date is after project end:', { newEndDate, projectEnd });
          setDraggingTask(null); return; 
      }
      
      const newStartDateString = formatDate(newDropDate), newEndDateString = formatDate(newEndDate);
      
      console.log('[handleTaskDrop] Attempting updateTask/updatePhase:', { 
        itemId, 
        itemType,
        newStartDate: newStartDateString, 
        newEndDate: newEndDateString 
      });
      
      // --- Update Task or Phase --- 
      if (itemType === 'task') {
          updateTask({ id: itemId, startDate: newStartDateString, endDate: newEndDateString } as Task);
      } else {
          updatePhase({ id: itemId, startDate: newStartDateString, endDate: newEndDateString } as Phase);
      }
      // --- End Update --- 
      
    } catch (error) { console.error("Error during item drop calculation:", error); } finally { setDraggingTask(null); setDragPreview(null); }
  }, [activeProject, viewStartDate, dayWidth, setDraggingTask, updateTask, updatePhase, setDragPreview]);
  
  const handleTaskResizeStart = useCallback((taskId: string, edge: "start" | "end", e: React.MouseEvent) => {
    // console.log('[handleTaskResizeStart] Started:', { taskId, edge }); 
    setResizePreview(null); // Clear previous resize preview
    setResizingTask({ id: taskId, edge });
    e.stopPropagation(); 
    const ganttElement = ganttRef.current;
    if (!ganttElement || !activeProject) return; // Simplified check

    // --- Find item (task or phase) for resizing ---
    let item: Task | Phase | undefined = activeProject.tasks?.find((t: Task) => t.id === taskId);
    let itemType: 'task' | 'phase' = 'task';
    if (!item) {
      item = activeProject.phases?.find((p: Phase) => p.id === taskId);
      if (item) {
        itemType = 'phase';
      } else {
        console.warn(`[handleTaskResizeStart] Item with id ${taskId} not found for resizing.`);
        setResizingTask(null);
        return;
      }
    }
    // --- End Find Item ---
    
    const initialMouseX = e.clientX;
    let originalStartDate: Date | null, originalEndDate: Date | null, projectStartDate: Date | null, projectEndDate: Date | null;
    try {
        originalStartDate = ensureDate(item.startDate);
        originalEndDate = ensureDate(item.endDate);
        projectStartDate = ensureDate(activeProject.startDate);
        projectEndDate = ensureDate(activeProject.endDate); // Can still be null
        // console.log('[handleTaskResizeStart] Dates for check:', {
        //     originalStartDate,
        //     originalEndDate,
        //     projectStartDate,
        //     projectEndDate
        // });
        if (!originalStartDate || !originalEndDate || !projectStartDate /* || !projectEndDate */) { 
            console.warn('[handleTaskResizeStart] Aborted - Invalid dates found (item or project start):', {
                originalStartDate,
                originalEndDate,
                projectStartDate
            }); 
            setResizingTask(null); 
            return; 
        }
    } catch (error) { console.error("Error ensuring dates for resize start:", error); setResizingTask(null); return; }
    const handleMouseMove = (moveEvent: MouseEvent) => {
       try { 
          const movementX = moveEvent.clientX - initialMouseX;
          const currentDayWidth = dayWidthRef.current; 
          if (currentDayWidth <= 0) return; 
          const daysChange = Math.round(movementX / currentDayWidth);
          // console.log('[handleTaskResizeStart] MouseMove calc:', { movementX, daysChange, currentDayWidth });
          
          const currentResizingTask = resizingTaskRef.current;
          // console.log('[handleTaskResizeStart] Current resizingTask state (from ref): ', currentResizingTask);
          
          if (currentResizingTask?.edge === "start") {
             if (!originalStartDate || !originalEndDate || !projectStartDate) { /* console.log('[...] Aborting START: Missing dates'); */ return; }
             const newStartDate = addDays(originalStartDate, daysChange);
             // console.log('[...] START edge: Calculated newStartDate:', newStartDate);
             if (isBefore(newStartDate, projectStartDate)) { 
                 return; 
             } 
             if (isAfter(newStartDate, originalEndDate)) { 
                 return; 
             }
             // --- Set Resize Preview for Start --- 
             const { startIndex } = findDateIndexes(newStartDate, newStartDate, dates); // Find index for new start date
             const newLeft = startIndex * currentDayWidth;
             setResizePreview({ edge: 'start', left: newLeft, date: newStartDate });
             // --- End Set Preview --- 
             handleTaskResizeInternal(taskId, itemType, newStartDate); 
           } else if (currentResizingTask?.edge === "end") {
             if (!originalStartDate || !originalEndDate) { /* console.log('[...] Aborting END: Missing dates'); */ return; }
             const newEndDate = addDays(originalEndDate, daysChange);
             // console.log('[...] END edge: Calculated newEndDate:', newEndDate);
             if (projectEndDate && isAfter(newEndDate, projectEndDate)) { 
                 return; 
             } 
             if (isBefore(newEndDate, originalStartDate)) { 
                 return; 
             }
             // --- Set Resize Preview for End --- 
             const { endIndex } = findDateIndexes(newEndDate, newEndDate, dates); // Find index for new end date
             const newEndEdgeLeft = (endIndex + 1) * currentDayWidth; // Position is the start of the *next* day
             setResizePreview({ edge: 'end', left: newEndEdgeLeft, date: newEndDate });
             // --- End Set Preview --- 
             handleTaskResizeInternal(taskId, itemType, undefined, newEndDate); 
           }
       } catch (error) { 
           console.error("Error during task resize mouse move processing:", error); 
       } 
    };
    const handleMouseUp = () => {
      // console.log('[...] MouseUp event, removing listeners'); 
      setResizingTask(null);
      setResizePreview(null); // Clear resize preview on mouse up
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // console.log('[...] Adding mousemove and mouseup listeners'); 
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [setResizingTask, activeProject, handleTaskResizeInternal, setResizePreview, dates]); // Added setResizePreview and dates
  
  const handleTaskContextMenu = useCallback((taskId: string, e: React.MouseEvent) => {
    console.log(`[handleTaskContextMenu] Triggered for taskId: ${taskId}`, e); // Log event
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling further up
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTaskId(taskId);
  }, [setContextMenuPosition, setContextMenuTaskId]);

  const handleStartInlineEdit = useCallback((taskId: string) => {
    setEditingTask(taskId);
    clearSelection();
  }, [setEditingTask, clearSelection]);

  const handleFinishInlineEdit = useCallback(() => {
     setEditingTask(null);
  }, [setEditingTask]);

  const openTaskEditor = useCallback((taskId: string) => {
    setTaskToEdit(taskId);
    setContextMenuPosition(null);
  }, [setTaskToEdit, setContextMenuPosition]);

  const handleTaskSelection = useCallback((taskId: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e && typeof e.stopPropagation === 'function') { e.stopPropagation(); }
    selectionHandleTaskClick(taskId, e || {} as React.MouseEvent);
    if (e && 'detail' in e && e.detail === 2) { setTaskToView(taskId); }
  }, [selectionHandleTaskClick, setTaskToView]);

  const handleDeletePhaseConfirm = async () => {
    if (phaseToDelete) {
      try { await deletePhase(phaseToDelete); } catch (error) { console.error("UI: Failed to delete phase", error); }
      setPhaseToDelete(null);
    }
  };

  // --- Navigation Handlers (Plain Functions - Moved IN) ---
  const navigateToProject = (projectId: string) => {
    if (typeof projectId === 'string') {
        const projectToView = projects.find((p: Project) => p.id === projectId)
        if (projectToView) {
            setActiveProjectId(projectId!)
            setCurrentView("project")
            setBreadcrumbs([
                { id: "projects", name: "Alla projekt", type: "projects" },
                { id: projectId, name: projectToView.name, type: "project" },
            ])
        }
    }
  };

  const navigateToProjects = () => {
    setActiveProjectId(null)
    setCurrentView("projects")
    setBreadcrumbs([{ id: "projects", name: "Alla projekt", type: "projects" }])
  };

  const navigateToPhase = (phaseId: string) => {
    if (!activeProject) return;
    const phase = activeProject.phases?.find((p: Phase) => p.id === phaseId);
    if (phase) {
      setCurrentPhase(phaseId);
      setCurrentView("phase");
      setBreadcrumbs([
        { id: "projects", name: "Alla projekt", type: "projects" },
        { id: activeProject.id, name: activeProject.name, type: "project" },
        { id: phaseId, name: phase.name, type: "phase" },
      ]);
    } else { console.warn(`Phase with id ${phaseId} not found in active project.`); }
  };

  // --- Scroll Synchronization ---
  const syncScroll = useCallback((source: 'left' | 'right') => {
    if (isSyncingScroll.current) return; // Prevent infinite loop

    isSyncingScroll.current = true;

    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;

    if (leftEl && rightEl) {
      if (source === 'left') {
        if (rightEl.scrollTop !== leftEl.scrollTop) {
          console.log(`Syncing right scroll to left: ${leftEl.scrollTop}`);
          rightEl.scrollTop = leftEl.scrollTop;
        }
      } else { // source === 'right'
        if (leftEl.scrollTop !== rightEl.scrollTop) {
          console.log(`Syncing left scroll to right: ${rightEl.scrollTop}`);
          leftEl.scrollTop = rightEl.scrollTop;
        }
      }
    }
    
    // Use requestAnimationFrame to release the lock after the next frame
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  }, []);

  // Attach scroll listeners
  useEffect(() => {
    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;

    const handleLeftScroll = () => syncScroll('left');
    const handleRightScroll = () => syncScroll('right');

    if (leftEl) leftEl.addEventListener('scroll', handleLeftScroll);
    if (rightEl) rightEl.addEventListener('scroll', handleRightScroll);

    return () => {
      if (leftEl) leftEl.removeEventListener('scroll', handleLeftScroll);
      if (rightEl) rightEl.removeEventListener('scroll', handleRightScroll);
    };
  }, [syncScroll]);

  // --- Sub-Component: TimelineHeader (KEEP AS IS FOR NOW) ---
  const TimelineHeader = ({ dates, dayWidth, timeScale }: { dates: Date[]; dayWidth: number; timeScale: TimeScale }) => {
    const monthsMap = new Map<string, { startIndex: number; count: number; }>();
    const weeksMap = new Map<string, { startIndex: number; count: number; weekNumber: number; }>();
    
    // Group dates by month and week
    dates.forEach((date, index) => {
      const monthYear = date.toLocaleDateString('sv', { month: 'short', year: 'numeric' }); // Use year too for uniqueness
      if (!monthsMap.has(monthYear)) {
        monthsMap.set(monthYear, { startIndex: index, count: 1 });
      } else {
        // Use non-null assertion safely as we checked existence with .has()
        monthsMap.get(monthYear)!.count++; 
      }

      // Consider "month" timescale as well for week calculation if needed
      if (timeScale === "week" || timeScale === "day" || timeScale === "month") { 
        const weekNumber = getISOWeek(date);
        const year = date.getFullYear(); // Include year for week uniqueness across year boundaries
        const weekYear = `${year}-W${weekNumber}`;
        if (!weeksMap.has(weekYear)) {
          weeksMap.set(weekYear, { startIndex: index, count: 1, weekNumber });
        } else {
          // Use non-null assertion safely
          weeksMap.get(weekYear)!.count++; 
        }
      }
    });

    return (
      // Use min-w-full to ensure it takes at least the full width, important for overflow
      <div ref={timelineHeaderRef} className="relative border-b border-border bg-card text-xs font-medium min-w-full"> 
        {/* Month Row - Always show? */}
        <div className="flex h-8 border-b border-border/70">
          {Array.from(monthsMap.entries()).map(([key, { count }]) => (
            <div 
              key={key} 
              // Use min-width to handle potential floating point issues with many small columns
              className="flex-shrink-0 border-r last:border-r-0 px-2 flex items-center justify-center truncate" 
              style={{ width: `${count * dayWidth}px`, minWidth: `${count * dayWidth}px` }} 
            >
              {key}
            </div>
          ))}
        </div>
        {/* Week Row - Show if timescale is day or week */}
        {(timeScale === "day" || timeScale === "week") && (
          <div className="flex h-7 border-b border-border/70">
            {Array.from(weeksMap.entries()).map(([key, { count, weekNumber }]) => (
              <div 
                key={key} 
                className="flex-shrink-0 border-r last:border-r-0 px-1 flex items-center justify-center truncate" 
                style={{ width: `${count * dayWidth}px`, minWidth: `${count * dayWidth}px` }} 
              >
                {/* Optionally add year if needed: {key.split('-')[0]} */}
                Vecka {weekNumber} 
              </div>
            ))}
          </div>
        )}
        {/* Day Row - Only show if timescale is day */}
        {timeScale === "day" && (
          <div className="flex h-6">
            {dates.map((date, i) => (
              <div 
                key={i} 
                // Add explicit height and ensure text doesn't wrap
                className="flex-shrink-0 border-r last:border-r-0 flex items-center justify-center overflow-hidden whitespace-nowrap" 
                style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px`, height: '1.5rem' }} // Match h-6 approx
              >
                {date.getDate()}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Add a handler for dragend to clear preview if drag is cancelled
  const handleDragEnd = useCallback(() => {
      console.log("[handleDragEnd] Drag ended, clearing preview.");
      setDraggingTask(null);
      setDragPreview(null);
  }, [setDraggingTask, setDragPreview]);

  // --- Rendering --- 
  if (!activeProject && currentView !== 'projects') { return <div>Laddar projekt...</div>; }
  if (currentView === 'projects') { /* Render project overview */ return (<Card>...</Card>); }
  if (!activeProject) { return <div>Ett fel uppstod.</div>; }

  return (
    <Card className="w-full flex flex-col h-screen">
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
        showColorLegend={showColorLegend}
        setShowColorLegend={setShowColorLegend}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        isAddingTask={isAddingTask}
        setIsAddingTask={setIsAddingTask}
        isAddingPhase={isAddingPhase}
        setIsAddingPhase={setIsAddingPhase}
        isAddingActivity={isAddingActivity}
        setIsAddingActivity={setIsAddingActivity}
        setActivityType={setActivityType}
        handleMoveLeft={handleMoveLeft}
        handleMoveRight={handleMoveRight}
        handleJumpLeft={handleJumpLeft}
        handleJumpRight={handleJumpRight}
      />
      <div className="flex flex-row flex-grow overflow-hidden relative">
        <div 
          ref={leftScrollRef} 
          className="border-r overflow-hidden flex-shrink-0"
          style={{ width: "200px", minWidth: "100px", height: "calc(100vh - 120px)", minHeight: "300px" }}
        >
           <div style={{ height: `${timelineHeaderHeight}px` }} />
           <GanttTaskTree
             displayedItems={displayedItems}
             selectedItemId={selectedTask}
             onSelectItem={(id, type) => {
                  if (type === "task") { handleTaskSelection(id); } 
                  else if (type === "phase") { navigateToPhase(id); }
             }}
             expandedPhases={expandedPhases}
             togglePhase={togglePhase}
             handleTaskContextMenu={handleTaskContextMenu}
             rowHeight={ROW_HEIGHT}
           />
        </div>
        
        {/* Draggable divider */}
        <div
          className="w-1 bg-border cursor-col-resize z-10 hover:w-2 hover:bg-muted transition-all active:bg-muted/70"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = leftScrollRef.current?.offsetWidth || 200;
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              if (leftScrollRef.current) {
                const newWidth = Math.max(100, Math.min(500, startWidth + moveEvent.clientX - startX));
                leftScrollRef.current.style.width = `${newWidth}px`;
              }
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
        
        <div 
          ref={ganttRef}
          className="flex-grow overflow-hidden"
          style={{ height: "calc(100vh - 120px)", minHeight: "300px" }}
        >
          <div 
            ref={rightScrollRef} 
            className="h-full overflow-hidden relative"
            onClick={clearSelection} 
            onDragOver={handleTaskDragOver}
            onDrop={handleTaskDrop}
          >
            <div className="relative z-10 bg-background">
              <TimelineHeader dates={dates} dayWidth={dayWidth} timeScale={timeScale} />
            </div>
            
            {/* Task Area and Preview Container */} 
            <div className="relative"> 
                {/* Drag Preview Line */} 
                {dragPreview && (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-500 pointer-events-none"
                    style={{ left: `${dragPreview.left}px`, zIndex: 999 }}
                  >
                    {/* Optional: Show date in tooltip */}
                    <div className="absolute -top-5 left-1 whitespace-nowrap bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded shadow">
                      {format(dragPreview.date, 'd MMM', { locale: sv })}
                    </div>
                  </div>
                )}
                {/* Resize Preview Line */} 
                {resizePreview && (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500 pointer-events-none" // Red color for resize
                    style={{ left: `${resizePreview.left}px`, zIndex: 999 }}
                  >
                    <div className="absolute -top-5 left-1 whitespace-nowrap bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded shadow">
                      {format(resizePreview.date, 'd MMM', { locale: sv })} ({resizePreview.edge})
                    </div>
                  </div>
                )}

                {/* Task Area */} 
                <TaskArea 
                  displayedItems={displayedItems}
                  activeProject={activeProject}
                  showMilestones={showMilestones}
                  dates={dates}
                  dayWidth={dayWidth}
                  getTaskPosition={getTaskPosition}
                  getMilestonePosition={getMilestonePosition}
                  selectedTask={selectedTask}
                  selectedTasks={selectedTasks}
                  editingTask={editingTask}
                  handleTaskSelection={handleTaskSelection}
                  handleTaskContextMenu={handleTaskContextMenu}
                  handleStartInlineEdit={handleStartInlineEdit}
                  handleFinishInlineEdit={handleFinishInlineEdit}
                  handleSaveInlineEditInternal={handleSaveInlineEditInternal}
                  handleTaskDragStart={handleTaskDragStart}
                  handleTaskResizeStart={handleTaskResizeStart}
                  handleDragEnd={handleDragEnd}
                />
            </div>
          </div>
        </div>
      </div>
      <CreateProjectDialog />
      <AddTaskDialog activeProjectId={activeProjectId} />
      <EditTaskDialog taskId={taskToEdit} isOpen={taskToEdit !== null} onClose={() => setTaskToEdit(null)} />
      <TaskDetailsDialog isOpen={taskToView !== null} onOpenChange={(open) => !open && setTaskToView(null)} taskId={taskToView} onEditTask={openTaskEditor} /> 
      <ResourceDetailsDialog isOpen={resourceToView !== null} onOpenChange={(open: boolean) => !open && setResourceToView(null)} resourceId={resourceToView} /> 
      <PhaseDialog isOpen={isAddingPhase || phaseToEdit !== null} onOpenChange={(open) => { if (!open) { setIsAddingPhase(false); setPhaseToEdit(null); } }} projectId={activeProjectId} phaseId={phaseToEdit} /> 
      <ActivityDialog isOpen={isAddingActivity || taskToEdit !== null} onOpenChange={(open) => { if (!open) { setIsAddingActivity(false); setTaskToEdit(null); setCurrentParentTaskId(null); if (isAddingActivity) { setCurrentPhase(null); } } }} projectId={activeProjectId} phaseId={currentPhase} parentTaskId={currentParentTaskId} taskId={taskToEdit} defaultType={activityType} />
      {contextMenuPosition && contextMenuTaskId && (
         <DropdownMenu open={!!contextMenuPosition} onOpenChange={(open: boolean) => !open && setContextMenuPosition(null)}>
            <DropdownMenuTrigger 
               style={{ position: 'fixed', left: contextMenuPosition.x, top: contextMenuPosition.y, width: 0, height: 0 }} 
            />
            <DropdownMenuContent align="start">
               <DropdownMenuItem onClick={() => handleStartInlineEdit(contextMenuTaskId)}>Byt namn</DropdownMenuItem>
               {filteredTasks.find((item: Task) => item.id === contextMenuTaskId && item.isPhase) ? (
                 <DropdownMenuItem onClick={() => {
                   setPhaseToEdit(contextMenuTaskId);
                   setContextMenuPosition(null);
                 }}>Redigera fas...</DropdownMenuItem>
               ) : (
                 <DropdownMenuItem onClick={() => openTaskEditor(contextMenuTaskId)}>Redigera uppgift...</DropdownMenuItem>
               )}
               {filteredTasks.find((item: Task) => item.id === contextMenuTaskId && item.isPhase) && (
                 <DropdownMenuItem onClick={() => {
                   setIsAddingActivity(true);
                   setCurrentPhase(contextMenuTaskId);
                   setContextMenuPosition(null);
                 }}>Lägg till aktivitet i fas</DropdownMenuItem>
               )}
               <DropdownMenuSeparator />
               <DropdownMenuItem
                 onClick={() => {
                   setContextMenuPosition(null);
                   if (filteredTasks.find((item: Task) => item.id === contextMenuTaskId && item.isPhase)) {
                     setPhaseToDelete(contextMenuTaskId);
                   } else {
                     // Call the handleDeleteTaskInternal function for regular tasks and deliveries
                     handleDeleteTaskInternal(contextMenuTaskId);
                   }
                 }}
                 className="text-destructive"
               >
                 Ta bort
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      )} 
      <AlertDialog open={phaseToDelete !== null} onOpenChange={(open: boolean) => !open && setPhaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker på att du vill ta bort denna fas?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Detta kommer ta bort fasen och alla uppgifter som tillhör den.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhaseConfirm} className="bg-destructive text-destructive-foreground">
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}