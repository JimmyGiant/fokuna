/**
 * Per-list Aufgaben view preferences — account-scoped via `ui_preferences.tasksListViews`.
 * Keys cover smart filters, categories, labels, and priority sidebar views.
 * Goals are out of scope until that surface is production-ready.
 */

export const TASKS_LIST_GROUPING_VALUES = [
  "none",
  "date",
  "added",
  "deadline",
  "priority",
  "label",
] as const;

export const TASKS_LIST_SORTING_VALUES = [
  "manual",
  "name",
  "date",
  "added",
  "deadline",
  "priority",
] as const;

export const TASKS_LIST_SORT_DIRECTION_VALUES = ["asc", "desc"] as const;

export const TASKS_LIST_DATE_FILTER_VALUES = [
  "all",
  "today",
  "this_week",
  "next_7_days",
  "this_month",
  "next_30_days",
  "no_date",
] as const;

export const TASKS_LIST_PRIORITY_VALUES = ["urgent", "medium", "low", "none"] as const;

export type TasksListGrouping = (typeof TASKS_LIST_GROUPING_VALUES)[number];
export type TasksListSorting = (typeof TASKS_LIST_SORTING_VALUES)[number];
export type TasksListSortDirection = (typeof TASKS_LIST_SORT_DIRECTION_VALUES)[number];
export type TasksListDateFilter = (typeof TASKS_LIST_DATE_FILTER_VALUES)[number];
export type TasksListPriorityValue = (typeof TASKS_LIST_PRIORITY_VALUES)[number];

export interface TasksListViewFilters {
  date: TasksListDateFilter;
  /** Empty = all priorities. */
  priorities: TasksListPriorityValue[];
  /** Empty = all labels. */
  labelIds: string[];
}

export interface TasksListViewPreferences {
  showCompleted: boolean;
  grouping: TasksListGrouping;
  sorting: TasksListSorting;
  sortDirection: TasksListSortDirection;
  filters: TasksListViewFilters;
}

/** Partial PATCH payload — filters may be updated field-wise. */
export type TasksListViewPreferencesPatch = {
  showCompleted?: boolean;
  grouping?: TasksListGrouping;
  sorting?: TasksListSorting;
  sortDirection?: TasksListSortDirection;
  filters?: Partial<TasksListViewFilters>;
};

export type TasksListViewsMap = Record<string, TasksListViewPreferences>;

export interface TasksListViewIdentity {
  filter?: string | null;
  categoryId?: string | null;
  labelId?: string | null;
  priority?: string | null;
}

export interface TasksListViewCapabilities {
  showCompleted: boolean;
  grouping: boolean;
  sorting: boolean;
  filterDate: boolean;
  filterPriority: boolean;
  filterLabel: boolean;
}

export const DEFAULT_TASKS_LIST_VIEW_PREFERENCES: TasksListViewPreferences = {
  showCompleted: false,
  grouping: "none",
  sorting: "manual",
  sortDirection: "asc",
  filters: {
    date: "all",
    priorities: [],
    labelIds: [],
  },
};

const GROUPING_SET = new Set<string>(TASKS_LIST_GROUPING_VALUES);
const SORTING_SET = new Set<string>(TASKS_LIST_SORTING_VALUES);
const DIRECTION_SET = new Set<string>(TASKS_LIST_SORT_DIRECTION_VALUES);
const DATE_FILTER_SET = new Set<string>(TASKS_LIST_DATE_FILTER_VALUES);
const PRIORITY_SET = new Set<string>(TASKS_LIST_PRIORITY_VALUES);

/** Stable view key for profile storage + client cache. */
export function tasksListViewKey(identity: TasksListViewIdentity): string {
  if (identity.categoryId) return `category:${identity.categoryId}`;
  if (identity.labelId) return `label:${identity.labelId}`;
  if (identity.priority) return `priority:${normalizePriorityKey(identity.priority)}`;
  const filter = identity.filter?.trim() || "all";
  return `smart:${filter}`;
}

export function tasksListViewCapabilities(viewKey: string): TasksListViewCapabilities {
  const isToday = viewKey === "smart:today";
  const isPriority = viewKey.startsWith("priority:");
  const isLabel = viewKey.startsWith("label:");
  return {
    showCompleted: true,
    // Heute already groups by overdue / today — dynamic grouping stays off.
    grouping: !isToday,
    sorting: true,
    filterDate: true,
    filterPriority: !isPriority,
    filterLabel: !isLabel,
  };
}

export function normalizeTasksListViewPreferences(
  input: TasksListViewPreferencesPatch,
): TasksListViewPreferences {
  const filtersIn: Partial<TasksListViewFilters> = input.filters ?? {};
  return {
    showCompleted:
      typeof input.showCompleted === "boolean"
        ? input.showCompleted
        : DEFAULT_TASKS_LIST_VIEW_PREFERENCES.showCompleted,
    grouping: asEnum(input.grouping, GROUPING_SET, DEFAULT_TASKS_LIST_VIEW_PREFERENCES.grouping),
    sorting: asEnum(input.sorting, SORTING_SET, DEFAULT_TASKS_LIST_VIEW_PREFERENCES.sorting),
    sortDirection: asEnum(
      input.sortDirection,
      DIRECTION_SET,
      DEFAULT_TASKS_LIST_VIEW_PREFERENCES.sortDirection,
    ),
    filters: {
      date: asEnum(
        filtersIn.date,
        DATE_FILTER_SET,
        DEFAULT_TASKS_LIST_VIEW_PREFERENCES.filters.date,
      ),
      priorities: uniqueEnums(filtersIn.priorities, PRIORITY_SET),
      labelIds: uniqueStrings(filtersIn.labelIds),
    },
  };
}

/** Merge partial patch onto an existing (already normalized) preference object. */
export function mergeTasksListViewPreferences(
  current: TasksListViewPreferences,
  patch: TasksListViewPreferencesPatch,
): TasksListViewPreferences {
  return normalizeTasksListViewPreferences({
    showCompleted: patch.showCompleted ?? current.showCompleted,
    grouping: patch.grouping ?? current.grouping,
    sorting: patch.sorting ?? current.sorting,
    sortDirection: patch.sortDirection ?? current.sortDirection,
    filters: {
      ...current.filters,
      ...(patch.filters ?? {}),
    },
  });
}

export function normalizeTasksListViewsMap(raw: unknown): TasksListViewsMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: TasksListViewsMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isValidViewKey(key)) continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const normalized = normalizeTasksListViewPreferences(
      value as Partial<TasksListViewPreferences>,
    );
    if (!tasksListViewPreferencesEqual(normalized, DEFAULT_TASKS_LIST_VIEW_PREFERENCES)) {
      out[key] = normalized;
    }
  }
  return out;
}

export function resolveTasksListViewsMap(uiPreferences: unknown): TasksListViewsMap {
  const ui =
    uiPreferences && typeof uiPreferences === "object" && !Array.isArray(uiPreferences)
      ? (uiPreferences as { tasksListViews?: unknown })
      : {};
  return normalizeTasksListViewsMap(ui.tasksListViews);
}

export function resolveTasksListViewPreferences(
  uiPreferences: unknown,
  viewKey: string,
): TasksListViewPreferences {
  const map = resolveTasksListViewsMap(uiPreferences);
  const stored = map[viewKey];
  const base = stored
    ? normalizeTasksListViewPreferences(stored)
    : { ...DEFAULT_TASKS_LIST_VIEW_PREFERENCES, filters: { ...DEFAULT_TASKS_LIST_VIEW_PREFERENCES.filters, priorities: [], labelIds: [] } };

  return applyViewCapabilityConstraints(base, tasksListViewCapabilities(viewKey));
}

/** Manual mode: user Abschnitte + DnD. Any non-default sort/group/filter → derived mode. */
export function isTasksListViewManualMode(prefs: TasksListViewPreferences): boolean {
  return (
    prefs.grouping === "none" &&
    prefs.sorting === "manual" &&
    prefs.filters.date === "all" &&
    prefs.filters.priorities.length === 0 &&
    prefs.filters.labelIds.length === 0
  );
}

export function tasksListViewHasDeviation(prefs: TasksListViewPreferences): boolean {
  return !tasksListViewPreferencesEqual(prefs, DEFAULT_TASKS_LIST_VIEW_PREFERENCES);
}

/** Count of non-default sort-section fields (for section badge). */
export function countTasksListSortDeviations(
  prefs: TasksListViewPreferences,
  capabilities: TasksListViewCapabilities,
): number {
  let count = 0;
  if (capabilities.grouping && prefs.grouping !== "none") count += 1;
  if (capabilities.sorting && prefs.sorting !== "manual") count += 1;
  return count;
}

export function countTasksListFilterDeviations(
  prefs: TasksListViewPreferences,
  capabilities: TasksListViewCapabilities,
): number {
  let count = 0;
  if (capabilities.filterDate && prefs.filters.date !== "all") count += 1;
  if (capabilities.filterPriority && prefs.filters.priorities.length > 0) count += 1;
  if (capabilities.filterLabel && prefs.filters.labelIds.length > 0) count += 1;
  return count;
}

export function tasksListViewPreferencesEqual(
  a: TasksListViewPreferences,
  b: TasksListViewPreferences,
): boolean {
  return (
    a.showCompleted === b.showCompleted &&
    a.grouping === b.grouping &&
    a.sorting === b.sorting &&
    a.sortDirection === b.sortDirection &&
    a.filters.date === b.filters.date &&
    sameStringSet(a.filters.priorities, b.filters.priorities) &&
    sameStringSet(a.filters.labelIds, b.filters.labelIds)
  );
}

function applyViewCapabilityConstraints(
  prefs: TasksListViewPreferences,
  capabilities: TasksListViewCapabilities,
): TasksListViewPreferences {
  return normalizeTasksListViewPreferences({
    ...prefs,
    grouping: capabilities.grouping ? prefs.grouping : "none",
    filters: {
      ...prefs.filters,
      priorities: capabilities.filterPriority ? prefs.filters.priorities : [],
      labelIds: capabilities.filterLabel ? prefs.filters.labelIds : [],
    },
  });
}

function isValidViewKey(key: string): boolean {
  return (
    key.startsWith("smart:") ||
    key.startsWith("category:") ||
    key.startsWith("label:") ||
    key.startsWith("priority:")
  );
}

function normalizePriorityKey(value: string): string {
  return value === "high" ? "urgent" : value;
}

function asEnum<T extends string>(value: unknown, allowed: Set<string>, fallback: T): T {
  return typeof value === "string" && allowed.has(value) ? (value as T) : fallback;
}

function uniqueEnums<T extends string>(values: unknown, allowed: Set<string>): T[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const out: T[] = [];
  for (const value of values) {
    if (typeof value !== "string" || !allowed.has(value) || seen.has(value)) continue;
    seen.add(value);
    out.push(value as T);
  }
  return out;
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (typeof value !== "string" || !value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function sameStringSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((value) => set.has(value));
}
