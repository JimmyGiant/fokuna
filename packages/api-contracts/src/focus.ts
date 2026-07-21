import { z } from "zod";

export const focusSessionStatusSchema = z.enum(["running", "paused", "completed", "cancelled"]);

export const focusSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  taskId: z.string().nullable(),
  blockId: z.string().nullable(),
  status: focusSessionStatusSchema,
  plannedDurationSeconds: z.number().int(),
  startedAt: z.string(),
  pausedAt: z.string().nullable(),
  accumulatedPauseSeconds: z.number().int(),
  endedAt: z.string().nullable(),
  isMinimized: z.boolean(),
  remainingSeconds: z.number().int(),
  elapsedSeconds: z.number().int(),
});

export const startFocusSessionInputSchema = z
  .object({
    taskId: z.string().optional(),
    blockId: z.string().optional(),
    plannedDurationSeconds: z
      .number()
      .int()
      .positive()
      .max(8 * 60 * 60)
      .default(25 * 60),
  })
  .refine((value) => Boolean(value.taskId || value.blockId), {
    message: "taskId or blockId is required",
  });

export const updateFocusSessionInputSchema = z.object({
  status: focusSessionStatusSchema.optional(),
  isMinimized: z.boolean().optional(),
});
