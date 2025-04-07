"use client"

import React, { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronDown } from "lucide-react"

// Kontext för att hantera träd-tillstånd
interface TreeContextValue {
  expandedItems: Set<string>
  toggleItem: (id: string) => void
  isExpanded: (id: string) => boolean
}

const TreeContext = createContext<TreeContextValue | undefined>(undefined)

export function useTreeView() {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error("useTreeView must be used within a TreeViewProvider")
  }
  return context
}

interface TreeViewProps {
  children: React.ReactNode
  className?: string
  defaultExpanded?: string[]
}

export function TreeView({ 
  children, 
  className, 
  defaultExpanded = [] 
}: TreeViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  )

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const isExpanded = (id: string) => {
    return expandedItems.has(id)
  }

  return (
    <TreeContext.Provider value={{ expandedItems, toggleItem, isExpanded }}>
      <div className={cn("select-none", className)}>
        {children}
      </div>
    </TreeContext.Provider>
  )
}

interface TreeItemProps {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  isSelectable?: boolean
  isSelected?: boolean
  onSelect?: () => void
}

export function TreeItem({ 
  id, 
  label, 
  icon, 
  children, 
  className,
  isSelectable = true,
  isSelected = false,
  onSelect
}: TreeItemProps) {
  const { toggleItem, isExpanded } = useTreeView()
  const expanded = isExpanded(id)
  const hasChildren = Boolean(children)

  return (
    <div className={cn("", className)}>
      <div 
        className={cn(
          "flex items-center py-1 px-2 rounded-md",
          isSelectable && "cursor-pointer hover:bg-muted/50",
          isSelected && "bg-muted"
        )}
        onClick={() => onSelect && isSelectable && onSelect()}
      >
        {hasChildren && (
          <button
            type="button"
            className="mr-1 h-4 w-4 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              toggleItem(id)
            }}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && (
          <div className="ml-4 mr-1"></div>
        )}
        {icon && (
          <span className="mr-2">{icon}</span>
        )}
        <span className="truncate">{label}</span>
      </div>
      {hasChildren && expanded && (
        <div className="ml-6 border-l pl-2 border-border/50">
          {children}
        </div>
      )}
    </div>
  )
} 