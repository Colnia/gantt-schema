"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Task } from "@/lib/types"
import { getStatusColor } from "@/lib/utils/task-utils"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface TaskGroupProps {
  phase: Task
  childTasks: Task[]
  isSelected: boolean
  onSelect: (taskId: string, event: React.MouseEvent) => void
  onToggleExpand: (phaseId: string) => void
  onNavigateToPhase?: (phaseId: string) => void
}

export const TaskGroup: React.FC<TaskGroupProps> = ({
  phase,
  childTasks,
  isSelected,
  onSelect,
  onToggleExpand,
  onNavigateToPhase
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
    onToggleExpand(phase.id)
  }

  const handleNavigateToPhase = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onNavigateToPhase) {
      onNavigateToPhase(phase.id)
    }
  }

  // Beräkna gruppens framsteg baserat på underuppgifter
  const calculateGroupProgress = (): number => {
    if (!childTasks.length) return phase.progress || 0
    
    const totalProgress = childTasks.reduce((sum, task) => sum + (task.progress || 0), 0)
    return Math.round(totalProgress / childTasks.length)
  }

  const groupProgress = calculateGroupProgress()
  const statusColorClass = getStatusColor(phase.status)
  const statusIndicatorClass = statusColorClass.replace('bg-', 'border-l-4 border-')

  return (
    <div className="group">
      <div 
        className={`flex items-center p-2 border-b hover:bg-muted text-sm cursor-pointer group-hover:bg-muted/50 ${
          isSelected ? 'bg-muted font-medium' : ''
        } ${statusIndicatorClass}`}
        onClick={(e) => onSelect(phase.id, e)}
      >
        <button 
          className="mr-1 p-0.5 hover:bg-muted-foreground/10 rounded"
          onClick={handleToggleExpand}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        
        <div className="flex-1 flex items-center">
          <span className="font-medium">{phase.name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {groupProgress}%
          </Badge>
          {onNavigateToPhase && (
            <button 
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              onClick={handleNavigateToPhase}
            >
              Visa detaljer
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="pl-6 border-l border-l-muted-foreground/20 ml-2">
          <div className="py-1">
            <Progress value={groupProgress} className="h-1" />
          </div>
          
          {childTasks.map((task) => (
            <div 
              key={task.id}
              className={`flex items-center p-2 border-b hover:bg-muted text-sm cursor-pointer ${
                isSelected ? 'bg-muted font-medium' : ''
              }`}
              onClick={(e) => onSelect(task.id, e)}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(task.status)}`} />
              <span>{task.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {task.progress || 0}%
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskGroup 