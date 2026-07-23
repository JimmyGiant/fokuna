import { z } from "zod";

export const tasksSidebarNavReorderIdSchema = z.enum(["favorites", "today", "inbox"]);
export const tasksSidebarSectionIdSchema = z.enum([
  "categories",
  "goals",
  "labels",
  "priority",
]);
export const tasksSidebarHideableIdSchema = z.enum([
  "favorites",
  "today",
  "categories",
  "goals",
  "labels",
  "priority",
]);

export const tasksSidebarPreferencesSchema = z.object({
  navOrder: z.array(tasksSidebarNavReorderIdSchema).length(3),
  sectionOrder: z.array(tasksSidebarSectionIdSchema).length(4),
  hiddenIds: z.array(tasksSidebarHideableIdSchema),
});

export const uiPreferencesSchema = z.object({
  tasksSidebar: tasksSidebarPreferencesSchema.optional(),
});

export const userProfileDtoSchema = z.object({
  userId: z.string().min(1),
  timezone: z.string().min(1),
  locale: z.string().min(1),
  weekStartsOn: z.number().int().min(0).max(6),
  uiPreferences: uiPreferencesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserProfileDto = z.infer<typeof userProfileDtoSchema>;

export const updateUserProfileInputSchema = z.object({
  timezone: z.string().min(1).optional(),
  locale: z.string().min(1).optional(),
  weekStartsOn: z.number().int().min(0).max(6).optional(),
  uiPreferences: uiPreferencesSchema.optional(),
  /** Partial sidebar prefs — merged server-side onto existing uiPreferences.tasksSidebar. */
  tasksSidebar: tasksSidebarPreferencesSchema.partial().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileInputSchema>;
