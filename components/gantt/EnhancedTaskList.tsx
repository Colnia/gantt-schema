"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Task } from "@/lib/types"
import { TaskGroup } from "./TaskGroup"
import { groupTasksByParent } from "@/lib/utils/task-utils"

interface EnhancedTaskListProps {
  tasks: Task[]
  selectedTask: string | null
  selectedTasks: Set<string>
  handleTaskClick: (taskId: string, event: React.MouseEvent | React.KeyboardEvent) => void
  clearSelection: () => void
  onNavigateToPhase?: (phaseId: string) => void
}

export const EnhancedTaskList: React.FC<EnhancedTaskListProps> = ({
  tasks,
  selectedTask,
  selectedTasks,
  handleTaskClick,
  clearSelection,
  onNavigateToPhase
}) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Gruppera uppgifterna efter fas
  const taskGroups = React.useMemo(() => {
    // Filtrera ut faser
    const phases = tasks.filter(task => task.isPhase)
    
    // Gruppera uppgifter efter förälder
    const groupedTasks = groupTasksByParent(tasks)
    
    // Skapa en array av faser med deras underuppgifter
    return phases.map(phase => ({
      phase,
      childTasks: groupedTasks[phase.id] || []
    }))
  }, [tasks])
  
  // Sätt alla faser som expanderade från början
  useEffect(() => {
    const phaseIds = taskGroups.map(group => group.phase.id)
    setExpandedPhases(new Set(phaseIds))
  }, [taskGroups])
  
  const handleToggleExpand = useCallback((phaseId: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId)
      } else {
        newSet.add(phaseId)
      }
      return newSet
    })
  }, [])
  
  // Om det inte finns några uppgifter att visa
  if (tasks.length === 0) {
    return (
      <div className="w-1/3 border-r p-4 text-sm text-muted-foreground">
        Inga uppgifter att visa.
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="w-1/3 border-r flex flex-col overflow-auto"
      onClick={() => clearSelection()}
    >
      <div className="p-2 font-semibold border-b sticky top-0 bg-background z-10">Uppgifter</div>
      
      <div className="flex-grow overflow-auto">
        {taskGroups.map(({ phase, childTasks }) => (
          <TaskGroup
            key={phase.id}
            phase={phase}
            childTasks={childTasks}
            isSelected={selectedTask === phase.id || selectedTasks.has(phase.id)}
            onSelect={handleTaskClick}
            onToggleExpand={handleToggleExpand}
            onNavigateToPhase={onNavigateToPhase}
          />
        ))}
      </div>
    </div>
  )
}

export default EnhancedTaskList 