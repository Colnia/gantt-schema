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
  try {
    // Säkerställ att vi har Date-objekt
    const start = ensureDate(task.startDate);
    const end = ensureDate(task.endDate);
    
    // Validera datumen
    if (!start || !end) {
      console.warn('Invalid dates for task (ensureDate returned null):', task.id, task.name);
      return 0;
    }
    
    // Beräkna antal dagar och bredden
    const days = differenceInDays(end, start) + 1;
    
    // Beräkna bredd i pixlar baserat på antal dagar
    // OBS: Vi använder inte startDate här eftersom bredden alltid är baserad på skillnaden
    // mellan start och slutdatum för uppgiften, inte relativt till vyn
    return Math.max(days * dayWidth, 1); // Minst 1px breda för att alltid vara synliga
  } catch (error) {
    console.error('Error calculating task width:', error, task);
    return 0;
  }
}

/**
 * Beräknar den vänstra positionen för en uppgift i pixlar.
 */
export const getTaskLeft = (task: Task, dayWidth: number, startDate: Date): number => {
  try {
    // Säkerställ att vi har Date-objekt
    const taskStart = ensureDate(task.startDate);
    
    // Validera taskStart
    if (!taskStart) {
      console.warn('Invalid start date for task (ensureDate returned null):', task.id, task.name);
      return 0;
    }
    
    // Beräkna dagar från vyns startdatum
    const days = differenceInDays(taskStart, startDate);
    
    // Beräkna position i pixlar baserat på skillnaden i dagar
    // Denna beräkning måste vara relativ till vyns startdatum
    return Math.max(days * dayWidth, 0); // Kan inte ha negativ position
  } catch (error) {
    console.error('Error calculating task left position:', error, task);
    return 0;
  }
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
      // För dagvyn, visa veckor som primär och dagar som sekundär
      // Primary: veckor, "W1 3-7"
      // Secondary: veckodagar, "M T O T F L S"
      eachWeekOfInterval({ start: viewStartDate, end: viewEndDate }, { locale: sv }).forEach((weekStart, weekIndex) => {
        // Beräkna bredden för hela veckan (kan vara mindre än 7 dagar i början/slutet)
        const weekEnd = addDays(weekStart, 6);
        const actualEnd = isAfter(weekEnd, viewEndDate) ? viewEndDate : weekEnd;
        const weekDays = differenceInDays(actualEnd, weekStart) + 1;
        
        // Skapa datumintervall för veckan, t.ex. "3-7"
        const weekStartDay = format(weekStart, "d", { locale: sv });
        const weekEndDay = format(actualEnd, "d", { locale: sv });
        const weekNumber = format(weekStart, "w", { locale: sv });
        const weekLabel = `v.${weekNumber} ${weekStartDay}-${weekEndDay}`;
        
        items.push({
          date: weekStart,
          type: "primary",
          label: weekLabel,
          width: weekDays * dayWidth,
        });
        
        // Lägg till dagar som sekundära element
        eachDayOfInterval({
          start: weekStart,
          end: actualEnd,
        }).forEach((day) => {
          items.push({
            date: day,
            type: "secondary",
            label: format(day, "EEEEE", { locale: sv }), // Första bokstaven i veckodagen
            width: dayWidth,
          });
        });
      });
      break;
    case "week":
      // Primary: Månad (t.ex. "Januari 2021")
      // Secondary: Veckor (t.ex. "W1 3-7")
      eachMonthOfInterval({ start: viewStartDate, end: viewEndDate }).forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = isBefore(monthStart, viewStartDate) ? viewStartDate : monthStart;
        const actualEnd = isAfter(monthEnd, viewEndDate) ? viewEndDate : monthEnd;
        const monthDays = differenceInDays(actualEnd, actualStart) + 1;
        
        items.push({
          date: monthStart,
          type: "primary",
          label: format(monthStart, "MMMM yyyy", { locale: sv }), // T.ex. "Januari 2021"
          width: monthDays * dayWidth,
        });
        
        // Lägg till veckor som sekundära element
        let weekCounter = 1;
        eachWeekOfInterval({ start: actualStart, end: actualEnd }, { locale: sv }).forEach((weekStart) => {
          const weekEnd = addDays(weekStart, 6);
          const weekActualEnd = isAfter(weekEnd, actualEnd) ? actualEnd : weekEnd;
          const weekDays = differenceInDays(weekActualEnd, weekStart) + 1;
          
          // Skapa datumintervall för veckan, t.ex. "3-7"
          const weekStartDay = format(weekStart, "d", { locale: sv });
          const weekEndDay = format(weekActualEnd, "d", { locale: sv });
          const weekNumber = format(weekStart, "w", { locale: sv });
          
          items.push({
            date: weekStart,
            type: "secondary",
            label: `v.${weekNumber} ${weekStartDay}-${weekEndDay}`,
            width: weekDays * dayWidth,
          });
          
          weekCounter++;
        });
      });
      break;
    case "month":
      // Primary: Månad och År (t.ex. "April 2025")
      // Secondary: Veckor (t.ex. "v.15")
      eachMonthOfInterval({ start: viewStartDate, end: viewEndDate }).forEach((monthStart) => {
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
        
        // Lägg till veckovisning som sekundära element
        eachWeekOfInterval({ start: actualStart, end: actualEnd }, { locale: sv }).forEach((weekStart) => {
          const weekEnd = addDays(weekStart, 6);
          const weekActualEnd = isAfter(weekEnd, actualEnd) ? actualEnd : weekEnd;
          const weekDays = differenceInDays(weekActualEnd, weekStart) + 1;
          const weekNumber = format(weekStart, "w", { locale: sv });
          
          items.push({
            date: weekStart,
            type: "secondary",
            label: `v.${weekNumber}`,
            width: weekDays * dayWidth,
          });
        });
      });
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
          label: format(monthStart, "MMMM yyyy", { locale: sv }), // T.ex. "April 2025"
          width: monthDays * dayWidth,
        });
        // Vi lägger inte till några sekundära element för månader för tydlighet
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
 * Hanterar både string och Date-objekt.
 */
export const formatDate = (date: Date | string, formatStr: string = "yyyy-MM-dd"): string => {
  if (typeof date === "string") {
    try {
      // Försök att parsa datumet om det är en sträng
      return format(parseISO(date), formatStr, { locale: sv });
    } catch (error) {
      console.error("Error parsing date:", error);
      return date; // Returnera ursprunglig sträng vid fel
    }
  }
  
  // Om det redan är ett Date-objekt
  return format(date, formatStr, { locale: sv });
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

// Helper function to ensure a value is a Date object or null
// Exported to be used in gantt-chart.tsx
export const ensureDate = (date: string | Date | undefined | null): Date | null => {
  if (!date) {
    // console.warn("ensureDate received null or undefined, returning null"); // Optional: log if needed
    return null; // Return null for null/undefined input
  }
  
  // Om det redan är ett Date-objekt, verifiera att det är giltigt
  if (date instanceof Date) {
    // Check if the Date object is valid
    if (!isNaN(date.getTime())) {
      return date;
    } else {
      console.warn("ensureDate received an invalid Date object:", date);
      return null; // Return null for invalid Date objects
    }
  }
  
  // Om det är en string, försök parse:a i olika format
  if (typeof date === 'string') {
    try {
      const trimmedDate = date.trim();
      if (!trimmedDate) {
        console.warn("ensureDate received an empty or whitespace string");
        return null;
      }
      
      // Allmän ISO/RFC datumsträng-parsing (mer flexibel än bara parseISO)
      const parsedDate = new Date(trimmedDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate; // Giltigt parseat datum
      }
      
      // Testa med parseISO om det första försöket misslyckades
      const isoParsedDate = parseISO(trimmedDate);
      if (!isNaN(isoParsedDate.getTime())) {
        return isoParsedDate;
      }
      
      // Testa om det är ett format som "YYYY-MM-DD"
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        const [year, month, day] = trimmedDate.split('-').map(Number);
        // OBS: JavaScript använder 0-indexerade månader
        const constructedDate = new Date(year, month - 1, day);
        if (!isNaN(constructedDate.getTime())) {
          return constructedDate;
        }
      }
      
      console.warn(`ensureDate failed to parse date string: "${trimmedDate}"`);
      return null; // Return null if parsing results in invalid date
    } catch (error) {
      console.error("Error parsing date string in ensureDate:", date, error);
      return null; // Return null if parsing throws an error
    }
  }

  // Om det varken är Date eller string
  console.warn("ensureDate received an unexpected type:", typeof date);
  return null;
} 