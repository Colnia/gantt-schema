"use client"

import React, { createContext, useState, useContext, useMemo, useCallback, ReactNode, Dispatch, SetStateAction } from "react"

interface SelectionContextProps {
  selectedTask: string | null
  setSelectedTask: Dispatch<SetStateAction<string | null>>
  selectedTasks: Set<string>
  setSelectedTasks: Dispatch<SetStateAction<Set<string>>>
  isMultiSelecting: boolean
  setIsMultiSelecting: Dispatch<SetStateAction<boolean>>
  handleTaskClick: (taskId: string, event: React.MouseEvent | React.KeyboardEvent) => void // Bekvämlighetsfunktion
  clearSelection: () => void
}

const SelectionContext = createContext<SelectionContextProps | undefined>(undefined)

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isMultiSelecting, setIsMultiSelecting] = useState<boolean>(false) // Kan styras av t.ex. Ctrl/Cmd-klick

  const handleTaskClick = useCallback((taskId: string, event: React.MouseEvent | React.KeyboardEvent) => {
    const multiSelectKeyPressed = 'metaKey' in event && (event.metaKey || event.ctrlKey)
    
    if (multiSelectKeyPressed) {
      setIsMultiSelecting(true)
      setSelectedTasks((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(taskId)) {
          newSet.delete(taskId)
        } else {
          newSet.add(taskId)
        }
        return newSet
      })
      setSelectedTask(null) // Avmarkera enskild uppgift vid multi-select
    } else {
      setIsMultiSelecting(false)
      setSelectedTasks(new Set()) // Rensa multi-select
      setSelectedTask(taskId) // Markera enskild uppgift
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTask(null)
    setSelectedTasks(new Set())
    setIsMultiSelecting(false)
  }, [])

  const value = useMemo(
    () => ({
      selectedTask,
      setSelectedTask,
      selectedTasks,
      setSelectedTasks,
      isMultiSelecting,
      setIsMultiSelecting,
      handleTaskClick,
      clearSelection,
    }),
    [selectedTask, selectedTasks, isMultiSelecting, handleTaskClick, clearSelection]
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export const useSelection = () => {
  const context = useContext(SelectionContext)
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider")
  }
  return context
} 