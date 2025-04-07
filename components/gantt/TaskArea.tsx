"use client";

import React from 'react';
import { TaskBar } from './TaskBar';
import { Milestone } from './Milestone';
import { Task, Milestone as MilestoneType, Project } from '@/lib/types';
import { ROW_HEIGHT } from '@/lib/utils/dependency-utils';
import { ensureDate, formatDate } from '@/lib/utils/date-utils';

interface TaskAreaProps {
  displayedItems: Task[]; // Includes phases cast as Task
  activeProject: Project | null;
  showMilestones: boolean;
  dates: Date[];
  dayWidth: number;
  getTaskPosition: (task: Task) => { left: number; width: number };
  getMilestonePosition: (milestone: MilestoneType) => { left: number };
  selectedTask: string | null;
  selectedTasks: Set<string>;
  editingTask: string | null;
  handleTaskSelection: (taskId: string, e?: React.MouseEvent | React.KeyboardEvent) => void;
  handleTaskContextMenu: (taskId: string, e: React.MouseEvent) => void;
  handleStartInlineEdit: (taskId: string) => void;
  handleFinishInlineEdit: () => void;
  handleSaveInlineEditInternal: (taskId: string, field: keyof Task, value: any) => void;
  handleTaskDragStart: (taskId: string, e: React.DragEvent<HTMLDivElement>) => void;
  handleTaskResizeStart: (taskId: string, edge: "start" | "end", e: React.MouseEvent) => void;
  handleDragEnd: () => void;
}

export const TaskArea: React.FC<TaskAreaProps> = ({
  displayedItems,
  activeProject,
  showMilestones,
  dates,
  dayWidth,
  getTaskPosition,
  getMilestonePosition,
  selectedTask,
  selectedTasks,
  editingTask,
  handleTaskSelection,
  handleTaskContextMenu,
  handleStartInlineEdit,
  handleFinishInlineEdit,
  handleSaveInlineEditInternal,
  handleTaskDragStart,
  handleTaskResizeStart,
  handleDragEnd,
}) => {
  if (!activeProject) return null; // Or some loading/empty state

  const totalWidth = dates.length * dayWidth;
  const totalHeight = (displayedItems?.length || 0) * ROW_HEIGHT;

  // --- DEBUG LOGGING --- 
  console.log('[TaskArea] Props:', { 
    displayedItemsCount: displayedItems?.length, 
    datesCount: dates?.length, 
    dayWidth, 
    firstDate: dates?.[0], 
    lastDate: dates?.[dates?.length - 1] 
  });
  // --- END DEBUG LOGGING ---

  // Wrapper function to pass to TaskBar
  const getMilestonePosForTaskBar = (task: Task): { left: number } => {
    // Check if the task is a milestone or delivery based on its properties
    if (task.isMilestone || task.activityType === 'milestone' || task.activityType === 'delivery') {
      // Construct a MilestoneType object from the task data
      const taskStartDate = ensureDate(task.startDate); // Ensure it's a Date object first
      if (!taskStartDate) return { left: 0 }; // Cannot create milestone without valid date
      
      const milestoneData: MilestoneType = {
        id: task.id,
        name: task.name,
        date: formatDate(taskStartDate), // Format the date to string
      };
      
      // Get position from the main getMilestonePosition function
      return getMilestonePosition(milestoneData);
    } else {
      return { left: 0 }; // Not a milestone or delivery, return default position
    }
  };

  return (
    <div className="relative" style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}>
      {Array.isArray(displayedItems) && displayedItems.map((item, index) => {
        const task = item;
        const topPosition = index * ROW_HEIGHT;
        const position = getTaskPosition(task);
        
        // --- DEBUG LOGGING --- 
        if (index === 0 || index === displayedItems.length - 1) { // Log first and last task position
          console.log(`[TaskArea] Task ${task.id} (${task.name}) Pos:`, position);
        }
        // --- END DEBUG LOGGING ---
        
        return (
          <TaskBar
            key={`taskbar-${task.id}`}
            task={task}
            index={index}
            offsetTop={topPosition}
            getTaskPosition={() => position}
            getMilestonePosition={getMilestonePosForTaskBar}
            dayWidth={dayWidth}
            isSelected={selectedTask === task.id || selectedTasks.has(task.id)}
            isBeingEdited={editingTask === task.id}
            handleTaskClick={handleTaskSelection}
            handleTaskContextMenu={handleTaskContextMenu}
            handleStartInlineEdit={handleStartInlineEdit}
            handleFinishInlineEdit={handleFinishInlineEdit}
            handleSaveInlineEditInternal={handleSaveInlineEditInternal}
            handleTaskDragStart={handleTaskDragStart}
            handleTaskResizeStart={handleTaskResizeStart}
            handleDragEnd={handleDragEnd}
          />
        );
      })}
      {showMilestones && activeProject && Array.isArray(activeProject.milestones) && activeProject.milestones.map((milestone: MilestoneType) => {
        const position = getMilestonePosition(milestone);
        // --- DEBUG LOGGING ---
        console.log(`[TaskArea] Milestone ${milestone.id} Pos:`, position);
        // --- END DEBUG LOGGING ---
        if (position.left >= 0 && position.left <= totalWidth) { 
          return (
            <Milestone key={milestone.id} milestone={milestone} left={position.left} />
          );
        }
        return null;
      })}
    </div>
  );
}; 