import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GanttToolbar } from './GanttToolbar';
import { Project } from '@/lib/types';

// Mock data och funktioner
const mockProject: Partial<Project> = {
    id: 'proj-test',
    name: 'Testprojekt Toolbar',
    startDate: '2024-04-01',
    endDate: '2024-05-01',
};

const mockSetSearchTerm = vi.fn();
const mockHandleTimeScaleChange = vi.fn();
const mockHandleViewModeChange = vi.fn();
const mockSetShowResources = vi.fn();
const mockSetShowDependencies = vi.fn();
const mockSetShowMilestones = vi.fn();
const mockHandleZoomIn = vi.fn();
const mockHandleZoomOut = vi.fn();
const mockSetIsAddingTask = vi.fn();

// Helper-funktion för att rendera komponenten med standard-props
const renderToolbar = (props = {}) => {
  const defaultProps = {
    currentView: 'project' as const,
    project: mockProject as Project,
    searchTerm: '',
    setSearchTerm: mockSetSearchTerm,
    timeScale: 'day' as const,
    handleTimeScaleChange: mockHandleTimeScaleChange,
    handleViewModeChange: mockHandleViewModeChange,
    showResources: false,
    setShowResources: mockSetShowResources,
    showDependencies: false,
    setShowDependencies: mockSetShowDependencies,
    showMilestones: false,
    setShowMilestones: mockSetShowMilestones,
    handleZoomIn: mockHandleZoomIn,
    handleZoomOut: mockHandleZoomOut,
    isAddingTask: false,
    setIsAddingTask: mockSetIsAddingTask,
    ...props, // Tillåt att props skrivs över
  };
  return render(<GanttToolbar {...defaultProps} />);
};

describe('GanttToolbar Component', () => {
  // Rensa mocks före varje test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the search input', () => {
    renderToolbar();
    expect(screen.getByPlaceholderText('Sök uppgifter...')).toBeInTheDocument();
  });

  it('should render the "Add Task" button when in project or phase view', () => {
    renderToolbar({ currentView: 'project' });
    expect(screen.getByRole('button', { name: /Lägg till uppgift/i })).toBeInTheDocument();
  });

  it('should NOT render the "Add Task" button when in projects overview', () => {
    renderToolbar({ currentView: 'projects' });
    expect(screen.queryByRole('button', { name: /Lägg till uppgift/i })).not.toBeInTheDocument();
  });

  it('should call setSearchTerm when search input changes', () => {
    renderToolbar();
    const searchInput = screen.getByPlaceholderText('Sök uppgifter...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
  });

  it('should call handleZoomIn when zoom in button is clicked', () => {
    renderToolbar();
    // Hitta knappen baserat på dess visuella innehåll (ZoomIn-ikon)
    const zoomInButton = screen.getByRole('button', { name: 'Zooma in' });
    fireEvent.click(zoomInButton);
    expect(mockHandleZoomIn).toHaveBeenCalledTimes(1);
  });

  it('should call handleZoomOut when zoom out button is clicked', () => {
    renderToolbar();
    const zoomOutButton = screen.getByRole('button', { name: 'Zooma ut' });
    fireEvent.click(zoomOutButton);
    expect(mockHandleZoomOut).toHaveBeenCalledTimes(1);
  });

  it('should call setIsAddingTask when "Add Task" button is clicked', () => {
    renderToolbar({ currentView: 'project' });
    const addTaskButton = screen.getByRole('button', { name: /Lägg till uppgift/i });
    fireEvent.click(addTaskButton);
    expect(mockSetIsAddingTask).toHaveBeenCalledWith(true);
  });

  // TODO: Lägg till tester för Dropdown-menyer (Tidsskala, Visningsalternativ etc.)
  // TODO: Testa att rätt props skickas till underkomponenter (om några)
}); 