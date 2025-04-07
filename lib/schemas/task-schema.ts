import { z } from "zod";

// Definiera Zod-enums för status och prioritet som matchar TypeScript-typerna
const TaskStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "completed",
  "delayed",
  "cancelled",
]);

const TaskPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

// För Dependency behöver vi ett schema också, även om det definieras här temporärt
const DependencySchema = z.object({
  fromTaskId: z.string().min(1, "From Task ID cannot be empty"),
  toTaskId: z.string().min(1, "To Task ID cannot be empty"),
  type: z.enum([ // Matcha typerna i TypeScript
    "finish-to-start",
    "start-to-start",
    "finish-to-finish",
    "start-to-finish",
  ]),
});

// Skapa ett schema som kan acceptera både Date och string
const DateSchema = z.union([
  z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  z.instanceof(Date)
]);

export const TaskSchema = z.object({
  id: z.string().min(1, "Task ID cannot be empty"), // Ofta genererad, men bör finnas
  name: z.string().min(1, "Task name cannot be empty"),
  description: z.string().optional(), // Beskrivning är valfri
  startDate: DateSchema, // Accepterar både string och Date
  endDate: DateSchema,   // Accepterar både string och Date
  progress: z.number().min(0).max(100).int(), // Heltal 0-100
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  resources: z.array(z.string()), // Array av resurs-ID (strängar)
  dependencies: z.array(DependencySchema), // Array av beroende-objekt
  parentId: z.string().optional(), // Valfritt föräldra-ID
  // milestoneId?: string; // Verkar inte användas direkt i Task, Milestone är separat typ
  color: z.string().optional(), // Valfri färg
  collapsed: z.boolean().optional(), // Valfri
  isPhase: z.boolean().optional(), // Valfri, indikerar om uppgiften är en fas
  subTasks: z.array(z.string()).optional(), // Valfri array av subtask-ID
}).refine((data) => {
  // Konvertera till Date-objekt för jämförelse
  const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
  const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
  return startDate <= endDate;
}, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"], // Associera felet med endDate-fältet
});

// Vi kan också härleda TypeScript-typen från schemat om vi vill
export type TaskInput = z.input<typeof TaskSchema>; // Typ för input-data
export type TaskOutput = z.output<typeof TaskSchema>; // Typ för validerad output-data 