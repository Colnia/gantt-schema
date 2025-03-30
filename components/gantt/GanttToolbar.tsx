"use client"

import React from "react"
import {
  Calendar,
  Plus,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
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
  currentView: string
  project: Project
  searchTerm: string
  setSearchTerm: (term: string) => void
  timeScale: TimeScale
  handleTimeScaleChange: (scale: TimeScale) => void
  handleViewModeChange: (mode: ViewMode) => void
  showResources: boolean
  setShowResources: (show: boolean) => void
  showDependencies: boolean
  setShowDependencies: (show: boolean) => void
  showMilestones: boolean
  setShowMilestones: (show: boolean) => void
  handleZoomIn: () => void
  handleZoomOut: () => void
  isAddingTask: boolean
  setIsAddingTask: (isAdding: boolean) => void
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
  handleZoomIn,
  handleZoomOut,
  isAddingTask,
  setIsAddingTask,
}: GanttToolbarProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">{currentView === "projects" ? "Projektöversikt" : project.name}</h2>
        {currentView !== "projects" && (
          <Badge variant="outline" className="ml-2">
            {format(parseISO(project.startDate), "d MMM yyyy", { locale: sv })} -
            {format(parseISO(project.endDate), "d MMM yyyy", { locale: sv })}
          </Badge>
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
                onCheckedChange={(checked) => setShowResources(!!checked)}
                className="mr-2"
              />
              <label htmlFor="show-resources">Visa resurser</label>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                id="show-dependencies"
                checked={showDependencies}
                onCheckedChange={(checked) => setShowDependencies(!!checked)}
                className="mr-2"
              />
              <label htmlFor="show-dependencies">Visa beroenden</label>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                id="show-milestones"
                checked={showMilestones}
                onCheckedChange={(checked) => setShowMilestones(!!checked)}
                className="mr-2"
              />
              <label htmlFor="show-milestones">Visa milstolpar</label>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Lägg till uppgift
          </Button>
        )}
      </div>
    </div>
  )
}

export default GanttToolbar 