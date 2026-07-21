import { z } from "zod";

export const goalStatusSchema = z.enum(["draft", "active", "paused", "completed", "archived"]);

export const goalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  motivation: z.string().nullable(),
  status: goalStatusSchema,
  imageUrl: z.string().nullable(),
  onboardingStep: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createGoalInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  motivation: z.string().trim().max(5000).optional(),
  onboardingStep: z.string().optional(),
});

export type GoalDto = z.infer<typeof goalSchema>;
export type CreateGoalInput = z.infer<typeof createGoalInputSchema>;
