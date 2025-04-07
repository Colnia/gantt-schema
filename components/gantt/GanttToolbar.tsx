"use client"

import * as React from "react"
import {
  Calendar,
  Plus,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  Milestone,
  ShoppingBag,
  FileCheck,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { sv } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { type Project, type TimeScale, type ViewMode } from "@/lib/types"

interface GanttToolbarProps {
  currentView: "projects" | "project" | "phase" | "gantt" | "list"
  project: Project | null
  searchTerm: string
  setSearchTerm: (value: string) => void
  timeScale: TimeScale
  handleTimeScaleChange: (value: TimeScale) => void
  handleViewModeChange: (value: ViewMode) => void
  showResources: boolean
  setShowResources: (value: boolean) => void
  showDependencies: boolean
  setShowDependencies: (value: boolean) => void
  showMilestones: boolean
  setShowMilestones: (value: boolean) => void
  showColorLegend: boolean
  setShowColorLegend: (value: boolean) => void
  handleZoomIn: () => void
  handleZoomOut: () => void
  isAddingTask: boolean
  setIsAddingTask: (value: boolean) => void
  isAddingPhase: boolean
  setIsAddingPhase: (value: boolean) => void
  isAddingActivity: boolean
  setIsAddingActivity: (value: boolean) => void
  setActivityType: (value: string) => void
  handleMoveLeft: () => void
  handleMoveRight: () => void
  handleJumpLeft: () => void
  handleJumpRight: () => void
}

export function GanttToolbar({
  currentView,
  project,
  searchTerm,
  setSearchTerm,
  timeScale,
  handleTimeScaleChange,
  handleViewModeChange,
  showResources,
  setShowResources,
  showDependencies,
  setShowDependencies,
  showMilestones,
  setShowMilestones,
  showColorLegend,
  setShowColorLegend,
  handleZoomIn,
  handleZoomOut,
  isAddingTask,
  setIsAddingTask,
  isAddingPhase,
  setIsAddingPhase,
  isAddingActivity,
  setIsAddingActivity,
  setActivityType,
  handleMoveLeft,
  handleMoveRight,
  handleJumpLeft,
  handleJumpRight,
}: GanttToolbarProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">{currentView === "projects" ? "Projektöversikt" : project?.name}</h2>
        {currentView !== "projects" && project?.startDate && project?.endDate && (
          <span className="text-xs px-2 py-0.5 border rounded-full ml-2 bg-slate-100">
            {format(typeof project.startDate === 'string' ? parseISO(project.startDate) : project.startDate, "d MMM yyyy", { locale: sv })} -
            {format(typeof project.endDate === 'string' ? parseISO(project.endDate) : project.endDate, "d MMM yyyy", { locale: sv })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Sök uppgifter..."
            className="w-[200px] pl-8"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              {timeScale === "day" && "Dag"}
              {timeScale === "week" && "Vecka"}
              {timeScale === "month" && "Månad"}
              {timeScale === "quarter" && "Kvartal"}
              {timeScale === "year" && "År"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleTimeScaleChange("day")}>Dag</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeScaleChange("week")}>Vecka</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeScaleChange("month")}>Månad</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeScaleChange("quarter")}>Kvartal</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeScaleChange("year")}>År</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Vy
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewModeChange("standard")}>Standard</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewModeChange("compact")}>Kompakt</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewModeChange("detailed")}>Detaljerad</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Checkbox
                id="show-resources"
                checked={showResources}
                onCheckedChange={(checked: boolean | "indeterminate") => setShowResources(!!checked)}
                className="mr-2"
              />
              <label htmlFor="show-resources">Visa resurser</label>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                id="show-dependencies"
                checked={showDependencies}
                onCheckedChange={(checked: boolean | "indeterminate") => setShowDependencies(!!checked)}
                className="mr-2"
              />
              <label htmlFor="show-dependencies">Visa beroenden</label>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                id="show-milestones"
                checked={showMilestones}
                onCheckedChange={(checked: boolean | "indeterminate") => setShowMilestones(!!checked)}
                className="mr-2"
              />
              <label htmlFor="show-milestones">Visa milstolpar</label>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem 
              checked={showColorLegend}
              onCheckedChange={setShowColorLegend}
            >
              Visa färgförklaring
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleJumpLeft} aria-label="Hoppa bakåt">
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hoppa bakåt</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleMoveLeft} aria-label="Flytta åt vänster">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Flytta åt vänster</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleMoveRight} aria-label="Flytta åt höger">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Flytta åt höger</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleJumpRight} aria-label="Hoppa framåt">
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hoppa framåt</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleZoomIn} aria-label="Zooma in">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zooma in</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleZoomOut} aria-label="Zooma ut">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zooma ut</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {currentView !== "projects" && (
          <>
            <Button onClick={() => setIsAddingPhase(true)}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Lägg till fas
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Lägg till aktivitet
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setActivityType("task");
                  setIsAddingActivity(true);
                }}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Uppgift
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setActivityType("milestone");
                  setIsAddingActivity(true);
                }}>
                  <Milestone className="mr-2 h-4 w-4" />
                  Milstolpe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setActivityType("delivery");
                  setIsAddingActivity(true);
                }}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Leverans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setActivityType("decision");
                  setIsAddingActivity(true);
                }}>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Beslut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  )
}

export default GanttToolbar 