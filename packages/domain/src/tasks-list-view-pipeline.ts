/**
 * Pure list-view pipeline helpers: date filters, sort, and derived grouping buckets.
 * Presentation (Abschnitte UI) stays in the app; this module only assigns keys/order.
 */

import { toIsoDateString, todayIsoDateString } from "./dates";
import type {
  TasksListDateFilter,
  TasksListGrouping,
  TasksListPriorityValue,
  TasksListSortDirection,
  TasksListSorting,
  TasksListViewFilters,
  TasksListViewPreferences,
} from "./tasks-list-view-preferences";

export interface ListViewTaskRef {
  id: string;
  title: string;
  sortOrder: number;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  labelIds: string[];
  parentTaskId?: string | null;
  isCompleted?: boolean;
}

export type DerivedGroupKey =
  | "overdue"
  | "today"
  | "this_week"
  | "later"
  | "no_date"
  | "added_today"
  | "added_this_week"
  | "added_earlier"
  | `priority:${TasksListPriorityValue}`
  | `label:${string}`
  | "label:none";

export const DERIVED_GROUP_ORDER: Record<string, number> = {
  overdue: 0,
  today: 1,
  this_week: 2,
  later: 3,
  no_date: 4,
  added_today: 0,
  added_this_week: 1,
  added_earlier: 2,
  "priority:urgent": 0,
  "priority:medium": 1,
  "priority:low": 2,
  "priority:none": 3,
  "label:none": 10_000,
};

export const DERIVED_GROUP_TITLES_DE: Record<string, string> = {
  overdue: "Überfällig",
  today: "Heute",
  this_week: "Diese Woche",
  later: "Später",
  no_date: "Kein Datum",
  added_today: "Heute hinzugefügt",
  added_this_week: "Diese Woche hinzugefügt",
  added_earlier: "Früher hinzugefügt",
  "priority:urgent": "Priorität Hoch",
  "priority:medium": "Priorität Mittel",
  "priority:low": "Priorität Niedrig",
  "priority:none": "Keine Priorität",
  "label:none": "Ohne Etikett",
};

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

export function taskMatchesListViewFilters(
  task: Pick<ListViewTaskRef, "dueDate" | "priority" | "labelIds">,
  filters: TasksListViewFilters,
  today = todayIsoDateString(),
): boolean {
  if (!matchesDateFilter(task.dueDate, filters.date, today)) return false;
  if (filters.priorities.length > 0) {
    const priority = normalizePriority(task.priority);
    if (!filters.priorities.includes(priority)) return false;
  }
  if (filters.labelIds.length > 0) {
    if (!filters.labelIds.some((id) => task.labelIds.includes(id))) return false;
  }
  return true;
}

export function derivedGroupKeyForTask(
  task: Pick<ListViewTaskRef, "dueDate" | "createdAt" | "priority" | "labelIds">,
  grouping: TasksListGrouping,
  today = todayIsoDateString(),
): DerivedGroupKey | null {
  if (grouping === "none") return null;
  if (grouping === "date" || grouping === "deadline") {
    return dueDateGroupKey(task.dueDate, today);
  }
  if (grouping === "added") {
    return addedDateGroupKey(task.createdAt, today);
  }
  if (grouping === "priority") {
    return `priority:${normalizePriority(task.priority)}`;
  }
  // label — first label id by stable sort, else none
  if (task.labelIds.length === 0) return "label:none";
  const sorted = [...task.labelIds].sort((a, b) => a.localeCompare(b));
  return `label:${sorted[0]}`;
}

export function compareTasksForListView(
  a: ListViewTaskRef,
  b: ListViewTaskRef,
  sorting: TasksListSorting,
  direction: TasksListSortDirection,
): number {
  if (sorting === "manual") {
    return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
  }

  let cmp = 0;
  switch (sorting) {
    case "name":
      cmp = a.title.localeCompare(b.title, "de", { sensitivity: "base" });
      break;
    case "date":
    case "deadline":
      cmp = compareNullableDates(a.dueDate, b.dueDate, direction === "asc");
      // date nulls already ordered; skip direction flip below for null handling
      if (a.dueDate === null || b.dueDate === null) {
        return cmp || a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
      }
      break;
    case "added":
      cmp = a.createdAt.localeCompare(b.createdAt);
      break;
    case "priority":
      cmp =
        (PRIORITY_RANK[normalizePriority(a.priority)] ?? 99) -
        (PRIORITY_RANK[normalizePriority(b.priority)] ?? 99);
      break;
    default:
      cmp = a.sortOrder - b.sortOrder;
  }

  if (direction === "desc") cmp = -cmp;
  return cmp || a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
}

export function sortTasksForListView<T extends ListViewTaskRef>(
  tasks: T[],
  prefs: Pick<TasksListViewPreferences, "sorting" | "sortDirection">,
): T[] {
  const next = [...tasks];
  next.sort((a, b) =>
    compareTasksForListView(a, b, prefs.sorting, prefs.sortDirection),
  );
  return next;
}

/**
 * Rewrite sibling `sortOrder` for display when sorting ≠ manual.
 * Does not persist — safe while DnD is disabled in derived mode.
 */
export function applyListViewSortOrders<T extends ListViewTaskRef>(
  tasks: T[],
  prefs: Pick<TasksListViewPreferences, "sorting" | "sortDirection">,
): T[] {
  if (prefs.sorting === "manual") return tasks;

  const byParent = new Map<string | null, T[]>();
  for (const task of tasks) {
    const parent = task.parentTaskId ?? null;
    const list = byParent.get(parent) ?? [];
    list.push(task);
    byParent.set(parent, list);
  }

  const orderById = new Map<string, number>();
  for (const siblings of byParent.values()) {
    const sorted = sortTasksForListView(siblings, prefs);
    sorted.forEach((task, index) => {
      orderById.set(task.id, index);
    });
  }

  return tasks.map((task) => ({
    ...task,
    sortOrder: orderById.get(task.id) ?? task.sortOrder,
  }));
}

export function orderDerivedGroupKeys(
  keys: string[],
  grouping: TasksListGrouping,
  labelTitleById?: Map<string, string>,
): string[] {
  const unique = [...new Set(keys)];
  unique.sort((a, b) => {
    const ao = DERIVED_GROUP_ORDER[a];
    const bo = DERIVED_GROUP_ORDER[b];
    if (ao !== undefined && bo !== undefined) return ao - bo;
    if (ao !== undefined) return -1;
    if (bo !== undefined) return 1;
    if (grouping === "label") {
      const at = titleForDerivedGroup(a, labelTitleById);
      const bt = titleForDerivedGroup(b, labelTitleById);
      return at.localeCompare(bt, "de");
    }
    return a.localeCompare(b, "de");
  });
  return unique;
}

export function titleForDerivedGroup(
  key: string,
  labelTitleById?: Map<string, string>,
): string {
  if (key.startsWith("label:") && key !== "label:none") {
    const id = key.slice("label:".length);
    return labelTitleById?.get(id) ?? "Etikett";
  }
  return DERIVED_GROUP_TITLES_DE[key] ?? key;
}

function matchesDateFilter(
  dueDate: string | null,
  filter: TasksListDateFilter,
  today: string,
): boolean {
  if (filter === "all") return true;
  if (filter === "no_date") return dueDate === null;
  if (dueDate === null) return false;

  if (filter === "today") return dueDate === today;

  const todayDate = parseIsoDate(today);
  const due = parseIsoDate(dueDate);
  if (!todayDate || !due) return false;

  if (filter === "this_week") {
    const { start, end } = weekBounds(todayDate);
    return due >= start && due <= end;
  }
  if (filter === "next_7_days") {
    const end = addDays(todayDate, 7);
    return due >= todayDate && due <= end;
  }
  if (filter === "this_month") {
    return due.getFullYear() === todayDate.getFullYear() && due.getMonth() === todayDate.getMonth();
  }
  if (filter === "next_30_days") {
    const end = addDays(todayDate, 30);
    return due >= todayDate && due <= end;
  }
  return true;
}

function dueDateGroupKey(dueDate: string | null, today: string): DerivedGroupKey {
  if (!dueDate) return "no_date";
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  const todayDate = parseIsoDate(today);
  const due = parseIsoDate(dueDate);
  if (!todayDate || !due) return "later";
  const { end } = weekBounds(todayDate);
  if (due <= end) return "this_week";
  return "later";
}

function addedDateGroupKey(createdAt: string, today: string): DerivedGroupKey {
  const createdDay = createdAt.slice(0, 10);
  if (createdDay === today) return "added_today";
  const todayDate = parseIsoDate(today);
  const created = parseIsoDate(createdDay);
  if (!todayDate || !created) return "added_earlier";
  const { start } = weekBounds(todayDate);
  if (created >= start) return "added_this_week";
  return "added_earlier";
}

function normalizePriority(value: string): TasksListPriorityValue {
  if (value === "high" || value === "urgent") return "urgent";
  if (value === "medium" || value === "low" || value === "none") return value;
  return "none";
}

/** Asc: dated first chronologically, nulls last. Desc handled by caller flip for non-null. */
function compareNullableDates(
  a: string | null,
  b: string | null,
  nullsLast: boolean,
): number {
  if (a === null && b === null) return 0;
  if (a === null) return nullsLast ? 1 : -1;
  if (b === null) return nullsLast ? -1 : 1;
  return a.localeCompare(b);
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parts = value.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday-start week (Fokuna default weekStartsOn = 1). */
function weekBounds(today: Date): { start: Date; end: Date } {
  const day = today.getDay(); // 0 Sun
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const start = addDays(today, offsetToMonday);
  const end = addDays(start, 6);
  // normalize to date-only comparisons via timestamps at local midnight
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

/** Exported for tests — format helper using domain date utils. */
export function isoDateFromParts(year: number, monthIndex: number, day: number): string {
  return toIsoDateString(new Date(year, monthIndex, day));
}
