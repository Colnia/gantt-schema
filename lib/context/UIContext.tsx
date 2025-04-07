"use client"

import React, { createContext, useState, useContext, useMemo, useCallback, ReactNode, Dispatch, SetStateAction } from "react"
import { TimeScale, ViewMode } from "@/lib/types"
import { parseISO, addMonths, addWeeks, addDays, differenceInDays, differenceInWeeks, differenceInMonths, subMonths, subWeeks, subDays } from "date-fns"
import { getDefaultDayWidth } from "@/lib/utils/date-utils"

// Initiala värden (kan behöva justeras baserat på exakt logik i gamla komponenten)
// Vi behöver en default start/end date om ingen projektdata finns initialt
const defaultStartDate = new Date();
const defaultEndDate = addMonths(defaultStartDate, 6);

type Breadcrumb = { id: string; name: string; type: "projects" | "project" | "phase" };
type ContextMenuPosition = { x: number; y: number };
type ViewType = "projects" | "project" | "phase" | "gantt" | "list";

interface UIContextProps {
  viewStartDate: Date
  setViewStartDate: Dispatch<SetStateAction<Date>>
  viewEndDate: Date
  setViewEndDate: Dispatch<SetStateAction<Date>>
  dayWidth: number
  setDayWidth: Dispatch<SetStateAction<number>>
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  showResources: boolean
  setShowResources: Dispatch<SetStateAction<boolean>>
  showDependencies: boolean
  setShowDependencies: Dispatch<SetStateAction<boolean>>
  showMilestones: boolean
  setShowMilestones: Dispatch<SetStateAction<boolean>>
  showColorLegend: boolean
  setShowColorLegend: Dispatch<SetStateAction<boolean>>
  timeScale: TimeScale
  setTimeScale: Dispatch<SetStateAction<TimeScale>>
  viewMode: ViewMode
  setViewMode: Dispatch<SetStateAction<ViewMode>>
  currentView: ViewType
  setCurrentView: Dispatch<SetStateAction<ViewType>>
  currentPhase: string | null
  setCurrentPhase: Dispatch<SetStateAction<string | null>>
  breadcrumbs: Breadcrumb[]
  setBreadcrumbs: Dispatch<SetStateAction<Breadcrumb[]>>
  contextMenuPosition: ContextMenuPosition | null
  setContextMenuPosition: Dispatch<SetStateAction<ContextMenuPosition | null>>
  contextMenuTaskId: string | null
  setContextMenuTaskId: Dispatch<SetStateAction<string | null>>
  handleTimeScaleChange: (scale: TimeScale) => void // Bekvämlighetsfunktion
  handleViewModeChange: (mode: ViewMode) => void // Bekvämlighetsfunktion
  handleZoomIn: () => void
  handleZoomOut: () => void
  expandedPhases: Set<string>
  togglePhase: (phaseId: string) => void
  handleMoveLeft: () => void
  handleMoveRight: () => void
  handleJumpLeft: () => void
  handleJumpRight: () => void
}

const UIContext = createContext<UIContextProps | undefined>(undefined)

export const UIProvider = ({ children }: { children: ReactNode }) => {
  // TODO: Koppla initiala viewStartDate/viewEndDate till activeProject när det laddats?
  const [viewStartDate, setViewStartDate] = useState<Date>(defaultStartDate)
  const [viewEndDate, setViewEndDate] = useState<Date>(defaultEndDate)
  
  const [timeScale, setTimeScale] = useState<TimeScale>("day")
  const [dayWidth, setDayWidth] = useState<number>(getDefaultDayWidth(timeScale))
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showResources, setShowResources] = useState<boolean>(true)
  const [showDependencies, setShowDependencies] = useState<boolean>(true)
  const [showMilestones, setShowMilestones] = useState<boolean>(true)
  const [showColorLegend, setShowColorLegend] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<ViewMode>("standard")
  const [currentView, setCurrentView] = useState<ViewType>("gantt")
  const [currentPhase, setCurrentPhase] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: "projects", name: "Alla projekt", type: "projects" }])
  const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition | null>(null)
  const [contextMenuTaskId, setContextMenuTaskId] = useState<string | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set<string>())

  // Uppdatera dayWidth när timeScale ändras
  React.useEffect(() => {
    setDayWidth(getDefaultDayWidth(timeScale))
  }, [timeScale])

  // Bekvämlighetsfunktioner
  const handleTimeScaleChange = useCallback((scale: TimeScale) => {
    setTimeScale(scale)
  }, [])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
  }, [])

  const handleZoomIn = useCallback(() => {
    // Validera indata
    if (!viewStartDate || !viewEndDate) {
      console.warn("Cannot zoom in: viewStartDate or viewEndDate is null");
      return;
    }
    
    try {
      // Beräkna centrum av nuvarande vy
      const currentDaySpan = differenceInDays(viewEndDate, viewStartDate);
      if (currentDaySpan <= 7) {
        console.log("Reached minimum zoom level (7 days)");
        return; // Förhindra zoom in under 7 dagar
      }
      
      // Beräkna vyns centrum (middle point)
      const midPointOffset = Math.floor(currentDaySpan / 2);
      const midPoint = addDays(viewStartDate, midPointOffset);
      
      // Öka dayWidth för visuell zoom
      setDayWidth(prevWidth => {
        const newWidth = Math.min(prevWidth * 1.25, 100);
        return newWidth;
      });
      
      // Beräkna nytt tidsintervall (ungefär 20% mindre)
      const newDaySpan = Math.max(7, Math.floor(currentDaySpan * 0.8));
      const halfNewSpan = Math.floor(newDaySpan / 2);
      
      // Beräkna nya datum centrerade runt midPoint
      const newStartDate = subDays(midPoint, halfNewSpan);
      const newEndDate = addDays(midPoint, halfNewSpan);
      
      console.log('Zooming in:', {
        oldSpan: currentDaySpan,
        newSpan: newDaySpan,
        midPoint: midPoint.toISOString(),
        oldStart: viewStartDate.toISOString(),
        oldEnd: viewEndDate.toISOString(),
        newStart: newStartDate.toISOString(),
        newEnd: newEndDate.toISOString()
      });
      
      // Uppdatera datum som en atomisk operation
      setViewStartDate(newStartDate);
      setViewEndDate(newEndDate);
    } catch (error) {
      console.error("Error during zoom in:", error);
    }
  }, [viewStartDate, viewEndDate]);

  const handleZoomOut = useCallback(() => {
    // Validera indata och minvärden
    if (!viewStartDate || !viewEndDate) {
      console.warn("Cannot zoom out: viewStartDate or viewEndDate is null");
      return;
    }
    
    if (dayWidth <= 5) {
      console.log("Reached minimum dayWidth (5px)");
      return; // Prevent zooming out below minimum width
    }
    
    try {
      // Beräkna centrum av nuvarande vy
      const currentDaySpan = differenceInDays(viewEndDate, viewStartDate);
      
      // Beräkna vyns centrum (middle point)
      const midPointOffset = Math.floor(currentDaySpan / 2);
      const midPoint = addDays(viewStartDate, midPointOffset);
      
      // Minska dayWidth för visuell zoom
      setDayWidth(prevWidth => {
        const newWidth = Math.max(prevWidth * 0.8, 5);
        return newWidth;
      });
      
      // Beräkna nytt tidsintervall (ungefär 25% större)
      const newDaySpan = Math.ceil(currentDaySpan * 1.25);
      const halfNewSpan = Math.floor(newDaySpan / 2);
      
      // Beräkna nya datum centrerade runt midPoint
      const newStartDate = subDays(midPoint, halfNewSpan);
      const newEndDate = addDays(midPoint, halfNewSpan);
      
      console.log('Zooming out:', {
        oldSpan: currentDaySpan,
        newSpan: newDaySpan,
        midPoint: midPoint.toISOString(),
        oldStart: viewStartDate.toISOString(),
        oldEnd: viewEndDate.toISOString(),
        newStart: newStartDate.toISOString(),
        newEnd: newEndDate.toISOString()
      });
      
      // Uppdatera datum som en atomisk operation 
      setViewStartDate(newStartDate);
      setViewEndDate(newEndDate);
    } catch (error) {
      console.error("Error during zoom out:", error);
    }
  }, [dayWidth, viewStartDate, viewEndDate]);

  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhases(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(phaseId)) {
        newExpanded.delete(phaseId);
      } else {
        newExpanded.add(phaseId);
      }
      return newExpanded;
    });
  }, []);

  // Navigeringsfunktioner - Flyttar vyfönstret åt vänster/höger
  const handleMoveLeft = useCallback(() => {
    if (!viewStartDate || !viewEndDate) return;
    
    // Beräkna hur mycket fönstret ska flyttas (10% av nuvarande synliga tidsintervall)
    const currentSpan = differenceInDays(viewEndDate, viewStartDate);
    const moveAmount = Math.max(7, Math.round(currentSpan * 0.1)); // Minst 7 dagar
    
    // Skapa nya datum genom att subtrahera dagar från både start och slut
    // VIKTIGT: Detta bevarar tidsintervallet och säkerställer korrekt rendering
    const newStartDate = subDays(viewStartDate, moveAmount);
    const newEndDate = subDays(viewEndDate, moveAmount);
    
    console.log('Moving view left:', {
      moveAmount,
      oldStart: viewStartDate.toISOString(),
      oldEnd: viewEndDate.toISOString(),
      newStart: newStartDate.toISOString(),
      newEnd: newEndDate.toISOString()
    });
    
    // Uppdatera båda datumen tillsammans för att undvika instabilitet
    setViewStartDate(newStartDate);
    setViewEndDate(newEndDate);
  }, [viewStartDate, viewEndDate]);

  const handleMoveRight = useCallback(() => {
    if (!viewStartDate || !viewEndDate) return;
    
    // Beräkna hur mycket fönstret ska flyttas (10% av nuvarande synliga tidsintervall)
    const currentSpan = differenceInDays(viewEndDate, viewStartDate);
    const moveAmount = Math.max(7, Math.round(currentSpan * 0.1)); // Minst 7 dagar
    
    // Skapa nya datum genom att addera dagar till både start och slut
    // VIKTIGT: Detta bevarar tidsintervallet och säkerställer korrekt rendering
    const newStartDate = addDays(viewStartDate, moveAmount);
    const newEndDate = addDays(viewEndDate, moveAmount);
    
    console.log('Moving view right:', {
      moveAmount,
      oldStart: viewStartDate.toISOString(),
      oldEnd: viewEndDate.toISOString(),
      newStart: newStartDate.toISOString(),
      newEnd: newEndDate.toISOString()
    });
    
    // Uppdatera båda datumen tillsammans för att undvika instabilitet
    setViewStartDate(newStartDate);
    setViewEndDate(newEndDate);
  }, [viewStartDate, viewEndDate]);

  const handleJumpLeft = useCallback(() => {
    if (!viewStartDate || !viewEndDate) return;
    
    // Beräkna hur mycket fönstret ska flyttas (50% av nuvarande synliga tidsintervall)
    const currentSpan = differenceInDays(viewEndDate, viewStartDate);
    const jumpAmount = Math.max(28, Math.round(currentSpan * 0.5)); // Minst 28 dagar (4 veckor)
    
    // Skapa nya datum genom att subtrahera dagar från både start och slut
    const newStartDate = subDays(viewStartDate, jumpAmount);
    const newEndDate = subDays(viewEndDate, jumpAmount);
    
    console.log('Jumping view left:', {
      jumpAmount,
      oldStart: viewStartDate.toISOString(),
      oldEnd: viewEndDate.toISOString(),
      newStart: newStartDate.toISOString(),
      newEnd: newEndDate.toISOString()
    });
    
    setViewStartDate(newStartDate);
    setViewEndDate(newEndDate);
  }, [viewStartDate, viewEndDate]);

  const handleJumpRight = useCallback(() => {
    if (!viewStartDate || !viewEndDate) return;
    
    // Beräkna hur mycket fönstret ska flyttas (50% av nuvarande synliga tidsintervall)
    const currentSpan = differenceInDays(viewEndDate, viewStartDate);
    const jumpAmount = Math.max(28, Math.round(currentSpan * 0.5)); // Minst 28 dagar (4 veckor)
    
    // Skapa nya datum genom att addera dagar till både start och slut
    const newStartDate = addDays(viewStartDate, jumpAmount);
    const newEndDate = addDays(viewEndDate, jumpAmount);
    
    console.log('Jumping view right:', {
      jumpAmount,
      oldStart: viewStartDate.toISOString(),
      oldEnd: viewEndDate.toISOString(),
      newStart: newStartDate.toISOString(),
      newEnd: newEndDate.toISOString()
    });
    
    setViewStartDate(newStartDate);
    setViewEndDate(newEndDate);
  }, [viewStartDate, viewEndDate]);

  const value = useMemo(
    () => ({
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
      showColorLegend,
      setShowColorLegend,
      timeScale,
      setTimeScale, // Behåll denna om direkt åtkomst behövs
      viewMode,
      setViewMode, // Behåll denna om direkt åtkomst behövs
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
      expandedPhases,
      togglePhase,
      handleMoveLeft,
      handleMoveRight,
      handleJumpLeft,
      handleJumpRight,
    }),
    [ // Inkludera alla states och funktioner
      viewStartDate, viewEndDate, dayWidth, searchTerm, showResources,
      showDependencies, showMilestones, showColorLegend, timeScale, viewMode, currentView,
      currentPhase, breadcrumbs, contextMenuPosition, contextMenuTaskId, 
      handleTimeScaleChange, handleViewModeChange, handleZoomIn, handleZoomOut,
      expandedPhases, togglePhase,
      handleMoveLeft,
      handleMoveRight,
      handleJumpLeft,
      handleJumpRight
    ]
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export const useUI = () => {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
} 