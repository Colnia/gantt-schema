"use client"

import React, { createContext, useState, useContext, useMemo, useCallback, ReactNode, Dispatch, SetStateAction } from "react"

interface ResizingTaskState {
  id: string
  edge: "start" | "end"
}

interface InteractionContextProps {
  draggingTask: string | null
  setDraggingTask: Dispatch<SetStateAction<string | null>>
  resizingTask: ResizingTaskState | null
  setResizingTask: Dispatch<SetStateAction<ResizingTaskState | null>>
  editingTask: string | null
  setEditingTask: Dispatch<SetStateAction<string | null>>
  isAddingTask: boolean
  setIsAddingTask: Dispatch<SetStateAction<boolean>>
  isAddingProject: boolean
  setIsAddingProject: Dispatch<SetStateAction<boolean>>
}

const InteractionContext = createContext<InteractionContextProps | undefined>(undefined)

export const InteractionProvider = ({ children }: { children: ReactNode }) => {
  const [draggingTask, setDraggingTask] = useState<string | null>(null)
  const [resizingTask, setResizingTask] = useState<ResizingTaskState | null>(null)
  const [editingTask, setEditingTask] = useState<string | null>(null) // För inline edit
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false)
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false)

  const value = useMemo(
    () => ({
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
    }),
    [draggingTask, resizingTask, editingTask, isAddingTask, isAddingProject]
  )

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>
}

export const useInteraction = () => {
  const context = useContext(InteractionContext)
  if (context === undefined) {
    throw new Error("useInteraction must be used within an InteractionProvider")
  }
  return context
} 