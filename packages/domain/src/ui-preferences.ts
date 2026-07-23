/**
 * Aufgaben-Sidebar L2 prefs — account-scoped, syncable across web/native.
 * "all" is always first and never hidden; "inbox" is never hidden.
 */

export const DEFAULT_TASKS_SIDEBAR_NAV_ORDER = ["favorites", "today", "inbox"] as const;
export const DEFAULT_TASKS_SIDEBAR_SECTION_ORDER = [
  "categories",
  "goals",
  "labels",
  "priority",
] as const;

export type TasksSidebarNavReorderId = (typeof DEFAULT_TASKS_SIDEBAR_NAV_ORDER)[number];
export type TasksSidebarSectionId = (typeof DEFAULT_TASKS_SIDEBAR_SECTION_ORDER)[number];
export type TasksSidebarHideableId =
  | "favorites"
  | "today"
  | TasksSidebarSectionId;

export interface TasksSidebarPreferences {
  /** Order of Favoriten / Heute / Eingang under fixed „Alle Aufgaben“. */
  navOrder: TasksSidebarNavReorderId[];
  /** Order of taxonomy blocks (Kategorien, Ziele, Labels, Priorität). */
  sectionOrder: TasksSidebarSectionId[];
  /** Hidden entries — defaults empty (everything visible). */
  hiddenIds: TasksSidebarHideableId[];
}

export interface UiPreferences {
  tasksSidebar?: TasksSidebarPreferences;
}

const NAV_SET = new Set<string>(DEFAULT_TASKS_SIDEBAR_NAV_ORDER);
const SECTION_SET = new Set<string>(DEFAULT_TASKS_SIDEBAR_SECTION_ORDER);
const HIDEABLE_SET = new Set<string>([
  "favorites",
  "today",
  ...DEFAULT_TASKS_SIDEBAR_SECTION_ORDER,
]);

export function resolveTasksSidebarPreferences(raw: unknown): TasksSidebarPreferences {
  const ui =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as UiPreferences)
      : ({} as UiPreferences);
  return normalizeTasksSidebarPreferences(ui.tasksSidebar ?? {});
}

/** Normalize order arrays: keep known ids, append missing defaults, drop unknowns. */
export function normalizeTasksSidebarPreferences(
  input: Partial<TasksSidebarPreferences>,
): TasksSidebarPreferences {
  return {
    navOrder: uniquePreserveOrder(
      [...(input.navOrder ?? []), ...DEFAULT_TASKS_SIDEBAR_NAV_ORDER],
      DEFAULT_TASKS_SIDEBAR_NAV_ORDER,
    ),
    sectionOrder: uniquePreserveOrder(
      [...(input.sectionOrder ?? []), ...DEFAULT_TASKS_SIDEBAR_SECTION_ORDER],
      DEFAULT_TASKS_SIDEBAR_SECTION_ORDER,
    ),
    hiddenIds: [...new Set(input.hiddenIds ?? [])].filter((id): id is TasksSidebarHideableId =>
      HIDEABLE_SET.has(id),
    ),
  };
}

function uniquePreserveOrder<T extends string>(
  candidates: readonly string[],
  allowed: readonly T[],
): T[] {
  const allowedSet = new Set<string>(allowed);
  const seen = new Set<string>();
  const result: T[] = [];
  for (const id of candidates) {
    if (!allowedSet.has(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id as T);
  }
  return result;
}

export function isTasksSidebarNavReorderId(value: string): value is TasksSidebarNavReorderId {
  return NAV_SET.has(value);
}

export function isTasksSidebarSectionId(value: string): value is TasksSidebarSectionId {
  return SECTION_SET.has(value);
}
