import { TASK_MAX_DEPTH } from "./task-hierarchy";

function arrayMove<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

/** Root tasks in a section/list group. */
export function groupContainerKey(groupKey: string): string {
  return `group:${groupKey}`;
}

/** Sibling list under a parent task. */
export function parentContainerKey(parentId: string): string {
  return `parent:${parentId}`;
}

export function parseContainerKey(
  key: string,
): { type: "group"; groupKey: string } | { type: "parent"; parentId: string } | null {
  if (key.startsWith("group:")) {
    return { type: "group", groupKey: key.slice("group:".length) };
  }
  if (key.startsWith("parent:")) {
    return { type: "parent", parentId: key.slice("parent:".length) };
  }
  return null;
}

export type TaskDragNode = {
  id: string;
  parentTaskId: string | null;
  groupKey: string;
  sortOrder?: number;
};

/** Map container → ordered sibling ids. */
export type TaskDragLayout = Record<string, string[]>;

export function containerKeyForTask(task: TaskDragNode): string {
  return task.parentTaskId
    ? parentContainerKey(task.parentTaskId)
    : groupContainerKey(task.groupKey);
}

export function buildTaskDragLayout(tasks: TaskDragNode[]): TaskDragLayout {
  const layout: TaskDragLayout = {};
  const ordered = [...tasks].sort((a, b) => {
    const ao = a.sortOrder ?? 0;
    const bo = b.sortOrder ?? 0;
    if (ao !== bo) return ao - bo;
    return a.id.localeCompare(b.id);
  });

  for (const task of ordered) {
    const key = containerKeyForTask(task);
    if (!layout[key]) layout[key] = [];
    layout[key].push(task.id);
  }

  return layout;
}

export function findContainerOfId(layout: TaskDragLayout, id: string): string | null {
  for (const [key, ids] of Object.entries(layout)) {
    if (ids.includes(id)) return key;
  }
  return null;
}

export type TaskPlacement = {
  id: string;
  groupKey: string;
  parentTaskId: string | null;
  sortOrder: number;
};

export function layoutToPlacements(
  layout: TaskDragLayout,
  tasksById: Map<string, TaskDragNode>,
): TaskPlacement[] {
  const placements: TaskPlacement[] = [];

  for (const [key, ids] of Object.entries(layout)) {
    const parsed = parseContainerKey(key);
    if (!parsed) continue;

    ids.forEach((id, sortOrder) => {
      const task = tasksById.get(id);
      if (!task) return;

      if (parsed.type === "group") {
        placements.push({
          id,
          groupKey: parsed.groupKey,
          parentTaskId: null,
          sortOrder,
        });
        return;
      }

      const parent = tasksById.get(parsed.parentId);
      placements.push({
        id,
        groupKey: parent?.groupKey ?? task.groupKey,
        parentTaskId: parsed.parentId,
        sortOrder,
      });
    });
  }

  return placements;
}

/** Depth of a node if placed under `parentId` (null = root → depth 1). */
export function depthIfParent(
  tasksById: Map<string, TaskDragNode>,
  parentId: string | null,
): number {
  if (!parentId) return 1;
  let depth = 2;
  let cursor: string | null = parentId;
  const guard = new Set<string>();
  while (cursor) {
    if (guard.has(cursor)) break;
    guard.add(cursor);
    const node = tasksById.get(cursor);
    if (!node?.parentTaskId) break;
    cursor = node.parentTaskId;
    depth += 1;
  }
  return depth;
}

/** Max depth of `taskId` subtree (task itself = 1). */
export function subtreeDepth(tasksById: Map<string, TaskDragNode>, taskId: string): number {
  const children = [...tasksById.values()].filter((task) => task.parentTaskId === taskId);
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((child) => subtreeDepth(tasksById, child.id)));
}

export function canMoveUnderParent(
  tasksById: Map<string, TaskDragNode>,
  activeId: string,
  parentId: string | null,
): boolean {
  if (parentId === activeId) return false;

  let cursor: string | null = parentId;
  const guard = new Set<string>();
  while (cursor) {
    if (cursor === activeId) return false;
    if (guard.has(cursor)) break;
    guard.add(cursor);
    cursor = tasksById.get(cursor)?.parentTaskId ?? null;
  }

  const newRootDepth = depthIfParent(tasksById, parentId);
  const activeSubtree = subtreeDepth(tasksById, activeId);
  const resultingMax = newRootDepth + activeSubtree - 1;
  return resultingMax <= TASK_MAX_DEPTH;
}

export function moveTaskInLayout(
  layout: TaskDragLayout,
  activeId: string,
  overId: string,
  targetContainer: string,
): TaskDragLayout | null {
  const activeContainer = findContainerOfId(layout, activeId);
  if (!activeContainer) return null;

  const next: TaskDragLayout = Object.fromEntries(
    Object.entries(layout).map(([key, ids]) => [key, [...ids]]),
  );

  if (activeContainer === targetContainer) {
    const ids = next[activeContainer] ?? [];
    const from = ids.indexOf(activeId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0 || from === to) return null;
    next[activeContainer] = arrayMove(ids, from, to);
    return next;
  }

  const sourceIds = next[activeContainer] ?? [];
  const activeIndex = sourceIds.indexOf(activeId);
  if (activeIndex < 0) return null;
  sourceIds.splice(activeIndex, 1);
  next[activeContainer] = sourceIds;
  if (sourceIds.length === 0) {
    delete next[activeContainer];
  }

  const dest = [...(next[targetContainer] ?? [])];
  const overIndex = dest.indexOf(overId);
  if (overIndex < 0) {
    // Nesting under a parent: `overId` is the parent, not a child — insert as first child
    // (never append to end; that was the "placeholder jumps under the whole group" bug).
    dest.unshift(activeId);
  } else {
    dest.splice(overIndex, 0, activeId);
  }
  next[targetContainer] = dest;
  return next;
}

/**
 * Live drag-over: same-container reorder, cross-container move, or nest under `overId`.
 * When `nestUnderOver` is true, target container becomes `parent:overId`.
 *
 * Hovering a nested row inserts beside that row (placeholder follows the pointer).
 * Do not retarget nested overs to the parent — that parks the placeholder at the
 * group edge and feels stuck.
 */
export function applyTaskDragOver(input: {
  layout: TaskDragLayout;
  tasksById: Map<string, TaskDragNode>;
  activeId: string;
  overId: string;
  nestUnderOver?: boolean;
}): TaskDragLayout | null {
  const { layout, tasksById, activeId, overId, nestUnderOver = false } = input;
  if (activeId === overId && !nestUnderOver) return null;

  const overContainer = findContainerOfId(layout, overId);
  const activeContainer = findContainerOfId(layout, activeId);
  if (!activeContainer || !overContainer) return null;

  let targetContainer = overContainer;

  if (nestUnderOver) {
    if (!canMoveUnderParent(tasksById, activeId, overId)) {
      return null;
    }
    targetContainer = parentContainerKey(overId);
  } else if (activeContainer !== overContainer) {
    const parsed = parseContainerKey(overContainer);
    const newParent = parsed?.type === "parent" ? parsed.parentId : null;
    if (!canMoveUnderParent(tasksById, activeId, newParent)) {
      return null;
    }
  }

  return moveTaskInLayout(layout, activeId, overId, targetContainer);
}

/** Apply placements onto task list; cascade groupKey to descendants of moved nodes. */
export function applyPlacementsToTasks<T extends TaskDragNode & { sortOrder: number }>(
  tasks: T[],
  placements: TaskPlacement[],
): T[] {
  const byPlacement = new Map(placements.map((placement) => [placement.id, placement]));
  const next = tasks.map((task) => {
    const placement = byPlacement.get(task.id);
    if (!placement) return task;
    return {
      ...task,
      groupKey: placement.groupKey,
      parentTaskId: placement.parentTaskId,
      sortOrder: placement.sortOrder,
    };
  });

  const byId = new Map(next.map((task) => [task.id, task]));

  function cascade(id: string, groupKey: string) {
    for (const [childId, child] of byId) {
      if (child.parentTaskId !== id || child.groupKey === groupKey) continue;
      const updated = { ...child, groupKey };
      byId.set(childId, updated);
      cascade(childId, groupKey);
    }
  }

  for (const placement of placements) {
    cascade(placement.id, placement.groupKey);
  }

  return tasks.map((task) => byId.get(task.id) ?? task);
}
