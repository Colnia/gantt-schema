"use client"

import React, { createContext, useState, useContext, useMemo, useCallback, ReactNode, Dispatch, SetStateAction } from "react"
import { TimeScale, ViewMode } from "@/lib/types"
import { parseISO, addMonths } from "date-fns"
import { getDefaultDayWidth } from "@/lib/utils/date-utils"

// Initiala värden (kan behöva justeras baserat på exakt logik i gamla komponenten)
// Vi behöver en default start/end date om ingen projektdata finns initialt
const defaultStartDate = new Date();
const defaultEndDate = addMonths(defaultStartDate, 6);

type Breadcrumb = { id: string; name: string; type: "projects" | "project" | "phase" };
type ContextMenuPosition = { x: number; y: number };

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
  timeScale: TimeScale
  setTimeScale: Dispatch<SetStateAction<TimeScale>>
  viewMode: ViewMode
  setViewMode: Dispatch<SetStateAction<ViewMode>>
  currentView: "projects" | "project" | "phase"
  setCurrentView: Dispatch<SetStateAction<"projects" | "project" | "phase">>
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
  const [viewMode, setViewMode] = useState<ViewMode>("standard")
  const [currentView, setCurrentView] = useState<"projects" | "project" | "phase">("projects")
  const [currentPhase, setCurrentPhase] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: "projects", name: "Alla projekt", type: "projects" }])
  const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition | null>(null)
  const [contextMenuTaskId, setContextMenuTaskId] = useState<string | null>(null)

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
    setDayWidth((prev) => Math.min(100, prev + 5)) // Begränsa max zoom
  }, [])

  const handleZoomOut = useCallback(() => {
    setDayWidth((prev) => Math.max(5, prev - 5)) // Begränsa min zoom
  }, [])

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
    }),
    [ // Inkludera alla states och funktioner
      viewStartDate, viewEndDate, dayWidth, searchTerm, showResources,
      showDependencies, showMilestones, timeScale, viewMode, currentView,
      currentPhase, breadcrumbs, contextMenuPosition, contextMenuTaskId, 
      handleTimeScaleChange, handleViewModeChange, handleZoomIn, handleZoomOut
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