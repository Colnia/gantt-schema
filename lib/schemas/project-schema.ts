import { z } from "zod";
import { TaskSchema } from "./task-schema";

// Schema för Resource
const ResourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().optional(),
  type: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  costRate: z.number().optional(),
  capacity: z.number().optional(),
  avatar: z.string().url().optional(),
  availability: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
  skills: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    level: z.number().min(1).max(5)
  })).optional()
});

// Schema för Milestone
const MilestoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid milestone date format",
  }),
  color: z.string().optional(),
});

// Schema för Phase
const PhaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  completionRate: z.number().min(0).max(100),
  color: z.string().optional(),
  projectId: z.string(),
});

// Schema för ResourceAssignment
const ResourceAssignmentSchema = z.object({
  id: z.string().min(1),
  resourceId: z.string().min(1),
  projectId: z.string().min(1),
  phaseId: z.string().optional(),
  taskId: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  hoursPerDay: z.number().min(0),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0),
  notes: z.string().optional(),
  resource: ResourceSchema.optional()
});

export const ProjectSchema = z.object({
  id: z.string().min(1, "Project ID cannot be empty"),
  name: z.string().min(1, "Project name cannot be empty"),
  description: z.string().optional(),
  customer: z.string().optional(),
  manager: z.string().optional(),
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date(), z.undefined()]),
  plannedEndDate: z.union([z.string(), z.date(), z.undefined()]),
  actualEndDate: z.union([z.string(), z.date(), z.undefined()]),
  status: z.string().optional(),
  budget: z.number().optional(),
  costToDate: z.number().optional(),
  estimatedTotalCost: z.number().optional(),
  tasks: z.array(TaskSchema).optional(),
  phases: z.array(PhaseSchema).optional(),
  milestones: z.array(MilestoneSchema).optional(),
  resources: z.array(z.union([ResourceSchema, ResourceAssignmentSchema])).optional(),
  color: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  isArchived: z.boolean().optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
}).refine((data) => {
  // Only validate if both dates are present
  if (data.startDate && data.endDate) {
    const start = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
    const end = data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

// Export types
export type ProjectInput = z.input<typeof ProjectSchema>;
export type ProjectOutput = z.output<typeof ProjectSchema>;
export type ResourceInput = z.input<typeof ResourceSchema>;
export type ResourceOutput = z.output<typeof ResourceSchema>;
export type MilestoneInput = z.input<typeof MilestoneSchema>;
export type MilestoneOutput = z.output<typeof MilestoneSchema>;
export type PhaseInput = z.input<typeof PhaseSchema>;
export type PhaseOutput = z.output<typeof PhaseSchema>; 