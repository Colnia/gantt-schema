"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface Task {
  id: string
  name: string
  isPhase?: boolean
  color?: string
  parentId?: string
}

interface VirtualizedTaskListProps {
  tasks: Task[]
  selectedTask: string | null
  expandedGroups: Set<string>
  onSelectTask: (taskId: string) => void
  onTogglePhase: (phaseId: string) => void
  onNavigateToPhase?: (phaseId: string) => void
}

export default function VirtualizedTaskList({
  tasks,
  selectedTask,
  expandedGroups,
  onSelectTask,
  onTogglePhase,
  onNavigateToPhase,
}: VirtualizedTaskListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  const ITEM_HEIGHT = 40 // Höjd för varje uppgiftsrad i pixlar
  const BUFFER_SIZE = 5 // Antal extra rader att rendera ovanför/under synligt område

  // Beräkna vilka uppgifter som ska visas baserat på scrollposition
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container

      const newStartIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
      const newEndIndex = Math.min(tasks.length - 1, Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) + BUFFER_SIZE)

      setStartIndex(newStartIndex)
      setEndIndex(newEndIndex)
    }

    handleScroll() // Initial beräkning
    container.addEventListener("scroll", handleScroll)

    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [tasks.length])

  // Uppdatera synliga uppgifter när start/slutindex ändras
  useEffect(() => {
    setVisibleTasks(tasks.slice(startIndex, endIndex + 1))
  }, [tasks, startIndex, endIndex])

  return (
    <div ref={containerRef} className="overflow-y-auto bg-gray-50 w-full" style={{ height: "100%" }}>
      {/* Spacer ovanför för att simulera position i listan */}
      <div style={{ height: `${startIndex * ITEM_HEIGHT}px` }} />

      {/* Synliga uppgifter */}
      {visibleTasks.map((task) => (
        <div key={task.id} className="border-b">
          <div
            className={`p-2 flex items-center hover:bg-gray-100 ${selectedTask === task.id ? "bg-blue-50" : ""}`}
            style={{ height: `${ITEM_HEIGHT}px` }}
            onClick={() => onSelectTask(task.id)}
          >
            {task.isPhase && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePhase(task.id)
                }}
                className="mr-1 w-5 h-5 flex items-center justify-center"
              >
                {expandedGroups.has(task.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: task.color || "#0891b2" }}></div>
            <span className={`text-sm truncate ${task.isPhase ? "font-semibold" : ""}`} title={task.name}>
              {task.name}
            </span>
            {task.isPhase && onNavigateToPhase && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigateToPhase(task.id)
                }}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                Visa
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Spacer nedanför för att simulera resten av listan */}
      <div style={{ height: `${(tasks.length - endIndex - 1) * ITEM_HEIGHT}px` }} />
    </div>
  )
}

