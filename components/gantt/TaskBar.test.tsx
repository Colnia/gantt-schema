import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskBar } from './TaskBar'; // Importera komponenten
import { Task } from '@/lib/types'; // Importera Task typen

// Mock data och funktioner
const mockTask: Task = {
  id: 'task-1',
  name: 'Min Testuppgift',
  startDate: '2024-04-01',
  endDate: '2024-04-05',
  progress: 50,
  status: 'in-progress',
  priority: 'medium',
  resources: [],
  dependencies: [],
};

const mockGetTaskPosition = vi.fn((task: Task) => ({ left: 100, width: 200 }));
const mockHandleTaskClick = vi.fn();
const mockHandleTaskContextMenu = vi.fn();
const mockHandleStartInlineEdit = vi.fn();
const mockHandleFinishInlineEdit = vi.fn();
const mockHandleSaveInlineEditInternal = vi.fn();
const mockHandleTaskDragStart = vi.fn();
const mockHandleTaskResizeStart = vi.fn();

describe('TaskBar Component', () => {

  // Grundläggande renderingstest
  it('should render the task name', () => {
    render(
      <TaskBar
        task={mockTask}
        index={0}
        getTaskPosition={mockGetTaskPosition}
        isSelected={false}
        isBeingEdited={false}
        handleTaskClick={mockHandleTaskClick}
        handleTaskContextMenu={mockHandleTaskContextMenu}
        handleStartInlineEdit={mockHandleStartInlineEdit}
        handleFinishInlineEdit={mockHandleFinishInlineEdit}
        handleSaveInlineEditInternal={mockHandleSaveInlineEditInternal}
        handleTaskDragStart={mockHandleTaskDragStart}
        handleTaskResizeStart={mockHandleTaskResizeStart}
      />
    );
    // Kontrollera att uppgiftens namn visas i dokumentet
    expect(screen.getByText('Min Testuppgift')).toBeInTheDocument();
  });

  // Test för statusfärg
  it('should apply the correct background class based on status', () => {
    const { container } = render(
        <TaskBar
          task={{ ...mockTask, status: 'completed' }}
          index={0}
          getTaskPosition={mockGetTaskPosition}
          isSelected={false}
          isBeingEdited={false}
          handleTaskClick={mockHandleTaskClick}
          handleTaskContextMenu={mockHandleTaskContextMenu}
          handleStartInlineEdit={mockHandleStartInlineEdit}
          handleFinishInlineEdit={mockHandleFinishInlineEdit}
          handleSaveInlineEditInternal={mockHandleSaveInlineEditInternal}
          handleTaskDragStart={mockHandleTaskDragStart}
          handleTaskResizeStart={mockHandleTaskResizeStart}
        />
    );
    // Hitta det yttre div-elementet (TaskBar själv)
    // Första barnet till containern brukar vara komponenten om inget annat anges
    const taskBarElement = container.firstChild as HTMLElement;
    expect(taskBarElement).toHaveClass('bg-green-500'); // Förväntad klass för 'completed'
  });

  // Test för urval
  it('should apply selection classes when isSelected is true', () => {
    const { container } = render(
        <TaskBar
          task={mockTask}
          index={0}
          getTaskPosition={mockGetTaskPosition}
          isSelected={true} // Sätt till true
          isBeingEdited={false}
          handleTaskClick={mockHandleTaskClick}
          handleTaskContextMenu={mockHandleTaskContextMenu}
          handleStartInlineEdit={mockHandleStartInlineEdit}
          handleFinishInlineEdit={mockHandleFinishInlineEdit}
          handleSaveInlineEditInternal={mockHandleSaveInlineEditInternal}
          handleTaskDragStart={mockHandleTaskDragStart}
          handleTaskResizeStart={mockHandleTaskResizeStart}
        />
    );
    const taskBarElement = container.firstChild as HTMLElement;
    expect(taskBarElement).toHaveClass('ring-2 ring-ring ring-offset-2');
  });

  // Test för redigeringsläge
   it('should render an input field when isBeingEdited is true', () => {
    render(
      <TaskBar
        task={mockTask}
        index={0}
        getTaskPosition={mockGetTaskPosition}
        isSelected={false}
        isBeingEdited={true} // Sätt till true
        handleTaskClick={mockHandleTaskClick}
        handleTaskContextMenu={mockHandleTaskContextMenu}
        handleStartInlineEdit={mockHandleStartInlineEdit}
        handleFinishInlineEdit={mockHandleFinishInlineEdit}
        handleSaveInlineEditInternal={mockHandleSaveInlineEditInternal}
        handleTaskDragStart={mockHandleTaskDragStart}
        handleTaskResizeStart={mockHandleTaskResizeStart}
      />
    );
    // Förvänta att ett input-fält (textbox) finns
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Förvänta att det ursprungliga namnet *inte* visas som en span
    expect(screen.queryByText('Min Testuppgift')).not.toBeInTheDocument();
  });

  // TODO: Lägg till tester för event handlers (klick, dubbelklick, drag, resize etc.)
}); 