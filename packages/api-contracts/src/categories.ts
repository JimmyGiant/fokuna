import { z } from "zod";

export const categoryColorTokenSchema = z.enum([
  "category.coral",
  "category.teal",
  "category.blue",
  "category.purple",
  "category.pink",
  "category.gold",
]);

export const categorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  colorToken: categoryColorTokenSchema,
  icon: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createCategoryInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  colorToken: categoryColorTokenSchema.default("category.teal"),
  icon: z.string().trim().min(1).max(60).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategoryInputSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    colorToken: categoryColorTokenSchema.optional(),
    icon: z.string().trim().min(1).max(60).nullable().optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CategoryDto = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;
export type CategoryColorToken = z.infer<typeof categoryColorTokenSchema>;
