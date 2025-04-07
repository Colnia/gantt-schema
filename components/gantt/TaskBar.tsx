/// <reference types="react" />

"use client"

import React from "react"
import { Task, TaskStatus } from "@/lib/types"
import { getStatusColor } from "@/lib/utils/task-utils"
import { ROW_HEIGHT } from "@/lib/utils/dependency-utils"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useInteraction } from "@/lib/context/InteractionContext"
import { cn } from "@/lib/utils"
import { Package, FileCheck, Milestone, Truck, Check } from "lucide-react"
import { getActivityIcon } from "@/components/ui/activity-icons"

interface TaskBarProps {
  task: Task;
  index: number;
  offsetTop: number;
  getTaskPosition: (task: Task) => { left: number; width: number };
  isSelected: boolean;
  isBeingEdited: boolean;
  // Event handlers (från contexts)
  handleTaskClick: (taskId: string, event: React.MouseEvent) => void;
  handleTaskContextMenu: (taskId: string, event: React.MouseEvent) => void;
  handleStartInlineEdit: (taskId: string) => void;
  handleFinishInlineEdit: () => void;
  handleSaveInlineEditInternal: (taskId: string, field: keyof Task, value: any) => void;
  handleTaskDragStart: (taskId: string, e: React.DragEvent<HTMLDivElement>) => void;
  handleTaskResizeStart: (taskId: string, edge: "start" | "end", e: React.MouseEvent) => void;
  getMilestonePosition?: (milestone: Task) => { left: number };
  dayWidth: number;
  handleDragEnd: () => void;
}

// Definiera TaskBar-logiken som en funktionell komponent
export const TaskBar: React.FC<TaskBarProps> = ({ 
  task, 
  index, 
  offsetTop,
  getTaskPosition, 
  isSelected, 
  isBeingEdited, 
  handleTaskClick, 
  handleTaskContextMenu,
  handleStartInlineEdit,
  handleFinishInlineEdit,
  handleSaveInlineEditInternal,
  handleTaskDragStart,
  handleTaskResizeStart,
  getMilestonePosition,
  dayWidth,
  handleDragEnd,
}: TaskBarProps) => {
  const { left, width } = getTaskPosition(task);
  const { draggingTask, resizingTask } = useInteraction();
  
  // Add debug logging for the first task
  if (index === 0) {
    console.log(`First TaskBar positioning: id=${task.id}, left=${left}, width=${width}, offsetTop=${offsetTop}`);
  }
  
  // Undvik att rendera om width är 0 eller negativ (kan hända vid felaktiga datum)
  if (width <= 0) {
      // console.warn(`Task ${task.id} (${task.name}) has invalid width: ${width}`); // Keep commented
      return null;
  }
  
  // Statusindikatorer - progresstext och statusfärg
  const progress = task.progress || 0;
  const isCompleted = progress >= 100;
  const statusColor = getStatusColor(task.status);
  
  // Beräkna opacity baserat på om uppgiften dras eller storleksändras
  const isDragging = draggingTask === task.id;
  const isResizing = resizingTask?.id === task.id;
  const opacity = isDragging || isResizing ? 0.6 : 1;
  
  // Om detta är en fas ska vi göra stapeln högre och mer distinkt
  const isPhase = task?.isPhase;
  const isMilestone = task?.isMilestone || task?.activityType === "milestone";
  const isDelivery = task?.activityType === "delivery";
  const isDecision = task?.activityType === "decision";
  const barHeight = isPhase ? 50 : isMilestone || isDelivery ? 18 : 36; // Adjust height for icon only
  const barTop = 0; 

  // --- Calculate position for milestones/deliveries ---
  let itemLeft = left; // Default to task position
  let itemWidth = width;
  const iconWidth = 20; // Approximate width of the icon for centering

  if ((isMilestone || isDelivery) && getMilestonePosition) {
      const milestonePos = getMilestonePosition(task); // Use the specific position function
      itemLeft = milestonePos.left + (dayWidth / 2) - (iconWidth / 2); // Center the icon
      itemWidth = iconWidth; // Set width to icon width
      console.log(`Milestone/Delivery ${task.id} Pos:`, { milestoneLeft: milestonePos.left, adjustedLeft: itemLeft, dayWidth });
  }
  // --- End position calculation ---

  // Calculate position for the text label
  const labelLeft = itemLeft + itemWidth + 8; // Adjust based on potentially centered icon

  return (
    <>
      {/* Render TASK/PHASE BAR */}
      {!isMilestone && !isDelivery && (
      <div
        className={cn(
              "absolute flex rounded cursor-pointer transition-colors",
              "px-0", 
          isSelected && !isBeingEdited && "ring-2 ring-primary shadow-lg",
          isBeingEdited && "ring-2 ring-primary-400",
          (isMilestone || isDelivery) && "bg-transparent" // Milestones & deliveries har transparent bakgrund
        )}
        style={{
              height: `${barHeight}px`,
          top: `${offsetTop + barTop}px`,
              left: `${itemLeft}px`, // Use calculated itemLeft
              width: `${itemWidth}px`, // Use calculated itemWidth
          backgroundColor: isPhase 
            ? (task.color || "#4169E1") 
            : isMilestone || isDelivery
              ? "transparent" 
              : (task.color || getStatusColor(task.status as TaskStatus)),
          opacity: draggingTask === task.id || resizingTask?.id === task.id ? 0.5 : 1,
              zIndex: isPhase ? 10 : 5 
        }}
        onClick={(e) => handleTaskClick(task.id, e)}
        onContextMenu={(e) => handleTaskContextMenu(task.id, e)}
        onDoubleClick={() => handleStartInlineEdit(task.id)}
        draggable={!isBeingEdited}
        onDragStart={(e) => handleTaskDragStart(task.id, e)}
            onDragEnd={handleDragEnd}
        data-task-id={task.id}
      >
        {/* Progress Bar Overlay */}
        {!isMilestone && !isDelivery && (
          <div 
            className={cn(
              "absolute left-0 top-0 h-full rounded overflow-hidden",
              isCompleted ? "bg-emerald-500/40" : "bg-primary/30"
            )}
            style={{ width: `${progress}%` }} 
          />
        )}

        {/* Completed checkmark */}
        {isCompleted && !isMilestone && !isDelivery && (
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
            <Check className="h-4 w-4 text-emerald-700" />
          </div>
        )}

        {/* För milstolpar, visa ikon direkt i stapeln */}
        {isMilestone && (
          <Milestone className={cn(
            "h-6 w-6 text-gray-700",
            isCompleted ? "fill-emerald-500" : "fill-gray-700"
          )} />
        )}

        {/* För leveranser, visa Truck-ikon direkt i stapeln */}
        {isDelivery && (
          <Truck className={cn(
            "h-6 w-6 text-amber-500",
            isCompleted ? "fill-emerald-500" : "fill-amber-500"
          )} />
        )}

            {/* Resize handles */}
      {!isBeingEdited && !isMilestone && !isDelivery && (
        <>
                {/* {(console.log(`[TaskBar] Rendering resize handles for ${task.id}. OffsetTop: ${offsetTop}, BarHeight: ${barHeight}`), null)} */}
          <div 
                  // Restore original styles, set top to 0 relative to parent
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-l-md bg-black/10 hover:bg-black/30 transition-colors duration-150"
            style={{
              height: `${barHeight}px`,
                    zIndex: 11 
            }}
            onMouseDown={(e) => { 
                    console.log(`[TaskBar] Start resize handle clicked for task ${task.id}`); 
              e.stopPropagation();
                    e.preventDefault(); 
              handleTaskResizeStart(task.id, 'start', e); 
            }}
            title="Ändra startdatum"
          ></div>
          <div 
                  // Restore original styles, set top to 0 relative to parent
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r-md bg-black/10 hover:bg-black/30 transition-colors duration-150"
            style={{
              height: `${barHeight}px`,
                    zIndex: 11 
            }}
            onMouseDown={(e) => { 
                    console.log(`[TaskBar] End resize handle clicked for task ${task.id}`); 
              e.stopPropagation();
                    e.preventDefault(); 
              handleTaskResizeStart(task.id, 'end', e); 
            }}
            title="Ändra slutdatum"
          ></div>
        </>
            )}
          </div>
      )}

      {/* Render MILESTONE/DELIVERY ICON directly */}
      {(isMilestone || isDelivery) && (
          <div 
            className="absolute flex items-center justify-center" // Simple div for positioning
            style={{
                top: `${offsetTop + barTop}px`, // Align vertically like other bars
                left: `${itemLeft}px`, // Use centered position
                width: `${itemWidth}px`, // Use icon width
                height: `${barHeight}px`, // Use icon height
                zIndex: 6 // Ensure icons are clickable
            }}
            onClick={(e) => handleTaskClick(task.id, e)}
            onContextMenu={(e) => handleTaskContextMenu(task.id, e)}
            draggable={!isBeingEdited} // Allow dragging maybe?
            onDragStart={(e) => handleTaskDragStart(task.id, e)}
            onDragEnd={handleDragEnd}
            data-task-id={task.id}
          >
            {isMilestone && (
              <Milestone className={cn(
                "h-5 w-5", // Fixed size
                isCompleted ? "fill-emerald-500 text-emerald-700" : "fill-gray-500 text-gray-700"
              )} />
            )}
            {isDelivery && (
              <Truck className={cn(
                "h-5 w-5", // Fixed size
                 isCompleted ? "fill-emerald-500 text-emerald-700" : "fill-amber-600 text-amber-700"
              )} />
            )}
          </div>
      )}

      {/* Text Label (Common logic, adjusted position) */}
      {!isBeingEdited && (
          <span 
            className={cn(
              "absolute text-xs whitespace-nowrap truncate py-1 pointer-events-none", // Common styles
              isCompleted ? "text-emerald-700 font-medium" : "text-foreground/80",
              (isMilestone || isDelivery) && "pl-1" // Add padding if it's an icon label
            )}
            style={{
                // Adjust vertical alignment based on type
                top: `${offsetTop + (isPhase ? 16 : (isMilestone || isDelivery) ? 1 : 10)}px`, 
                left: `${labelLeft}px`, // Use adjusted labelLeft
                maxWidth: '200px', 
                zIndex: 4  
            }}
          >
            {task.name} 
            {!(isMilestone || isDelivery) && progress > 0 && `(${progress}%)`}
            {(isMilestone || isDelivery) && isCompleted && " ✓"} 
          </span>
      )}
    </>
  )
}

export default TaskBar; 