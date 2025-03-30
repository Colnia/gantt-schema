import {
  addDays,
  addMonths,
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  getDaysInMonth,
} from "date-fns"
import { sv } from "date-fns/locale"
import { Task, TimeScale } from "@/lib/types"

/**
 * Beräknar bredden för en uppgift i pixlar.
 */
export const getTaskWidth = (task: Task, dayWidth: number, startDate: Date): number => {
  const start = parseISO(task.startDate)
  const end = parseISO(task.endDate)
  const days = differenceInDays(end, start) + 1
  return days * dayWidth
}

/**
 * Beräknar den vänstra positionen för en uppgift i pixlar.
 */
export const getTaskLeft = (task: Task, dayWidth: number, startDate: Date): number => {
  const taskStart = parseISO(task.startDate)
  const days = differenceInDays(taskStart, startDate)
  return days * dayWidth
}

/**
 * Genererar en lista med datum för tidslinjen.
 */
export const getDates = (viewStartDate: Date, viewEndDate: Date): Date[] => {
  const dates: Date[] = []
  let currentDate = viewStartDate

  while (!isAfter(currentDate, viewEndDate)) {
    dates.push(currentDate)
    currentDate = addDays(currentDate, 1)
  }

  return dates
}

/**
 * Genererar en lista med tidslinjeobjekt baserat på tidsskalan.
 */
export const getTimelineItems = (
  timeScale: TimeScale,
  viewStartDate: Date,
  viewEndDate: Date,
  dayWidth: number
): { date: Date; type: "primary" | "secondary"; label: string; width: number }[] => {
  const items: { date: Date; type: "primary" | "secondary"; label: string; width: number }[] = []

  switch (timeScale) {
    case "day":
      // Primary: days (t.ex. "Ons 3")
      eachDayOfInterval({ start: viewStartDate, end: viewEndDate }).forEach((date) => {
        items.push({
          date,
          type: "primary",
          label: format(date, "EEE d", { locale: sv }),
          width: dayWidth, // Bredden är bara en dag
        })
      })
      break
    case "week":
      // Primary: Vecka (t.ex. "v 14")
      // Secondary: Dagar (t.ex. "M 1", "T 2"...)
      eachWeekOfInterval({ start: viewStartDate, end: viewEndDate }, { locale: sv }).forEach((weekStart) => {
        // Beräkna bredden för hela veckan (kan vara mindre än 7 dagar i början/slutet)
        const weekEnd = addDays(weekStart, 6);
        const actualEnd = isAfter(weekEnd, viewEndDate) ? viewEndDate : weekEnd;
        const weekDays = differenceInDays(actualEnd, weekStart) + 1;
        items.push({
          date: weekStart,
          type: "primary",
          label: format(weekStart, "'v' w", { locale: sv }),
          width: weekDays * dayWidth,
        });
        eachDayOfInterval({
          start: weekStart,
          end: actualEnd, // Använd faktiskt slutdatum för veckan inom vyn
        }).forEach((day) => {
           // Dagar som sekundära
            items.push({
               date: day,
               type: "secondary",
               label: format(day, "EEE d", { locale: sv }), // T.ex. "M 1"
               width: dayWidth, 
            })
        })
      })
      break
    case "month":
      // Primary: Månad och År (t.ex. "April 2025")
      // Secondary: Tom (för att undvika röran)
      eachMonthOfInterval({ start: viewStartDate, end: viewEndDate }).forEach((monthStart) => {
        const daysInMonth = getDaysInMonth(monthStart);
        // Justera bredden om vyn inte täcker hela månaden
        const actualStart = isBefore(monthStart, viewStartDate) ? viewStartDate : monthStart;
        const monthEnd = endOfMonth(monthStart);
        const actualEnd = isAfter(monthEnd, viewEndDate) ? viewEndDate : monthEnd;
        const monthDays = differenceInDays(actualEnd, actualStart) + 1;
        items.push({
          date: monthStart,
          type: "primary",
          label: format(monthStart, "MMMM yyyy", { locale: sv }), // T.ex. "April 2025"
          width: monthDays * dayWidth,
        });
        // Vi lägger inte till några sekundära element för månader för tydlighet
      })
      break
    case "quarter": // Samma som månad, men behöver justeras för kvartalsvisning
    case "year":
      // Primary: Månad (t.ex. "Apr")
      eachMonthOfInterval({ start: viewStartDate, end: viewEndDate }).forEach((monthStart) => {
        const daysInMonth = getDaysInMonth(monthStart);
        const actualStart = isBefore(monthStart, viewStartDate) ? viewStartDate : monthStart;
        const monthEnd = endOfMonth(monthStart);
        const actualEnd = isAfter(monthEnd, viewEndDate) ? viewEndDate : monthEnd;
        const monthDays = differenceInDays(actualEnd, actualStart) + 1;
        items.push({
          date: monthStart,
          type: "primary",
          label: format(monthStart, "MMM", { locale: sv }), // T.ex. "Apr"
          width: monthDays * dayWidth,
        });
      })
      break
  }

  return items
}

/**
 * Funktion för att justera day width baserat på tidsskalan.
 */
export const getDefaultDayWidth = (timeScale: TimeScale): number => {
  switch (timeScale) {
    case "day":
      return 40
    case "week":
      return 20
    case "month":
      return 8
    case "quarter":
      return 4
    case "year":
      return 2
    default:
      return 40
  }
}

/**
 * Funktion för att formatera ett datum till en sträng.
 */
export const formatDate = (date: Date | string, formatStr: string = "yyyy-MM-dd"): string => {
  if (typeof date === "string") {
    date = parseISO(date)
  }
  return format(date, formatStr, { locale: sv })
}

/**
 * Funktion för att säkerställa att visningen av ett Gantt-schema har rimlig längd.
 */
export const ensureMinimumViewDuration = (
  startDate: Date,
  endDate: Date,
  minimumMonths: number = 12
): { viewStartDate: Date; viewEndDate: Date } => {
  const extendedEndDate = addMonths(startDate, minimumMonths)
  
  if (isBefore(endDate, extendedEndDate)) {
    return { viewStartDate: startDate, viewEndDate: extendedEndDate }
  }
  
  return { viewStartDate: startDate, viewEndDate: endDate }
}

/**
 * Funktion för att få dagens datum formaterat som en sträng.
 */
export const getTodayFormatted = (formatStr: string = "yyyy-MM-dd"): string => {
  return format(new Date(), formatStr, { locale: sv })
}

/**
 * Funktion för att få ett framtida datum formaterat som en sträng.
 */
export const getFutureDateFormatted = (
  daysFromNow: number = 7,
  formatStr: string = "yyyy-MM-dd"
): string => {
  return format(addDays(new Date(), daysFromNow), formatStr, { locale: sv })
} 