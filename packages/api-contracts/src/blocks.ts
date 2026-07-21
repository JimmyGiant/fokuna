import { z } from "zod";

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
});

export type BlockDto = z.infer<typeof blockSchema>;
export type CreateBlockInput = z.infer<typeof createBlockInputSchema>;
