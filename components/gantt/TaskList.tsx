"use client"

import React, { useState, useRef, RefObject, useCallback, useEffect } from "react"
import { Task } from "@/lib/types"
import { FixedSizeList as List } from 'react-window';
import { ROW_HEIGHT } from "@/lib/utils/dependency-utils";

interface TaskListProps {
  tasks: Task[];
  selectedTask: string | null;
  selectedTasks: Set<string>;
  handleTaskClick: (taskId: string, event: React.MouseEvent | React.KeyboardEvent) => void;
  clearSelection: () => void;
}

// Definiera Row utanför huvudkomponenten för att kunna använda memo
const RowComponent = ({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
  const { tasks, selectedTask, selectedTasks, handleTaskClick, focusedIndex } = data;
  const task = tasks[index];
  const isFocused = index === focusedIndex;

  if (!task) return null;

  return (
    <div
      style={style}
      key={task.id} // key behövs här för Reacts diffing, även om List hanterar det
      className={`flex items-center p-2 border-b hover:bg-muted text-sm cursor-pointer ${selectedTask === task.id || selectedTasks.has(task.id) ? 'bg-muted font-medium' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        handleTaskClick(task.id, e);
      }}
    >
      {task.name}
    </div>
  );
};

// Wrappa RowComponent med React.memo
const Row = React.memo(RowComponent);

export const TaskList = ({ 
  tasks, 
  selectedTask, 
  selectedTasks, 
  handleTaskClick, 
  clearSelection, 
}: TaskListProps) => {
  
  const itemData = {
    tasks,
    selectedTask,
    selectedTasks,
    handleTaskClick,
  };

  return (
    <div 
      className="w-1/3 border-r flex flex-col"
      onClick={clearSelection}
    >
       <div className="p-2 font-semibold border-b sticky top-0 bg-background z-10 flex-shrink-0">Uppgifter</div>
       
       <div className="flex-grow overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Inga uppgifter att visa.</div>
          ) : (
            <List
              height={600}
              itemCount={tasks.length}
              itemSize={ROW_HEIGHT}
              width="100%"
              itemData={itemData}
              className="overflow-y-auto"
            >
              {Row}
            </List>
          )}
      </div>
    </div>
  )
}

export default TaskList; 