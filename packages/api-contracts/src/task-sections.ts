import { z } from "zod";

import { reorderIdsInputSchema } from "./common";

export const taskSectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  categoryId: z.string().nullable(),
  labelId: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const taskSectionMembershipSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  sectionId: z.string(),
  createdAt: z.string(),
});

const scopeRefine = <T extends { categoryId?: string | null; labelId?: string | null }>(
  value: T,
) => Boolean(value.categoryId) !== Boolean(value.labelId);

export const listTaskSectionsQuerySchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    labelId: z.string().min(1).optional(),
  })
  .refine(scopeRefine, { message: "Provide exactly one of categoryId or labelId" });

export const createTaskSectionInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    categoryId: z.string().min(1).optional(),
    labelId: z.string().min(1).optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine(scopeRefine, { message: "Provide exactly one of categoryId or labelId" });

export const updateTaskSectionInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const reorderTaskSectionsInputSchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    labelId: z.string().min(1).optional(),
    orderedIds: reorderIdsInputSchema.shape.orderedIds,
  })
  .refine(scopeRefine, { message: "Provide exactly one of categoryId or labelId" });

/** Move a task into a section, or to the list root when sectionId is null. */
export const setTaskSectionMembershipInputSchema = z
  .object({
    taskId: z.string().min(1),
    sectionId: z.string().min(1).nullable(),
    categoryId: z.string().min(1).optional(),
    labelId: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.sectionId) return;
    if (Boolean(value.categoryId) === Boolean(value.labelId)) {
      ctx.addIssue({
        code: "custom",
        message: "When clearing membership, provide exactly one of categoryId or labelId",
      });
    }
  });

export type TaskSectionDto = z.infer<typeof taskSectionSchema>;
export type TaskSectionMembershipDto = z.infer<typeof taskSectionMembershipSchema>;
export type ListTaskSectionsQuery = z.infer<typeof listTaskSectionsQuerySchema>;
export type CreateTaskSectionInput = z.infer<typeof createTaskSectionInputSchema>;
export type UpdateTaskSectionInput = z.infer<typeof updateTaskSectionInputSchema>;
export type ReorderTaskSectionsInput = z.infer<typeof reorderTaskSectionsInputSchema>;
export type SetTaskSectionMembershipInput = z.infer<typeof setTaskSectionMembershipInputSchema>;
