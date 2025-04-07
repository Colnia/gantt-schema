/// <reference types="react" />

"use client"

import React, { useMemo, useState } from "react"
import { TreeView, TreeItem } from "@/components/ui/tree-view"
import { Phase, Task } from "@/lib/types"
import { getActivityIcon, PhaseIconClosed, PhaseIconOpen, TaskIcon } from "@/components/ui/activity-icons"
import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/utils/task-utils"
import { ChevronDown, ChevronRight } from "lucide-react"

interface GanttTaskTreeProps {
  displayedItems: Task[];
  selectedItemId: string | null
  onSelectItem: (id: string, type: "phase" | "task") => void
  expandedPhases: Set<string>
  togglePhase: (phaseId: string) => void
  handleTaskContextMenu: (taskId: string, event: React.MouseEvent) => void
  rowHeight?: number
}

export default function GanttTaskTree({
  displayedItems,
  selectedItemId,
  onSelectItem,
  expandedPhases,
  togglePhase,
  handleTaskContextMenu,
  rowHeight = 50
}: GanttTaskTreeProps) {
  return (
    <div className="w-full overflow-hidden h-full">
      {displayedItems.map((item, index) => {
        if (item.isPhase) {
          const isExpanded = expandedPhases.has(item.id);
          return (
            <div 
              key={item.id} 
              style={{
                height: `${rowHeight}px`,
                marginBottom: "0px", // Remove margin that could cause misalignment
                position: "relative"
              }}
            >
              <div 
                className={`flex items-center justify-between w-full px-2 bg-muted/30 border-l-4 cursor-pointer ${
                  selectedItemId === item.id ? 'bg-muted' : ''
                }`} 
                style={{ 
                  borderLeftColor: item.color || '#4169E1',
                  height: `${rowHeight}px`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0
                }}
                onClick={() => onSelectItem(item.id, "phase")}
                onContextMenu={(e) => handleTaskContextMenu(item.id, e)}
              >
                <div className="flex items-center flex-1">
                  <button 
                    className="mr-2 hover:bg-muted-foreground/10 rounded p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhase(item.id);
                    }}
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4 text-primary" /> : 
                      <ChevronRight className="h-4 w-4 text-primary" />
                    }
                  </button>
                  <span className="font-medium truncate text-base">{item.name}</span>
                </div>
                {(item.status || item.progress !== undefined) && (
                  <span className={`min-w-[52px] text-center mr-6 px-2 py-1 text-xs font-medium rounded-full ${
                    (item.progress || 0) > 0 
                      ? (item.progress || 0) >= 100 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {Math.round(item.progress || 0)}%
                  </span>
                )}
              </div>
            </div>
          );
        } else {
          const indentClass = item.phaseId ? "ml-6 pl-2 border-l-2" : "";
          const borderStyle = item.phaseId ? { borderLeftColor: 'rgba(100, 116, 139, 0.2)' } : {};
          
          return (
            <div 
              key={item.id} 
              className={`flex items-center justify-between w-full cursor-pointer hover:bg-muted/30 px-2 ${indentClass} ${
                selectedItemId === item.id ? 'bg-muted/50' : ''
              }`}
              style={{
                ...borderStyle,
                height: `${rowHeight}px`,
                position: "relative",
                zIndex: 1 // Ensure all tasks have a reasonable z-index
              }}
              onClick={() => onSelectItem(item.id, "task")}
              onContextMenu={(e) => handleTaskContextMenu(item.id, e)}
            >
              <div className="flex items-center">
                {getActivityIcon(item.activityType || (item.isMilestone ? "milestone" : "task"))}
                <span className="ml-2 truncate">{item.name}</span>
              </div>
              {(item.status || item.progress !== undefined) && (
                <span className={`min-w-[52px] text-center mr-6 px-2 py-1 text-xs font-medium rounded-full ${
                  (item.progress || 0) > 0 
                    ? (item.progress || 0) >= 100 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {Math.round(item.progress || 0)}%
                </span>
              )}
            </div>
          );
        }
      })}
    </div>
  );
} 