import { z } from "zod";

export const taskPrioritySchema = z.enum(["none", "low", "medium", "high", "urgent"]);

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalId: z.string().nullable(),
  milestoneId: z.string().nullable(),
  parentTaskId: z.string().nullable(),
  groupKey: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: taskPrioritySchema,
  estimateMinutes: z.number().int().nullable(),
  dueDate: z.string().nullable(),
  isFavorite: z.boolean(),
  isCompleted: z.boolean(),
  completedAt: z.string().nullable(),
  sortOrder: z.number().int(),
  tags: z.array(z.string()),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  groupKey: z.string().trim().min(1).max(100).default("inbox"),
  goalId: z.string().optional(),
  milestoneId: z.string().optional(),
  parentTaskId: z.string().optional(),
  priority: taskPrioritySchema.default("none"),
  estimateMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60)
    .optional(),
  dueDate: z.string().date().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  isFavorite: z.boolean().default(false),
});

/** Partial update — no `.default()` so omitted fields stay untouched (e.g. tags when only priority changes). */
export const updateTaskInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    groupKey: z.string().trim().min(1).max(100).optional(),
    goalId: z.string().optional(),
    milestoneId: z.string().optional(),
    parentTaskId: z.string().optional(),
    priority: taskPrioritySchema.optional(),
    estimateMinutes: z
      .number()
      .int()
      .positive()
      .max(24 * 60)
      .nullable()
      .optional(),
    dueDate: z.string().date().nullable().optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    isFavorite: z.boolean().optional(),
    isCompleted: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const reorderTasksInputSchema = z.object({
  groupKey: z.string().trim().min(1),
  orderedIds: z.array(z.string()).min(1),
});

export const listTasksQuerySchema = z.object({
  groupKey: z.string().optional(),
  goalId: z.string().optional(),
  includeCompleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value !== "false"),
});

export type TaskDto = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
