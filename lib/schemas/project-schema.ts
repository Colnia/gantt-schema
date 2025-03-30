import { z } from "zod";
import { TaskSchema } from "./task-schema"; // Importera TaskSchema

// Schema för Resource
const ResourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  avatar: z.string().url().optional(), // Valfri URL för avatar
  availability: z.number().min(0).max(100), // Procent 0-100
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(), // Valfri hex-färgkod
});

// Schema för Milestone
const MilestoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid milestone date format",
  }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export const ProjectSchema = z.object({
  id: z.string().min(1, "Project ID cannot be empty"),
  name: z.string().min(1, "Project name cannot be empty"),
  description: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }),
  tasks: z.array(TaskSchema), // Använd TaskSchema för att validera varje task
  milestones: z.array(MilestoneSchema), // Använd MilestoneSchema
  resources: z.array(ResourceSchema), // Använd ResourceSchema
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  progress: z.number().min(0).max(100).optional(), // Valfri progress 0-100
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

// Exportera härledda typer
export type ProjectInput = z.input<typeof ProjectSchema>;
export type ProjectOutput = z.output<typeof ProjectSchema>;
export type ResourceInput = z.input<typeof ResourceSchema>;
export type ResourceOutput = z.output<typeof ResourceSchema>;
export type MilestoneInput = z.input<typeof MilestoneSchema>;
export type MilestoneOutput = z.output<typeof MilestoneSchema>; 