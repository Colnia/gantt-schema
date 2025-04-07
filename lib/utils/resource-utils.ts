import { addDays, format, isAfter, isBefore } from 'date-fns';

export interface ResourceAssignment {
  id: string;
  taskId: string;
  startDate?: Date | null;
  endDate?: Date | null;
  units?: number;
  hoursPerDay?: number;
  task: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status?: string;
    progress?: number;
    projectId: string;
    project: {
      id: string;
      name: string;
    };
  };
}

export interface DailyUtilization {
  date: string;
  utilization: number;
  assignments: {
    id: string;
    taskId: string;
    taskName: string;
    units: number;
    hoursPerDay: number;
    projectId: string;
    projectName: string;
  }[];
  isOverallocated: boolean;
}

/**
 * Beräknar daglig användning för en samling resurstilldelningar
 */
export function calculateDailyUtilization(
  assignments: ResourceAssignment[],
  startDate: Date,
  endDate: Date,
  baseHoursPerDay: number = 8
): DailyUtilization[] {
  // Generera datumserie mellan start- och slutdatum
  const dates: Date[] = [];
  let currentDate = startDate;
  while (!isAfter(currentDate, endDate)) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  // Beräkna användning per dag
  return dates.map(date => {
    // Filtrera tilldelningar som är aktiva på detta datum
    const dailyAssignments = assignments.filter(assignment => {
      // Bestäm effektiva datum för tilldelningen
      const effectiveStartDate = assignment.startDate || assignment.task.startDate;
      const effectiveEndDate = assignment.endDate || assignment.task.endDate;
      
      // Kontrollera om tilldelningen är aktiv på det aktuella datumet
      return (
        !isBefore(date, effectiveStartDate) && 
        !isAfter(date, effectiveEndDate)
      );
    });
    
    // Beräkna total användningsprocent för dagen
    const totalUtilization = dailyAssignments.reduce((total, assignment) => {
      return total + (assignment.units || 100) * (assignment.hoursPerDay || baseHoursPerDay) / (baseHoursPerDay * 100);
    }, 0);
    
    // Markera överallokering (över 100%)
    const isOverallocated = totalUtilization > 1;
    
    // Returnera data för dagen
    return {
      date: format(date, 'yyyy-MM-dd'),
      utilization: Math.min(totalUtilization, 1), // Begränsa till max 100% för visualisering
      rawUtilization: totalUtilization, // Faktisk användning (kan vara över 100%)
      assignments: dailyAssignments.map(a => ({
        id: a.id,
        taskId: a.task.id,
        taskName: a.task.name,
        units: a.units || 100,
        hoursPerDay: a.hoursPerDay || baseHoursPerDay,
        projectId: a.task.projectId,
        projectName: a.task.project.name
      })),
      isOverallocated
    };
  });
} 