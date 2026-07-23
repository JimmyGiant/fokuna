/**
 * Completed-task display window.
 *
 * Product goal: avoid unbounded completed rows in each list/section bucket and
 * eventually shrink payloads. Today the web client slices an already-fetched
 * set via `applyCompletedTaskWindow`. The logical next stage is server-side
 * paging (`completedAt` desc, cursor/limit per bucket) feeding the same
 * reveal/remaining contract — keep this module as the seam for that swap.
 */

export const COMPLETED_TASK_PAGE_SIZE = 20;

/** Pseudo-buckets that are not task.groupKey values. */
export const COMPLETED_WINDOW_BUCKET = {
  /** Flat lists (Alle / Favoriten / Eingang / Priorität / …). */
  list: "__completed_window_list__",
  /** Heute → Überfällig group. */
  overdue: "__completed_window_overdue__",
} as const;

export function compareCompletedAtDesc(
  a: { id: string; completedAt: string | null },
  b: { id: string; completedAt: string | null },
): number {
  const aAt = a.completedAt ?? "";
  const bAt = b.completedAt ?? "";
  if (aAt !== bAt) return bAt.localeCompare(aAt);
  return a.id.localeCompare(b.id);
}

export function formatRemainingCompletedLabel(remaining: number): string {
  const n = Math.max(0, remaining);
  return n === 1
    ? "1 weitere erledigte Aufgabe"
    : `${n} weitere erledigte Aufgaben`;
}

export function resolveCompletedRevealLimit(
  revealByBucket: Record<string, number>,
  bucketKey: string,
): number {
  return revealByBucket[bucketKey] ?? COMPLETED_TASK_PAGE_SIZE;
}

type WindowTask = {
  id: string;
  parentTaskId: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  sortOrder: number;
  groupKey: string;
};

export type CompletedTaskWindowResult<T extends WindowTask> = {
  /** Tasks to flatten/render: open trees + window completed roots (open-first). */
  displayTasks: T[];
  /** Unrevealed completed roots per bucket (for load-more labels). */
  remainingByBucket: Record<string, number>;
};

/**
 * Per-bucket window over **completed roots** (newest `completedAt` first).
 * Open roots stay fully visible; each revealed completed root keeps its subtree.
 * Collapsed descendants never appear (flatten respects expansion as today).
 */
export function applyCompletedTaskWindow<T extends WindowTask>(input: {
  tasks: T[];
  showCompleted: boolean;
  revealByBucket: Record<string, number>;
  /** Bucket key for each root task. */
  bucketKeyForRoot: (root: T) => string;
}): CompletedTaskWindowResult<T> {
  const { tasks, showCompleted, revealByBucket, bucketKeyForRoot } = input;
  if (!showCompleted) {
    return { displayTasks: tasks, remainingByBucket: {} };
  }

  const byParent = new Map<string, T[]>();
  for (const task of tasks) {
    if (!task.parentTaskId) continue;
    const list = byParent.get(task.parentTaskId) ?? [];
    list.push(task);
    byParent.set(task.parentTaskId, list);
  }

  const roots = tasks.filter((task) => !task.parentTaskId);
  const rootsByBucket = new Map<string, T[]>();
  for (const root of roots) {
    const key = bucketKeyForRoot(root);
    const list = rootsByBucket.get(key) ?? [];
    list.push(root);
    rootsByBucket.set(key, list);
  }

  const remainingByBucket: Record<string, number> = {};
  const excludedRootIds = new Set<string>();
  const completedSortPatch = new Map<string, number>();

  for (const [bucketKey, bucketRoots] of rootsByBucket) {
    const openRoots = bucketRoots
      .filter((root) => !root.isCompleted)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
    const completedRoots = bucketRoots
      .filter((root) => root.isCompleted)
      .sort(compareCompletedAtDesc);

    const limit = resolveCompletedRevealLimit(revealByBucket, bucketKey);
    const visibleCompleted = completedRoots.slice(0, limit);
    remainingByBucket[bucketKey] = Math.max(0, completedRoots.length - visibleCompleted.length);

    for (const root of completedRoots.slice(limit)) {
      excludedRootIds.add(root.id);
    }

    const maxOpenSort = openRoots.reduce((max, root) => Math.max(max, root.sortOrder), 0);
    visibleCompleted.forEach((root, index) => {
      completedSortPatch.set(root.id, maxOpenSort + 1 + index);
    });
  }

  function collectDescendants(rootId: string): Set<string> {
    const ids = new Set<string>();
    const stack = [...(byParent.get(rootId) ?? [])];
    while (stack.length > 0) {
      const node = stack.pop()!;
      ids.add(node.id);
      for (const child of byParent.get(node.id) ?? []) stack.push(child);
    }
    return ids;
  }

  const excludedIds = new Set<string>();
  for (const rootId of excludedRootIds) {
    excludedIds.add(rootId);
    for (const id of collectDescendants(rootId)) excludedIds.add(id);
  }

  const displayTasks = tasks
    .filter((task) => !excludedIds.has(task.id))
    .map((task) => {
      const patchedSort = completedSortPatch.get(task.id);
      if (patchedSort === undefined) return task;
      return { ...task, sortOrder: patchedSort };
    });

  return { displayTasks, remainingByBucket };
}
