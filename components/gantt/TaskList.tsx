"use client"

import React, { useState, useRef, RefObject, useCallback, useEffect } from "react"
import { Task } from "@/lib/types"
import { FixedSizeList as List } from 'react-window'; 
import { ROW_HEIGHT } from "@/lib/utils/dependency-utils";
import { ChevronRight, ChevronDown } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  selectedTask: string | null;
  selectedTasks: Set<string>;
  handleTaskClick: (taskId: string, event: React.MouseEvent | React.KeyboardEvent) => void;
  clearSelection: () => void;
}

// Helper function to determine task depth (for indentation)
const getTaskDepth = (task: Task, allTasks: Task[]): number => {
  let depth = 0;
  let currentTask = task;
  
  while (currentTask.parentId) {
    depth++;
    const parent = allTasks.find(t => t.id === currentTask.parentId);
    if (!parent) break;
    currentTask = parent;
  }
  
  return depth;
};

// Helper function to filter tasks based on collapsed phases
const filterCollapsedTasks = (tasks: Task[], collapsedPhases: Set<string>): Task[] => {
  if (collapsedPhases.size === 0) return tasks;
  
  const result: Task[] = [];
  const isHidden = new Set<string>();
  
  // First identify all tasks that should be hidden because their parent is collapsed
  tasks.forEach(task => {
    let currentId = task.parentId;
    while (currentId) {
      if (collapsedPhases.has(currentId)) {
        isHidden.add(task.id);
        break;
      }
      const parent = tasks.find(t => t.id === currentId);
      currentId = parent?.parentId;
    }
  });
  
  // Then filter out hidden tasks
  return tasks.filter(task => !isHidden.has(task.id));
};

const RowComponent = ({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
  const { tasks, selectedTask, selectedTasks, handleTaskClick, focusedIndex, togglePhaseCollapse, collapsedPhases, allTasks } = data;
  const task = tasks[index];
  const isFocused = index === focusedIndex;
  const isPhase = task?.isPhase || false;
  const isCollapsed = isPhase && collapsedPhases.has(task.id);
  const depth = getTaskDepth(task, allTasks);
  const indentationPadding = depth * 16; // 16px indentation per level
  const progress = task.progress || 0;

  if (!task) return null;

  return (
    <div
      style={{ 
        ...style,
        paddingLeft: isPhase ? 8 : 8 + indentationPadding, // Less indentation for phases
      }}
      key={task.id} 
      role="button"
      tabIndex={-1}
      aria-selected={selectedTask === task.id || selectedTasks.has(task.id)}
      className={`flex items-center p-2 border-b hover:bg-muted text-sm cursor-pointer 
                 ${selectedTask === task.id || selectedTasks.has(task.id) ? 'bg-muted font-medium' : ''}
                 ${isFocused ? 'outline outline-2 outline-offset-[-2px] outline-primary' : ''}
                 `}
      onClick={(e) => {
        e.stopPropagation();
        handleTaskClick(task.id, e);
      }}
    >
      {isPhase && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent task selection when clicking the chevron
            togglePhaseCollapse(task.id);
          }}
          className="mr-2 hover:bg-muted-foreground/10 rounded p-0.5"
          aria-label={isCollapsed ? "Expand phase" : "Collapse phase"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
      <div className={`${isPhase ? 'font-medium' : ''} flex-1`}>
        {task.name}
      </div>
      <div className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium min-w-[48px] text-center ${
        progress > 0 
          ? progress >= 100 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-500'
      }`}>
        {progress}%
      </div>
    </div>
  );
};

const Row = React.memo(RowComponent);

export const TaskList = ({ 
  tasks, 
  selectedTask, 
  selectedTasks, 
  handleTaskClick, 
  clearSelection, 
}: TaskListProps) => {
  
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [listHeight, setListHeight] = useState(600); // Default höjd
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Toggle collapse state for a phase
  const togglePhaseCollapse = useCallback((phaseId: string) => {
    setCollapsedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  }, []);

  // Filter tasks based on collapsed state
  const visibleTasks = filterCollapsedTasks(tasks, collapsedPhases);

  // Scrolla till valt objekt när det ändras externt
  useEffect(() => {
    if (selectedTask) {
      const index = visibleTasks.findIndex(t => t.id === selectedTask);
      if (index !== -1) {
        setFocusedIndex(index);
        if (listRef.current) {
           listRef.current.scrollToItem(index, 'smart');
        }
      } 
    } else {
      setFocusedIndex(null);
    }
  }, [selectedTask, visibleTasks]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (visibleTasks.length === 0) return;

    let newIndex = focusedIndex ?? -1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = Math.min(visibleTasks.length - 1, newIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = Math.max(0, newIndex - 1);
    } else if (event.key === 'Enter' && newIndex !== -1 && newIndex < visibleTasks.length) {
       event.preventDefault();
       handleTaskClick(visibleTasks[newIndex].id, event);
       const ganttElement = containerRef.current?.nextElementSibling as HTMLElement;
       ganttElement?.focus(); 
    } else if (event.key === 'Space' && newIndex !== -1 && newIndex < visibleTasks.length) {
       // Space key to expand/collapse phases
       event.preventDefault();
       const task = visibleTasks[newIndex];
       if (task.isPhase) {
         togglePhaseCollapse(task.id);
       }
    } else {
       return;
    }

    if (newIndex !== -1) {
      setFocusedIndex(newIndex);
      if (listRef.current) {
         listRef.current.scrollToItem(newIndex, 'smart');
      }
    }

  }, [visibleTasks, focusedIndex, handleTaskClick, togglePhaseCollapse]);

  const handleFocus = useCallback(() => {
    if (focusedIndex === null && visibleTasks.length > 0) {
      setFocusedIndex(0);
      listRef.current?.scrollToItem(0, 'smart');
    }
    else if (selectedTask) {
       const index = visibleTasks.findIndex(t => t.id === selectedTask);
       if (index !== -1 && index !== focusedIndex) {
          setFocusedIndex(index);
          listRef.current?.scrollToItem(index, 'smart');
       }
    }
  }, [focusedIndex, visibleTasks.length, selectedTask, visibleTasks]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
     if (!event.currentTarget.contains(event.relatedTarget as Node)) {
       setFocusedIndex(null);
     }
  }, []);

  // Uppdatera listhöjden när komponenten monteras eller fönstret ändrar storlek
  useEffect(() => {
    const updateListHeight = () => {
      if (listContainerRef.current) {
        const containerHeight = listContainerRef.current.clientHeight;
        setListHeight(containerHeight);
      }
    };
    
    // Uppdatera höjden initialt
    updateListHeight();
    
    // Lägg till event listener för fönsterändring
    window.addEventListener('resize', updateListHeight);
    
    return () => {
      window.removeEventListener('resize', updateListHeight);
    };
  }, []);

  const itemData = {
    tasks: visibleTasks,
    allTasks: tasks, // Pass all tasks for depth calculation
    selectedTask,
    selectedTasks,
    handleTaskClick,
    focusedIndex,
    togglePhaseCollapse,
    collapsedPhases,
  };

  return (
    <div 
      ref={containerRef}
      className="w-1/3 border-r flex flex-col outline-none"
      onClick={(e) => {
         containerRef.current?.focus(); 
         clearSelection(); 
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
       <div className="p-2 font-semibold border-b sticky top-0 bg-background z-10 flex-shrink-0">Uppgifter</div>
       
       <div 
         ref={listContainerRef} 
         className="flex-grow overflow-hidden"
       > 
          {visibleTasks.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Inga uppgifter att visa.</div>
          ) : (
            <List
              ref={listRef}
              height={listHeight}
              itemCount={visibleTasks.length}
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
