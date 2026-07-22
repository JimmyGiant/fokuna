import { TASK_MAX_DEPTH } from "./task-hierarchy";
import {
  canMoveUnderParent,
  type TaskDragNode,
  type TaskPlacement,
} from "./task-drag-layout";

function arrayMove<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

/** 0-based depth (root = 0), matching the official dnd-kit SortableTree model. */
export type FlatTreeItem = {
  id: string;
  parentId: string | null;
  depth: number;
  groupKey: string;
  /** Direct + nested descendant ids (for hiding subtree while dragging). */
  descendantIds: string[];
  /**
   * Height of this node’s subtree (self = 1). Used to cap nest depth so
   * parentDepth + subtreeHeight − 1 ≤ TASK_MAX_DEPTH.
   */
  subtreeHeight: number;
};

export type TreeProjection = {
  depth: number;
  maxDepth: number;
  minDepth: number;
  parentId: string | null;
};

function sortTasks<T extends TaskDragNode>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    const ao = a.sortOrder ?? 0;
    const bo = b.sortOrder ?? 0;
    if (ao !== bo) return ao - bo;
    return a.id.localeCompare(b.id);
  });
}

function collectDescendantIds(
  parentId: string,
  childrenByParent: Map<string, TaskDragNode[]>,
): string[] {
  const children = childrenByParent.get(parentId) ?? [];
  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id, ...collectDescendantIds(child.id, childrenByParent));
  }
  return ids;
}

function subtreeHeightOf(
  parentId: string,
  childrenByParent: Map<string, TaskDragNode[]>,
): number {
  const children = childrenByParent.get(parentId) ?? [];
  if (children.length === 0) return 1;
  return (
    1 +
    Math.max(
      ...children.map((child) => subtreeHeightOf(child.id, childrenByParent)),
    )
  );
}

/**
 * Max 0-based indent for `active` so the deepest leaf stays within TASK_MAX_DEPTH.
 * Leaf (height 1) → 4; height 5 chain → 0 (root only).
 */
export function maxIndentForSubtreeHeight(subtreeHeight: number): number {
  return Math.max(0, TASK_MAX_DEPTH - subtreeHeight);
}

/**
 * Flatten tasks in document order for one or more groups.
 * Expanded parents include children; collapsed parents hide them.
 */
export function flattenTasksForTree(
  tasks: TaskDragNode[],
  expandedById: Record<string, boolean>,
  groupKeys?: string[],
): FlatTreeItem[] {
  const childrenByParent = new Map<string, TaskDragNode[]>();
  const rootsByGroup = new Map<string, TaskDragNode[]>();

  for (const task of sortTasks(tasks)) {
    if (task.parentTaskId) {
      const list = childrenByParent.get(task.parentTaskId) ?? [];
      list.push(task);
      childrenByParent.set(task.parentTaskId, list);
    } else {
      const list = rootsByGroup.get(task.groupKey) ?? [];
      list.push(task);
      rootsByGroup.set(task.groupKey, list);
    }
  }

  const keys =
    groupKeys ??
    [...rootsByGroup.keys()].sort((a, b) => {
      if (a === "root") return -1;
      if (b === "root") return 1;
      return a.localeCompare(b, "de");
    });

  const rows: FlatTreeItem[] = [];

  function walk(task: TaskDragNode, depth: number, parentId: string | null) {
    rows.push({
      id: task.id,
      parentId,
      depth,
      groupKey: task.groupKey,
      descendantIds: collectDescendantIds(task.id, childrenByParent),
      subtreeHeight: subtreeHeightOf(task.id, childrenByParent),
    });

    const expanded = expandedById[task.id] !== false;
    if (!expanded) return;

    for (const child of childrenByParent.get(task.id) ?? []) {
      walk(child, depth + 1, task.id);
    }
  }

  for (const groupKey of keys) {
    for (const root of rootsByGroup.get(groupKey) ?? []) {
      walk(root, 0, null);
    }
  }

  return rows;
}

/** Hide the active item's descendants (and collapsed subtrees) while dragging. */
export function removeChildrenOfActive(
  items: FlatTreeItem[],
  activeId: string | null,
): FlatTreeItem[] {
  if (!activeId) return items;
  const active = items.find((item) => item.id === activeId);
  if (!active || active.descendantIds.length === 0) return items;
  const hidden = new Set(active.descendantIds);
  return items.filter((item) => !hidden.has(item.id));
}

/**
 * Horizontal depth steps (Todoist-style).
 * Full indentation width required — no early nest from Math.round at half-width.
 */
function getDepthDelta(offset: number, indentationWidth: number) {
  return Math.trunc(offset / indentationWidth);
}

function getMaxDepth(previousItem: FlatTreeItem | undefined, maxDepth: number) {
  if (previousItem) {
    return Math.min(previousItem.depth + 1, maxDepth);
  }
  return 0;
}

function getMinDepth(nextItem: FlatTreeItem | undefined) {
  if (nextItem) return nextItem.depth;
  return 0;
}

/**
 * Todoist-style projection:
 * - Vertical position = order (sibling under the previous row by default)
 * - Drag right (≥ 1× indentation) = nest under the previous row
 * - Drag left = outdent toward the next item's minimum depth
 * - Nest depth is also capped by the active subtree height (max 5 levels total)
 */
export function getTaskTreeProjection(
  items: FlatTreeItem[],
  activeId: string,
  overId: string,
  dragOffsetX: number,
  indentationWidth: number,
  maxDepth = TASK_MAX_DEPTH - 1,
): TreeProjection | null {
  const overItemIndex = items.findIndex((item) => item.id === overId);
  const activeItemIndex = items.findIndex((item) => item.id === activeId);
  if (overItemIndex < 0 || activeItemIndex < 0) return null;

  const activeItem = items[activeItemIndex]!;
  const overItem = items[overItemIndex]!;

  // Stay within the same Abschnitt while projecting.
  if (activeItem.groupKey !== overItem.groupKey) {
    return {
      depth: 0,
      maxDepth: 0,
      minDepth: 0,
      parentId: null,
    };
  }

  const reordered = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = reordered[overItemIndex - 1];
  const nextItem = reordered[overItemIndex + 1];
  const depthBudget = maxIndentForSubtreeHeight(activeItem.subtreeHeight);
  const structuralMax = getMaxDepth(previousItem, maxDepth);
  const max = Math.min(structuralMax, depthBudget);
  const min = getMinDepth(nextItem);

  // Baseline = same level as the row above (sibling). Horizontal offset adjusts.
  const baselineDepth = previousItem ? previousItem.depth : 0;
  const projectedDepth = baselineDepth + getDepthDelta(dragOffsetX, indentationWidth);

  // Prefer depth budget over next-item min when they conflict (illegal nest zone).
  const depth =
    max < min ? max : Math.min(max, Math.max(min, projectedDepth));

  let parentId: string | null = null;
  if (depth > 0 && previousItem) {
    if (depth === previousItem.depth) {
      parentId = previousItem.parentId;
    } else if (depth > previousItem.depth) {
      parentId = previousItem.id;
    } else {
      parentId =
        reordered
          .slice(0, overItemIndex)
          .reverse()
          .find((item) => item.depth === depth)?.parentId ?? null;
    }
  }

  // Never parent under self / own descendant.
  if (parentId === activeId || activeItem.descendantIds.includes(parentId ?? "")) {
    parentId = previousItem?.parentId ?? null;
    let safeDepth = previousItem ? previousItem.depth : 0;
    if (safeDepth > depthBudget) {
      parentId = null;
      safeDepth = depthBudget;
    }
    return { depth: safeDepth, maxDepth: max, minDepth: min, parentId };
  }

  return { depth, maxDepth: max, minDepth: min, parentId };
}

/**
 * Commit from the *live visible* order during drag (active descendants were hidden).
 * Re-inserts the active subtree after the active row, applies projection to active,
 * then emits placements. Using a fully expanded flatten + overIndex caused jump-back
 * because visible indices ≠ full-tree indices.
 *
 * Returns [] when the projected parent would exceed max nesting depth.
 */
export function commitTaskTreeMove(input: {
  tasks: TaskDragNode[];
  expandedById: Record<string, boolean>;
  activeId: string;
  overId: string;
  projected: TreeProjection;
  /** Visible flat order at drop (already live-reordered; no active descendants). */
  liveOrderedIds: string[];
}): TaskPlacement[] {
  const { tasks, activeId, overId, projected, liveOrderedIds } = input;
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const active = byId.get(activeId);
  if (!active || liveOrderedIds.length === 0) return [];

  const over = byId.get(overId);
  const resolvedGroupKey = over?.groupKey ?? active.groupKey;

  const childrenByParent = new Map<string, TaskDragNode[]>();
  for (const task of sortTasks(tasks)) {
    if (!task.parentTaskId) continue;
    const list = childrenByParent.get(task.parentTaskId) ?? [];
    list.push(task);
    childrenByParent.set(task.parentTaskId, list);
  }

  const activeDescendants = new Set(collectDescendantIds(activeId, childrenByParent));
  const liveSet = new Set(liveOrderedIds);

  let activeParentId = projected.parentId;
  if (
    activeParentId === activeId ||
    (activeParentId != null && activeDescendants.has(activeParentId))
  ) {
    activeParentId = null;
  }

  if (!canMoveUnderParent(byId, activeId, activeParentId)) {
    return [];
  }

  function appendHiddenSubtree(parentId: string, into: string[]) {
    for (const child of childrenByParent.get(parentId) ?? []) {
      if (liveSet.has(child.id)) continue;
      into.push(child.id);
      appendHiddenSubtree(child.id, into);
    }
  }

  const documentOrder: string[] = [];
  for (const id of liveOrderedIds) {
    documentOrder.push(id);
    if (id === activeId) {
      appendHiddenSubtree(activeId, documentOrder);
    }
  }

  const siblingOrder = new Map<string, number>();
  const placements: TaskPlacement[] = [];
  const seen = new Set<string>();

  for (const id of documentOrder) {
    if (seen.has(id)) continue;
    seen.add(id);
    const task = byId.get(id);
    if (!task) continue;

    const isActiveSubtree = id === activeId || activeDescendants.has(id);
    const groupKey = isActiveSubtree ? resolvedGroupKey : task.groupKey;
    const parentTaskId = id === activeId ? activeParentId : task.parentTaskId;
    const parentKey = parentTaskId ?? `root:${groupKey}`;
    const sortOrder = siblingOrder.get(parentKey) ?? 0;
    siblingOrder.set(parentKey, sortOrder + 1);

    placements.push({
      id,
      groupKey,
      parentTaskId,
      sortOrder,
    });
  }

  return placements;
}

/** Merge tree-move placements onto the full task list placements. */
export function mergePlacements(
  base: TaskPlacement[],
  patch: TaskPlacement[],
): TaskPlacement[] {
  const byId = new Map(base.map((placement) => [placement.id, placement]));
  for (const placement of patch) {
    byId.set(placement.id, placement);
  }
  return [...byId.values()];
}

/**
 * True when every root→leaf path in the placement graph is ≤ TASK_MAX_DEPTH.
 * Used as a relocate safety net (UI should already prevent illegal nests).
 */
export function placementsRespectMaxDepth(
  tasks: TaskDragNode[],
  placements: TaskPlacement[],
): boolean {
  const parentById = new Map(tasks.map((task) => [task.id, task.parentTaskId]));
  for (const placement of placements) {
    parentById.set(placement.id, placement.parentTaskId);
  }

  const childrenByParent = new Map<string | null, string[]>();
  for (const id of parentById.keys()) {
    const parentId = parentById.get(id) ?? null;
    const list = childrenByParent.get(parentId) ?? [];
    list.push(id);
    childrenByParent.set(parentId, list);
  }

  const known = new Set(parentById.keys());

  function walk(id: string, depth: number, stack: Set<string>): boolean {
    if (depth > TASK_MAX_DEPTH) return false;
    if (stack.has(id)) return false;
    stack.add(id);
    for (const childId of childrenByParent.get(id) ?? []) {
      if (!known.has(childId)) continue;
      if (!walk(childId, depth + 1, stack)) return false;
    }
    stack.delete(id);
    return true;
  }

  for (const id of childrenByParent.get(null) ?? []) {
    if (!walk(id, 1, new Set())) return false;
  }

  // Nodes whose parent is missing from the set — walk as if rooted.
  for (const id of known) {
    const parentId = parentById.get(id) ?? null;
    if (parentId == null || known.has(parentId)) continue;
    if (!walk(id, 1, new Set())) return false;
  }

  return true;
}
