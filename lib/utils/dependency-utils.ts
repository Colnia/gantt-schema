import { Task, Dependency, Milestone } from "@/lib/types";
import { differenceInDays, parseISO } from 'date-fns';

// Hjälpfunktioner för att hantera och rita beroenden mellan uppgifter.
// Kommer att fyllas på senare. 

interface TaskPosition {
  left: number;
  width: number;
}

interface TaskWithIndex extends Task {
  index?: number; // Index i den *filtrerade* listan
}

interface DependencyCoordinate {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const ROW_HEIGHT = 50; // Increased to accommodate phase bar height

export function getDependencyCoordinates(
  tasks: Task[], // Hela listan med tasks från projektet
  filteredTasks: Task[], // Den filtrerade listan som visas
  getTaskPosFn: (task: Task) => TaskPosition,
  viewStartDate: Date | null,
  dayWidth: number
): DependencyCoordinate[] {
  if (!viewStartDate) return [];

  const coordinates: DependencyCoordinate[] = [];
  const taskHeight = ROW_HEIGHT;
  
  // Skapa en map för snabb åtkomst till tasks och deras *filtrerade* index (för Y-position)
  const taskMap: { [key: string]: TaskWithIndex } = {};
  tasks.forEach(task => {
     taskMap[task.id] = { ...task };
  });
  filteredTasks.forEach((task, index) => {
    if (taskMap[task.id]) {
        taskMap[task.id].index = index;
    }
  });

  // Hitta alla tasks som *är synliga* och har beroenden
  for (const task of filteredTasks) {
    if (task.dependencies && task.dependencies.length > 0) {
      for (const dep of task.dependencies) {
        const fromTask = taskMap[dep.fromTaskId];
        const toTask = taskMap[dep.toTaskId];

        // Kontrollera om *båda* uppgifterna finns och är *synliga* (har ett index)
        if (fromTask && toTask && fromTask.index !== undefined && toTask.index !== undefined) {
          const fromPos = getTaskPosFn(fromTask);
          const toPos = getTaskPosFn(toTask);
          const fromIndex = fromTask.index;
          const toIndex = toTask.index;

          // Ensure indices are defined before calculating Y
          if (fromIndex === undefined || toIndex === undefined) {
            console.warn("Dependency calculation skipped: Task index undefined.", { fromTask, toTask });
            continue; // Skip this dependency if indices are missing
          }

          let startX: number, startY: number, endX: number, endY: number;

          // Beräkna Y-position baserat på index
          startY = fromIndex * taskHeight + taskHeight / 2;
          endY = toIndex * taskHeight + taskHeight / 2;

          // Beräkna X-position baserat på beroendetyp
          switch (dep.type) {
            case 'start-to-start':
              startX = fromPos.left;
              endX = toPos.left;
              break;
            case 'finish-to-finish':
              startX = fromPos.left + fromPos.width;
              endX = toPos.left + toPos.width;
              break;
            case 'start-to-finish':
              startX = fromPos.left;
              endX = toPos.left + toPos.width;
              break;
            case 'finish-to-start':
            default:
              startX = fromPos.left + fromPos.width;
              endX = toPos.left;
              break;
          }

          // Lägg bara till om båda punkterna är relevanta (kan finjusteras senare)
          // Kanske onödigt att kolla X här eftersom getTaskPosFn borde returnera 0 om utanför vyn?
          coordinates.push({
             id: `${fromTask.id}-${toTask.id}-${dep.type}`,
             startX,
             startY,
             endX,
             endY,
          });
        }
      }
    }
  }
  return coordinates;
} 