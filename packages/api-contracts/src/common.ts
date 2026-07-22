import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export function apiError(code: string, message: string, details?: unknown): ApiError {
  return {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}

/** Shared batch reorder payload for categories, labels, goals, etc. */
export const reorderIdsInputSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export type ReorderIdsInput = z.infer<typeof reorderIdsInputSchema>;
