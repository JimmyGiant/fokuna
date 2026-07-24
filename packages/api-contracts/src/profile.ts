import { z } from "zod";

export const tasksSidebarNavReorderIdSchema = z.enum([
  "all",
  "favorites",
  "today",
  "inbox",
]);
export const tasksSidebarSectionIdSchema = z.enum([
  "categories",
  "goals",
  "labels",
  "priority",
]);
export const tasksSidebarHideableIdSchema = z.enum([
  "all",
  "favorites",
  "today",
  "categories",
  "goals",
  "labels",
  "priority",
]);

export const tasksSidebarPreferencesSchema = z.object({
  navOrder: z.array(tasksSidebarNavReorderIdSchema).length(4),
  sectionOrder: z.array(tasksSidebarSectionIdSchema).length(4),
  hiddenIds: z.array(tasksSidebarHideableIdSchema),
});

export const tasksPreferencesSchema = z.object({
  completeAnimations: z.boolean(),
});

export const tasksListGroupingSchema = z.enum([
  "none",
  "date",
  "added",
  "deadline",
  "priority",
  "label",
]);
export const tasksListSortingSchema = z.enum([
  "manual",
  "name",
  "date",
  "added",
  "deadline",
  "priority",
]);
export const tasksListSortDirectionSchema = z.enum(["asc", "desc"]);
export const tasksListDateFilterSchema = z.enum([
  "all",
  "today",
  "this_week",
  "next_7_days",
  "this_month",
  "next_30_days",
  "no_date",
]);
export const tasksListPriorityFilterSchema = z.enum(["urgent", "medium", "low", "none"]);

export const tasksListViewFiltersSchema = z.object({
  date: tasksListDateFilterSchema,
  priorities: z.array(tasksListPriorityFilterSchema),
  labelIds: z.array(z.string().min(1)),
});

export const tasksListViewPreferencesSchema = z.object({
  showCompleted: z.boolean(),
  grouping: tasksListGroupingSchema,
  sorting: tasksListSortingSchema,
  sortDirection: tasksListSortDirectionSchema,
  filters: tasksListViewFiltersSchema,
});

/** Sparse map — only non-default views need to be stored. */
export const tasksListViewsMapSchema = z.record(
  z.string().min(1),
  tasksListViewPreferencesSchema,
);

export const blocksPreferencesSchema = z.object({
  railIds: z.array(z.string().min(1)),
  hubHintSeen: z.boolean(),
});

export const uiPreferencesSchema = z.object({
  tasksSidebar: tasksSidebarPreferencesSchema.optional(),
  tasks: tasksPreferencesSchema.optional(),
  tasksListViews: tasksListViewsMapSchema.optional(),
  blocks: blocksPreferencesSchema.optional(),
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
  /** Partial Aufgaben prefs — merged server-side onto existing uiPreferences.tasks. */
  tasks: tasksPreferencesSchema.partial().optional(),
  /**
   * Partial per-view list prefs — deep-merged per view key onto uiPreferences.tasksListViews.
   * Pass `null` for a view key to clear it back to defaults (omit from map).
   */
  tasksListViews: z
    .record(
      z.string().min(1),
      tasksListViewPreferencesSchema
        .partial()
        .extend({
          filters: tasksListViewFiltersSchema.partial().optional(),
        })
        .nullable(),
    )
    .optional(),
  /** Partial Zeitblöcke prefs — merged server-side onto existing uiPreferences.blocks. */
  blocks: blocksPreferencesSchema.partial().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileInputSchema>;
