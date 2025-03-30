import { describe, it, expect } from 'vitest';
import { parseISO } from 'date-fns';
import { formatDate, getTaskLeft, getTaskWidth } from './date-utils';
import { Task } from '@/lib/types'; // Importera Task-typen

// Testsvit för date-utils
describe('date-utils', () => {

  // Tester för formatDate
  describe('formatDate', () => {
    it('should format a Date object correctly', () => {
      const date = new Date(2024, 2, 30); // Mars 30, 2024 (månader är 0-indexerade)
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-03-30');
      expect(formatDate(date, 'dd MMM yyyy')).toBe('30 mars 2024');
    });

    it('should format an ISO date string correctly', () => {
      const dateString = '2024-04-01T12:00:00.000Z';
      expect(formatDate(dateString, 'yyyy-MM-dd')).toBe('2024-04-01');
    });

    it('should use the default format if none is provided', () => {
      const date = new Date(2024, 3, 1);
      expect(formatDate(date)).toBe('2024-04-01');
    });
  });

  // Tester för getTaskLeft
  describe('getTaskLeft', () => {
    const viewStartDate = parseISO('2024-03-25'); // Måndag
    const dayWidth = 40;
    const sampleTask: Task = {
      id: 't1',
      name: 'Test Task',
      startDate: '2024-03-27', // Onsdag
      endDate: '2024-03-29', // Fredag
      progress: 50, status: 'in-progress', priority: 'medium', resources: [], dependencies: [],
    };

    it('should calculate the left position correctly', () => {
      // Skillnad: 27:e - 25:e = 2 dagar
      // Position: 2 * 40px = 80px
      expect(getTaskLeft(sampleTask, dayWidth, viewStartDate)).toBe(80);
    });

    it('should return 0 if the task starts on the view start date', () => {
      const taskOnStart: Task = { ...sampleTask, startDate: '2024-03-25' };
      expect(getTaskLeft(taskOnStart, dayWidth, viewStartDate)).toBe(0);
    });
  });

  // Tester för getTaskWidth
  describe('getTaskWidth', () => {
    const dayWidth = 40;
    const viewStartDate = parseISO('2024-03-25'); // Behövs tekniskt sett inte av funktionen, men bra för kontext
    const sampleTask: Task = {
      id: 't1',
      name: 'Test Task',
      startDate: '2024-03-27', // Onsdag
      endDate: '2024-03-29', // Fredag
      progress: 50, status: 'in-progress', priority: 'medium', resources: [], dependencies: [],
    };

    it('should calculate the width correctly for a multi-day task', () => {
      // Dagar: 29:e - 27:e = 2 dagar, men inkludera startdagen => 3 dagar
      // Bredd: 3 * 40px = 120px
      expect(getTaskWidth(sampleTask, dayWidth, viewStartDate)).toBe(120);
    });

    it('should calculate the width correctly for a single-day task', () => {
      const singleDayTask: Task = { ...sampleTask, endDate: '2024-03-27' };
      // Dagar: 27:e - 27:e = 0 dagar + 1 = 1 dag
      // Bredd: 1 * 40px = 40px
      expect(getTaskWidth(singleDayTask, dayWidth, viewStartDate)).toBe(40);
    });
  });

  // TODO: Lägg till tester för getDates, getTimelineItems, getDefaultDayWidth, ensureMinimumViewDuration etc.
}); 