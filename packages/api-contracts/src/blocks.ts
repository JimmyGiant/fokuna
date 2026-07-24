import { z } from "zod";

export const blockRhythmKindSchema = z.enum([
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

export const blockRhythmSchema = z.object({
  kind: blockRhythmKindSchema,
  count: z.number().int().positive().max(31).default(1),
});

export const blockTimerKindSchema = z.enum([
  "none",
  "pomodoro",
  "countdown",
  "stopwatch",
  "clock",
]);

export const blockTimerConfigSchema = z.object({
  kind: blockTimerKindSchema,
  pomodoroPresetId: z.string().min(1).optional(),
});

export const blockFocusBackgroundKindSchema = z.enum([
  "colors",
  "gradients",
  "shapes",
  "nature",
]);

export const blockFocusConfigSchema = z.object({
  musicId: z.string().nullable().optional(),
  backgroundKind: blockFocusBackgroundKindSchema.optional(),
  backgroundId: z.string().nullable().optional(),
});

export const blockInsightsWeekSchema = z.object({
  label: z.string().min(1),
  value: z.number().nonnegative(),
});

export const blockInsightsSchema = z.object({
  count: z.number().int().nonnegative(),
  avgDurationMinutes: z.number().int().nonnegative(),
  lastAt: z.string().nullable(),
  weeks: z.array(blockInsightsWeekSchema),
  threshold: z.number().nonnegative().nullable().optional(),
});

export const blockSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalId: z.string().nullable(),
  categoryId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  durationMinutes: z.number().int(),
  icon: z.string().nullable(),
  colorToken: z.string().nullable(),
  isTemplate: z.boolean(),
  isPreset: z.boolean(),
  rhythm: blockRhythmSchema.nullable(),
  timerConfig: blockTimerConfigSchema.nullable(),
  focusConfig: blockFocusConfigSchema.nullable(),
  insights: blockInsightsSchema.nullable(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createBlockInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  durationMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60)
    .default(25),
  icon: z.string().optional(),
  colorToken: z.string().optional(),
  goalId: z.string().optional(),
  categoryId: z.string().optional(),
  isTemplate: z.boolean().default(false),
  rhythm: blockRhythmSchema.nullable().optional(),
  timerConfig: blockTimerConfigSchema.nullable().optional(),
  focusConfig: blockFocusConfigSchema.nullable().optional(),
});

export const updateBlockInputSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  durationMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60)
    .optional(),
  icon: z.string().nullable().optional(),
  colorToken: z.string().nullable().optional(),
  goalId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  isTemplate: z.boolean().optional(),
  rhythm: blockRhythmSchema.nullable().optional(),
  timerConfig: blockTimerConfigSchema.nullable().optional(),
  focusConfig: blockFocusConfigSchema.nullable().optional(),
});

export type BlockDto = z.infer<typeof blockSchema>;
export type CreateBlockInput = z.infer<typeof createBlockInputSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockInputSchema>;
export type BlockRhythm = z.infer<typeof blockRhythmSchema>;
export type BlockTimerConfig = z.infer<typeof blockTimerConfigSchema>;
export type BlockFocusConfig = z.infer<typeof blockFocusConfigSchema>;
