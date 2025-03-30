"use client"

import React from "react"
import { Task } from "@/lib/types"
import { getStatusColor } from "@/lib/utils/task-utils"
import { ROW_HEIGHT } from "@/lib/utils/dependency-utils"
import { Input } from "@/components/ui/input"

interface TaskBarProps {
  task: Task;
  index: number;
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
}

// Definiera TaskBar-logiken som en funktionell komponent
const TaskBarComponent: React.FC<TaskBarProps> = ({ 
  task, 
  index, 
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
}) => {
  const { left, width } = getTaskPosition(task);
  const top = index * ROW_HEIGHT;

  // Undvik att rendera om width är 0 eller negativ (kan hända vid felaktiga datum)
  if (width <= 0) {
      console.warn(`Task ${task.id} (${task.name}) has invalid width: ${width}`);
      return null;
  }

  return (
    <div 
        key={task.id} // key behövs egentligen i .map, men bra att ha här med
        className={`absolute h-8 rounded cursor-pointer flex items-center px-2 ${getStatusColor(task.status)} ${isSelected ? 'ring-2 ring-ring ring-offset-2' : ''}`}
        style={{ left: `${left}px`, width: `${width}px`, top: `${top}px` }}
        draggable={!isBeingEdited} // Tillåt inte drag under redigering
        onDragStart={(e) => !isBeingEdited && handleTaskDragStart(task.id, e)}
        onClick={(e) => { 
            if (isBeingEdited) return; // Ignorera klick under redigering
            e.stopPropagation(); 
            handleTaskClick(task.id, e); 
        }}
        onContextMenu={(e) => !isBeingEdited && handleTaskContextMenu(task.id, e)}
        onDoubleClick={() => !isBeingEdited && handleStartInlineEdit(task.id)}
    >
        {isBeingEdited ? (
            <Input 
                defaultValue={task.name} 
                onBlur={(e) => { 
                    handleSaveInlineEditInternal(task.id, 'name', e.target.value);
                    handleFinishInlineEdit();
                }}
                onKeyDown={(e) => { 
                    if (e.key === 'Enter') {
                       e.preventDefault(); // Förhindra formulärskickning om det skulle finnas
                       handleSaveInlineEditInternal(task.id, 'name', (e.target as HTMLInputElement).value);
                       handleFinishInlineEdit(); 
                    }
                    if (e.key === 'Escape') {
                       handleFinishInlineEdit(); // Avbryt redigering
                    }
                }}
                onClick={(e) => e.stopPropagation()} // Förhindra att klick inuti input stänger redigering
                autoFocus
                className="h-full bg-transparent text-white p-0 m-0 border-0 focus:ring-0 shadow-none"
            />
        ) : (
            <span className="text-xs font-medium text-white overflow-hidden whitespace-nowrap text-ellipsis select-none">
                {task.name}
            </span>
        )}
        {!isBeingEdited && (
          <>
            {/* Resize handles */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-l-md bg-black/10 hover:bg-black/30 transition-colors duration-150"
              onMouseDown={(e) => { 
                e.stopPropagation();
                handleTaskResizeStart(task.id, 'start', e); 
              }}
              title="Ändra startdatum"
            ></div>
            <div 
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r-md bg-black/10 hover:bg-black/30 transition-colors duration-150"
              onMouseDown={(e) => { 
                e.stopPropagation();
                handleTaskResizeStart(task.id, 'end', e); 
              }}
              title="Ändra slutdatum"
            ></div>
          </>
        )}
    </div>
  )
}

// Exportera den memoized versionen
export const TaskBar = React.memo(TaskBarComponent);

export default TaskBar; 