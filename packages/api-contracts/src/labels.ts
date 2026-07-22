import { z } from "zod";

import { categoryColorTokenSchema } from "./categories";

export const labelSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  colorToken: categoryColorTokenSchema,
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createLabelInputSchema = z.object({
  name: z.string().trim().min(1).max(40),
  colorToken: categoryColorTokenSchema.default("category.coral"),
  sortOrder: z.number().int().optional(),
});

export const updateLabelInputSchema = z
  .object({
    name: z.string().trim().min(1).max(40).optional(),
    colorToken: categoryColorTokenSchema.optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type LabelDto = z.infer<typeof labelSchema>;
export type CreateLabelInput = z.infer<typeof createLabelInputSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelInputSchema>;
