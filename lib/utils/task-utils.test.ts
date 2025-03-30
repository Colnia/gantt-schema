import { describe, it, expect } from 'vitest';
import { TaskStatus, TaskPriority, Task } from '@/lib/types'; // Importera nödvändiga typer
import {
  getStatusColor,
  getPriorityColor,
  filterTasksBySearchTerm,
  // Importera fler funktioner här när tester läggs till
} from './task-utils';

// Testsvit för task-utils
describe('task-utils', () => {

  // Tester för getStatusColor
  describe('getStatusColor', () => {
    it('should return correct background class for each status', () => {
      expect(getStatusColor('not-started')).toBe('bg-slate-400');
      expect(getStatusColor('in-progress')).toBe('bg-blue-500');
      expect(getStatusColor('completed')).toBe('bg-green-500');
      expect(getStatusColor('delayed')).toBe('bg-amber-500');
      expect(getStatusColor('cancelled')).toBe('bg-red-500');
    });

    it('should return default color for unknown status', () => {
      // @ts-expect-error - Testar avsiktligt med ogiltig status
      expect(getStatusColor('unknown-status')).toBe('bg-slate-400');
    });
  });

  // Tester för getPriorityColor
  describe('getPriorityColor', () => {
    it('should return correct background class for each priority', () => {
      expect(getPriorityColor('low')).toBe('bg-slate-400');
      expect(getPriorityColor('medium')).toBe('bg-blue-500');
      expect(getPriorityColor('high')).toBe('bg-amber-500');
      expect(getPriorityColor('critical')).toBe('bg-red-500');
    });

    it('should return default color for unknown priority', () => {
      // @ts-expect-error - Testar avsiktligt med ogiltig prioritet
      expect(getPriorityColor('unknown-priority')).toBe('bg-slate-400');
    });
  });

  // Tester för filterTasksBySearchTerm
  describe('filterTasksBySearchTerm', () => {
    const tasks: Task[] = [
      { id: 't1', name: 'Planera projekt', description: 'Skapa detaljerad plan', startDate: '', endDate: '', progress: 0, status: 'not-started', priority: 'medium', resources: [], dependencies: [] },
      { id: 't2', name: 'Designa UI', description: 'Mockups och prototyper', startDate: '', endDate: '', progress: 0, status: 'not-started', priority: 'high', resources: [], dependencies: [] },
      { id: 't3', name: 'Utveckla backend', description: 'API och databas', startDate: '', endDate: '', progress: 0, status: 'not-started', priority: 'critical', resources: [], dependencies: [] },
      { id: 't4', name: 'Implementera design', description: '', startDate: '', endDate: '', progress: 0, status: 'not-started', priority: 'medium', resources: [], dependencies: [] },
    ];

    it('should return all tasks if searchTerm is empty', () => {
      expect(filterTasksBySearchTerm(tasks, '')).toHaveLength(4);
      expect(filterTasksBySearchTerm(tasks, '')).toEqual(tasks);
    });

    it('should filter by task name (case-insensitive)', () => {
      const result = filterTasksBySearchTerm(tasks, 'design');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['t2', 't4']);
    });

    it('should filter by task description (case-insensitive)', () => {
      const result = filterTasksBySearchTerm(tasks, 'api');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t3');
    });

    it('should return empty array if no match found', () => {
      const result = filterTasksBySearchTerm(tasks, 'xyz');
      expect(result).toHaveLength(0);
    });

    it('should handle tasks without description', () => {
        const result = filterTasksBySearchTerm(tasks, 'implementera');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('t4');
    });
  });

  // TODO: Lägg till tester för groupTasksByParent, filterTasksByView, calculate... etc.
}); 