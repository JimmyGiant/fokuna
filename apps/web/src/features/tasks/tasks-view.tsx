"use client";

import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  defaultAnimateLayoutChanges,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import type { BlockDto, CalendarEntryDto, TaskDto } from "@fokuna/api-contracts";
import {
  applyPlacementsToTasks,
  buildTaskDragLayout,
  canCreateSubtaskAtDepth,
  commitTaskTreeMove,
  flattenTasksForTree,
  getTaskTreeProjection,
  layoutToPlacements,
  mergePlacements,
  removeChildrenOfActive,
  TASK_MAX_INDENT_LEVEL,
  type FlatTreeItem,
  type TaskIndentLevel,
  type TaskPlacement,
} from "@fokuna/domain";
import { FokunaIcon, type IconName } from "@fokuna/icons";
import {
  AddTask,
  BlockRail,
  Button,
  CalendarDrawer,
  CalendarItem,
  Dropdown,
  MetaMenu,
  PageHeader,
  SearchField,
  Switcher,
  TaskGroup,
  TaskListItem,
  getCalendarEntryPosition,
  type BlockRailItem,
  type BlockTone,
  type FokunaContextMenuEntry,
} from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import {
  DnDGhostShell,
  cancelScheduledDragClear,
  resolveSortableInsertIndex,
  sortableItemStyle,
} from "@/components/dnd";
import { apiGet, apiSend } from "@/lib/api";
import { TaskDetailModal } from "./task-detail-modal";
import { TaskDueDateMenuPanel, TaskEstimateMenuPanel } from "./task-property-editor";
import { priorityOptions } from "./task-property-options";
import styles from "./tasks-view.module.css";

const ROOT_GROUP = "root";
/**
 * Flat list + primary „Aufgabe hinzufügen“ target for the active sidebar filter.
 * Must match `matchesFilter` — e.g. inbox only shows `groupKey === "inbox"`.
 */
function primaryGroupKeyForFilter(filter: string): string {
  if (filter === "inbox") return "inbox";
  if (filter === "today") return "today";
  return ROOT_GROUP;
}
/** Todoist-style: full step right = nest, full step left = outdent. */
const INDENTATION_WIDTH = 48;
const DRAG_ACTIVATION_DISTANCE = 8;

const measuring = {
  droppable: { strategy: MeasuringStrategy.Always },
};

/** Prefer the row under the pointer; fallback to closestCenter (MVP §10.1). */
const taskListCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return [pointerHits[pointerHits.length - 1]!];
  }
  return closestCenter(args);
};

function placementsEqual(a: TaskPlacement[], b: TaskPlacement[]): boolean {
  if (a.length !== b.length) return false;
  const serialize = (placement: TaskPlacement) =>
    `${placement.id}:${placement.groupKey}:${placement.parentTaskId ?? ""}:${placement.sortOrder}`;
  const right = new Map(b.map((placement) => [placement.id, serialize(placement)]));
  return a.every((placement) => right.get(placement.id) === serialize(placement));
}

/** Sibling slides only while sorting mid-drag — never after drop (avoids fly-in from top). */
const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  if (args.isDragging) return false;
  if (!args.isSorting) return false;
  return defaultAnimateLayoutChanges(args);
};

const toneByToken: Record<string, BlockTone> = {
  "category.coral": "coral",
  "category.teal": "teal",
  "category.blue": "blue",
  "category.purple": "purple",
  "category.pink": "pink",
  "category.gold": "gold",
};

type CalendarTone = "neutral" | "coral" | "teal" | "blue" | "purple" | "pink" | "gold";

function formatDueLabel(dueDate: string | null): string | undefined {
  if (!dueDate) {
    return undefined;
  }

  const due = new Date(`${dueDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Morgen";
  if (diffDays === -1) return "Gestern";

  return due.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

/** Near-term dues may emphasize; other dates stay neutral meta gray. */
function dueMetaTone(dueDate: string | null): "coral" | "neutral" {
  if (!dueDate) return "neutral";
  const due = new Date(`${dueDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0 || diffDays === 1) return "coral";
  return "neutral";
}

function groupTitle(groupKey: string): string {
  if (groupKey === ROOT_GROUP) return "Ohne Abschnitt";
  if (groupKey === "today") return "Heute";
  if (groupKey === "inbox") return "Eingang";
  if (groupKey === "abschnitt-4") return "Abschnitt 4";
  return groupKey
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryKind(source: CalendarEntryDto["source"]): "task" | "event" | "block" {
  if (source === "task") return "task";
  if (source === "block") return "block";
  return "event";
}

function entryTone(
  entry: CalendarEntryDto,
  blocksById: Map<string, BlockDto>,
): CalendarTone {
  if (entry.source === "block" && entry.blockId) {
    const block = blocksById.get(entry.blockId);
    return toneByToken[block?.colorToken ?? "category.purple"] ?? "purple";
  }
  if (entry.source === "google" || entry.source === "microsoft") return "blue";
  // Tasks and plain manual events stay neutral (soft / white cards per Figma)
  return "neutral";
}

function entryIcon(
  entry: CalendarEntryDto,
  blocksById: Map<string, BlockDto>,
): IconName | undefined {
  if (entry.source !== "block" || !entry.blockId) return undefined;
  const icon = blocksById.get(entry.blockId)?.icon;
  return icon ? (icon as IconName) : undefined;
}

function formatEntryTime(startsAt: string): string {
  return new Date(startsAt).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DRAWER_START_HOUR = 7;
const DRAWER_END_HOUR = 18;
const DRAWER_DAY_RANGE = {
  startHour: DRAWER_START_HOUR,
  hourCount: DRAWER_END_HOUR - DRAWER_START_HOUR,
} as const;

function toBlockRailItems(blocks: BlockDto[]): BlockRailItem[] {
  return blocks.slice(0, 8).map((block) => ({
    id: block.id,
    label: block.title,
    icon: (block.icon as IconName | null) ?? "layers",
    tone: toneByToken[block.colorToken ?? "category.teal"] ?? "teal",
  }));
}

type FlatTaskRow = {
  task: TaskDto;
  depth: TaskIndentLevel;
  hasChildren: boolean;
};

/**
 * Flat sortable row — nested tasks are DOM siblings (indent only).
 * Live tree mutation happens only on drop via projection (dnd-kit SortableTree).
 */
function SortableFlatTask({
  task,
  depth,
  hasChildren,
  expanded,
  lockedHeight,
  nestHint,
  subtaskLabel,
  goalTitle,
  contextMenuItems,
  onExpandedChange,
  onOpen,
  onToggle,
  onFavorite,
}: {
  task: TaskDto;
  depth: TaskIndentLevel;
  hasChildren: boolean;
  expanded: boolean;
  lockedHeight?: number | null;
  nestHint?: boolean;
  subtaskLabel?: string;
  goalTitle?: string;
  contextMenuItems?: FokunaContextMenuEntry[];
  onExpandedChange: (expanded: boolean) => void;
  onOpen: (task: TaskDto) => void;
  onToggle: (task: TaskDto, completed: boolean) => void;
  onFavorite: (task: TaskDto, favorite: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    animateLayoutChanges,
  });

  const indentStyle = {
    boxSizing: "border-box" as const,
    marginLeft: `calc(${depth} * var(--fk-task-indent-step, 24px))`,
    width: `calc(var(--fk-task-column-width, 800px) - (${depth} * var(--fk-task-indent-step, 24px)))`,
  };

  const lockedStyle =
    isDragging && lockedHeight
      ? {
          boxSizing: "border-box" as const,
          flexShrink: 0,
          height: lockedHeight,
          maxHeight: lockedHeight,
          minHeight: lockedHeight,
          overflow: "hidden" as const,
        }
      : undefined;

  const sortableStyle = sortableItemStyle({
    transform,
    transition,
    layoutControlled: isDragging,
  });

  return (
    <div
      className={styles.sortableRow}
      data-indent={depth || undefined}
      ref={setNodeRef}
      style={{
        ...indentStyle,
        ...sortableStyle,
        // Keep L/R indent slides even when transform transition is cleared on the active slot.
        transition: [sortableStyle.transition, "margin-left 160ms cubic-bezier(0.25, 1, 0.5, 1)", "width 160ms cubic-bezier(0.25, 1, 0.5, 1)"]
          .filter(Boolean)
          .join(", "),
        ...lockedStyle,
      }}
    >
      <TaskListItem
        className={nestHint ? styles.nestTarget : undefined}
        completed={task.isCompleted}
        contextMenuItems={isDragging ? undefined : contextMenuItems}
        due={formatDueLabel(task.dueDate)}
        dueTone={dueMetaTone(task.dueDate)}
        expandable={hasChildren}
        expanded={expanded}
        favorite={task.isFavorite}
        goal={goalTitle}
        indentLevel={depth}
        onClick={isDragging ? undefined : () => onOpen(task)}
        onCompletedChange={
          isDragging ? undefined : (completed) => onToggle(task, completed)
        }
        onExpandedChange={isDragging ? undefined : onExpandedChange}
        onFavoriteChange={
          isDragging ? undefined : (favorite) => onFavorite(task, favorite)
        }
        rowDragProps={isDragging ? undefined : { ...attributes, ...listeners }}
        state={isDragging ? "placeholder" : "default"}
        style={{
          marginLeft: 0,
          width: "100%",
          flex: "none",
          ...lockedStyle,
        }}
        subtasks={subtaskLabel}
        tags={task.tags}
        title={task.title}
      />
    </div>
  );
}

function todayIsoDate() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today.toISOString().slice(0, 10);
}

function listTitleForFilter(filter: string): string {
  if (filter === "favorites") return "Favoriten";
  if (filter === "today") return "Heute";
  if (filter === "inbox") return "Eingang";
  return "Alle Aufgaben";
}

function normalizePriority(priority: TaskDto["priority"]): TaskDto["priority"] {
  return priority === "high" ? "urgent" : priority;
}

function countTaskTree(
  roots: TaskDto[],
  childrenByParent: Map<string, TaskDto[]>,
): number {
  function countNode(task: TaskDto): number {
    const children = childrenByParent.get(task.id) ?? [];
    return 1 + children.reduce((sum, child) => sum + countNode(child), 0);
  }
  return roots.reduce((sum, task) => sum + countNode(task), 0);
}

export function TasksView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const filter = searchParams.get("filter") ?? "all";
  const selectedTaskId = searchParams.get("task");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [activeHeight, setActiveHeight] = useState<number | null>(null);
  /** Frozen at drag start — never read live list data for the overlay (avoids title blitzes). */
  const [dragOverlayTask, setDragOverlayTask] = useState<TaskDto | null>(null);
  const [dragOverlayMeta, setDragOverlayMeta] = useState<{
    hasChildren: boolean;
    subtaskLabel?: string;
  } | null>(null);
  const [dragOriginPlacements, setDragOriginPlacements] = useState<TaskPlacement[] | null>(null);
  /**
   * Live flat order while dragging — placeholder moves with the slot (MVP §4.1).
   * Parent/depth stay projected until drop (no multi-container reparent).
   */
  const [dragOrderedIds, setDragOrderedIds] = useState<string[] | null>(null);
  const dragOrderedIdsRef = useRef<string[] | null>(null);
  /** Last committed insert index — hysteresis + skip redundant moves. */
  const lastInsertIndexRef = useRef<number | null>(null);
  const lastOverRectRef = useRef<{ top: number; height: number } | null>(null);
  const overIdRef = useRef<string | null>(null);
  /** Over-id we last synced the placeholder slot to (must match strategy flip). */
  const lastSyncedOverIdRef = useRef<string | null>(null);
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
  );

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiGet<TaskDto[]>("/api/v1/tasks"),
  });
  const calendarQuery = useQuery({
    queryKey: ["calendar-entries"],
    queryFn: () => apiGet<CalendarEntryDto[]>("/api/v1/calendar/entries"),
  });
  const blocksQuery = useQuery({
    queryKey: ["blocks"],
    queryFn: () => apiGet<BlockDto[]>("/api/v1/blocks"),
  });
  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiGet<Array<{ id: string; title: string }>>("/api/v1/goals"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      description?: string;
      groupKey: string;
      parentTaskId?: string;
      goalId?: string;
      milestoneId?: string;
      priority?: TaskDto["priority"];
      estimateMinutes?: number;
      dueDate?: string;
      tags?: string[];
      isFavorite?: boolean;
    }) => apiSend<TaskDto>("/api/v1/tasks", "POST", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<TaskDto>) =>
      apiSend<TaskDto>(`/api/v1/tasks/${id}`, "PATCH", patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiSend<TaskDto>(`/api/v1/tasks/${id}`, "DELETE"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const relocateMutation = useMutation({
    mutationFn: (payload: { placements: TaskPlacement[] }) =>
      apiSend<TaskDto[]>("/api/v1/tasks", "PUT", payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<TaskDto[]>(["tasks"]);
      if (previous) {
        queryClient.setQueryData(
          ["tasks"],
          applyPlacementsToTasks(previous, payload.placements),
        );
      }
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
    },
  });

  const goalTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const goal of goalsQuery.data ?? []) {
      map.set(goal.id, goal.title);
    }
    return map;
  }, [goalsQuery.data]);

  const sourceTasks = tasksQuery.data ?? [];

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = todayIsoDate();
    const all = sourceTasks;

    function matchesSearch(task: TaskDto) {
      if (!query) return true;
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    function matchesFilter(task: TaskDto) {
      if (!showCompleted && task.isCompleted) return false;
      if (filter === "favorites" && !task.isFavorite) return false;
      if (filter === "today" && task.dueDate !== today && task.groupKey !== "today") return false;
      if (filter === "inbox" && task.groupKey !== "inbox") return false;
      return matchesSearch(task);
    }

    const matchedRoots = all.filter((task) => !task.parentTaskId && matchesFilter(task));
    const matchedRootIds = new Set(matchedRoots.map((task) => task.id));
    const matchedSelf = all.filter((task) => matchesFilter(task));
    const matchedIds = new Set(matchedSelf.map((task) => task.id));

    return all.filter((task) => {
      if (matchedIds.has(task.id)) return true;
      if (task.parentTaskId && matchedRootIds.has(task.parentTaskId)) {
        return showCompleted || !task.isCompleted;
      }
      return false;
    });
  }, [filter, search, showCompleted, sourceTasks]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, TaskDto[]>();
    for (const task of visibleTasks) {
      if (!task.parentTaskId) continue;
      const list = map.get(task.parentTaskId) ?? [];
      list.push(task);
      map.set(task.parentTaskId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [visibleTasks]);

  const rootTasksByGroup = useMemo(() => {
    const map = new Map<string, TaskDto[]>();
    for (const task of visibleTasks) {
      if (task.parentTaskId) continue;
      const list = map.get(task.groupKey) ?? [];
      list.push(task);
      map.set(task.groupKey, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [visibleTasks]);

  const primaryGroupKey = primaryGroupKeyForFilter(filter);

  const orderedGroupKeys = useMemo(() => {
    const keys = [...rootTasksByGroup.keys()];
    keys.sort((a, b) => {
      if (a === primaryGroupKey) return -1;
      if (b === primaryGroupKey) return 1;
      return a.localeCompare(b, "de");
    });
    if (!keys.includes(primaryGroupKey)) {
      keys.unshift(primaryGroupKey);
    }
    return keys;
  }, [primaryGroupKey, rootTasksByGroup]);

  /** Base flat tree (children of active hidden while dragging). */
  const dragFlatBase = useMemo(() => {
    const flat = flattenTasksForTree(visibleTasks, expandedById, orderedGroupKeys);
    return removeChildrenOfActive(flat, activeId);
  }, [activeId, expandedById, orderedGroupKeys, visibleTasks]);

  /** Live-reordered flat items — DOM order tracks the placeholder slot. */
  const dragFlatItems = useMemo(() => {
    if (!dragOrderedIds) return dragFlatBase;
    const byId = new Map(dragFlatBase.map((item) => [item.id, item]));
    const ordered: FlatTreeItem[] = [];
    for (const id of dragOrderedIds) {
      const item = byId.get(id);
      if (item) ordered.push(item);
    }
    // Append any ids missing from the live order (e.g. newly visible).
    for (const item of dragFlatBase) {
      if (!dragOrderedIds.includes(item.id)) ordered.push(item);
    }
    return ordered;
  }, [dragFlatBase, dragOrderedIds]);

  const dragProjection =
    activeId && overId
      ? getTaskTreeProjection(
          dragFlatItems,
          activeId,
          overId,
          offsetLeft,
          INDENTATION_WIDTH,
        )
      : null;

  const nestTargetId = useMemo(() => {
    if (!dragProjection?.parentId || !activeId) return null;
    const activeIndex = dragFlatItems.findIndex((item) => item.id === activeId);
    const previous = activeIndex > 0 ? dragFlatItems[activeIndex - 1] : null;
    // Highlight only when nesting *under* the previous row (not merely sharing its parent).
    if (previous && dragProjection.parentId === previous.id) {
      return previous.id;
    }
    return null;
  }, [activeId, dragFlatItems, dragProjection]);

  const allSortableIds = useMemo(
    () => dragFlatItems.map((item) => item.id),
    [dragFlatItems],
  );
  const activeTask = dragOverlayTask;
  const selectedTask = (tasksQuery.data ?? []).find((task) => task.id === selectedTaskId) ?? null;
  const tasksById = useMemo(
    () => new Map((tasksQuery.data ?? []).map((task) => [task.id, task])),
    [tasksQuery.data],
  );
  const selectedTaskDepth = selectedTask ? getTaskDepth(selectedTask, tasksById) : 1;
  const canCreateSelectedSubtask = canCreateSubtaskAtDepth(selectedTaskDepth);
  const selectedSubtasks = selectedTask
    ? (tasksQuery.data ?? [])
        .filter((task) => task.parentTaskId === selectedTask.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const selectedBreadcrumbItems = useMemo(() => {
    if (!selectedTask) return [];
    const chain: Array<{ id: string; label: string }> = [];
    let cursor = selectedTask.parentTaskId
      ? tasksById.get(selectedTask.parentTaskId)
      : undefined;
    while (cursor) {
      chain.unshift({ id: cursor.id, label: cursor.title });
      cursor = cursor.parentTaskId ? tasksById.get(cursor.parentTaskId) : undefined;
    }
    return chain;
  }, [selectedTask, tasksById]);
  const railItems = toBlockRailItems(blocksQuery.data ?? []);
  const blocksById = useMemo(
    () => new Map((blocksQuery.data ?? []).map((block) => [block.id, block])),
    [blocksQuery.data],
  );
  const drawerDateLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function setTaskQuery(taskId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (taskId) {
      params.set("task", taskId);
    } else {
      params.delete("task");
    }
    const query = params.toString();
    router.replace(query ? `/app/aufgaben?${query}` : "/app/aufgaben", { scroll: false });
  }

  function clearDragUi() {
    cancelScheduledDragClear();
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
    setActiveHeight(null);
    setDragOverlayTask(null);
    setDragOverlayMeta(null);
    setDragOriginPlacements(null);
    dragOrderedIdsRef.current = null;
    setDragOrderedIds(null);
    lastInsertIndexRef.current = null;
    lastOverRectRef.current = null;
    overIdRef.current = null;
    lastSyncedOverIdRef.current = null;
  }

  function commitFlatOrder(nextIds: string[], nextIndex: number) {
    dragOrderedIdsRef.current = nextIds;
    lastInsertIndexRef.current = nextIndex;
    setDragOrderedIds(nextIds);
  }

  function applyLiveFlatSort(input: {
    activeId: string;
    overId: string;
    dragCenterY: number;
    overRect: { top: number; height: number };
    /** True when dnd-kit just flipped `over` — move placeholder immediately (same 10–15% feel). */
    overChanged: boolean;
  }) {
    const ids = dragOrderedIdsRef.current;
    if (!ids) return;

    const activeIndex = ids.indexOf(input.activeId);
    const overIndex = ids.indexOf(input.overId);
    if (activeIndex < 0 || overIndex < 0) return;

    // Live reorder only within the same Abschnitt (cross-group commits on drop).
    const activeMeta = dragFlatBase.find((item) => item.id === input.activeId);
    const overMeta = dragFlatBase.find((item) => item.id === input.overId);
    if (!activeMeta || !overMeta || activeMeta.groupKey !== overMeta.groupKey) {
      return;
    }

    let nextIndex: number;

    if (input.overChanged || lastSyncedOverIdRef.current !== input.overId) {
      // Sync with verticalListSortingStrategy: it shifts siblings as soon as `over`
      // flips (~10–15% into the row). Midpoint delay made the placeholder lag.
      nextIndex = overIndex;
      lastSyncedOverIdRef.current = input.overId;
    } else {
      // Same over row: fine-tune before/after with hysteresis while lingering.
      nextIndex = resolveSortableInsertIndex({
        activeIndex,
        overIndex,
        dragCenterY: input.dragCenterY,
        overRect: input.overRect,
        lastInsertIndex: lastInsertIndexRef.current,
      });
    }

    if (nextIndex === activeIndex) {
      lastInsertIndexRef.current = nextIndex;
      return;
    }
    if (lastInsertIndexRef.current === nextIndex) return;

    commitFlatOrder(arrayMove(ids, activeIndex, nextIndex), nextIndex);
  }

  function onDragStart(event: DragStartEvent) {
    cancelScheduledDragClear();
    const id = String(event.active.id);
    const tasks = tasksQuery.data ?? [];
    const snapshot = tasks.find((task) => task.id === id) ?? null;
    const flat = removeChildrenOfActive(
      flattenTasksForTree(visibleTasks, expandedById, orderedGroupKeys),
      id,
    );
    const orderedIds = flat.map((item) => item.id);
    dragOrderedIdsRef.current = orderedIds;
    lastInsertIndexRef.current = orderedIds.indexOf(id);
    lastOverRectRef.current = null;
    overIdRef.current = id;
    lastSyncedOverIdRef.current = id;
    setDragOrderedIds(orderedIds);
    setActiveId(id);
    setOverId(id);
    setOffsetLeft(0);
    const childList = tasks.filter((task) => task.parentTaskId === id);
    // Prefer the pre-drag row height; fall back to has-meta minimum when measure is short.
    const measured = event.active.rect.current.initial?.height ?? null;
    const hasMeta = Boolean(
      snapshot &&
        (snapshot.dueDate ||
          snapshot.goalId ||
          (snapshot.tags?.length ?? 0) > 0 ||
          childList.length > 0),
    );
    setActiveHeight(
      measured != null ? Math.max(measured, hasMeta ? 64 : 40) : hasMeta ? 64 : 40,
    );
    setDragOverlayTask(snapshot);
    setDragOverlayMeta(
      childList.length > 0
        ? {
            hasChildren: true,
            subtaskLabel: `${childList.filter((child) => child.isCompleted).length}/${childList.length}`,
          }
        : { hasChildren: false },
    );
    const layout = buildTaskDragLayout(tasks);
    const byId = new Map(tasks.map((task) => [task.id, task]));
    setDragOriginPlacements(layoutToPlacements(layout, byId));
  }

  function onDragMove(event: DragMoveEvent) {
    const next = event.delta.x;
    setOffsetLeft((prev) => (prev === next ? prev : next));

    // Re-evaluate before/after while lingering on the same over row (slow wiggle).
    const currentOver = overIdRef.current;
    const overRect = lastOverRectRef.current;
    const translated = event.active.rect.current.translated;
    if (!currentOver || !overRect || !translated) return;

    applyLiveFlatSort({
      activeId: String(event.active.id),
      overId: currentOver,
      dragCenterY: translated.top + translated.height / 2,
      overRect,
      overChanged: false,
    });
  }

  function onDragOver(event: DragOverEvent) {
    const nextOver = event.over ? String(event.over.id) : null;
    const overChanged = nextOver !== null && nextOver !== overIdRef.current;
    overIdRef.current = nextOver;
    setOverId((prev) => (prev === nextOver ? prev : nextOver));

    if (!event.over || !nextOver) {
      lastOverRectRef.current = null;
      return;
    }

    lastOverRectRef.current = {
      top: event.over.rect.top,
      height: event.over.rect.height,
    };

    const translated = event.active.rect.current.translated;
    const dragCenterY = translated
      ? translated.top + translated.height / 2
      : event.over.rect.top + event.over.rect.height / 2;

    applyLiveFlatSort({
      activeId: String(event.active.id),
      overId: nextOver,
      dragCenterY,
      overRect: lastOverRectRef.current,
      overChanged,
    });
  }

  function onDragEnd(event: {
    over: { id: string | number } | null;
    active: { id: string | number };
  }) {
    const tasks = tasksQuery.data ?? [];
    const origin = dragOriginPlacements;
    const active = String(event.active.id);
    const over = event.over ? String(event.over.id) : null;
    const flatSnapshot = dragFlatItems;
    const liveOrderedIds = dragOrderedIdsRef.current ?? flatSnapshot.map((item) => item.id);
    const offsetSnapshot = offsetLeft;

    clearDragUi();

    if (!over || !origin) return;

    const projected = getTaskTreeProjection(
      flatSnapshot,
      active,
      over,
      offsetSnapshot,
      INDENTATION_WIDTH,
    );
    if (!projected) return;

    const patch = commitTaskTreeMove({
      tasks,
      expandedById,
      activeId: active,
      overId: over,
      projected,
      liveOrderedIds,
    });
    if (patch.length === 0) return;

    if (projected.parentId) {
      setExpandedById((current) => ({ ...current, [projected.parentId!]: true }));
    }

    const placements = mergePlacements(origin, patch);
    if (placementsEqual(origin, placements)) return;

    relocateMutation.mutate({ placements });
  }

  function onDragCancel() {
    clearDragUi();
  }

  function getTaskDepth(task: TaskDto, byId: Map<string, TaskDto>): number {
    let depth = 1;
    let cursor = task.parentTaskId ? byId.get(task.parentTaskId) : undefined;
    while (cursor) {
      depth += 1;
      cursor = cursor.parentTaskId ? byId.get(cursor.parentTaskId) : undefined;
    }
    return depth;
  }

  function buildTaskContextMenuItems(task: TaskDto): FokunaContextMenuEntry[] {
    const currentPriority = normalizePriority(task.priority);

    function patchTask(taskId: string, patch: Partial<TaskDto>) {
      updateMutation.mutate({ id: taskId, ...patch });
    }

    return [
      {
        label: "Bearbeiten",
        icon: "edit",
        onSelect: () => setTaskQuery(task.id),
      },
      {
        type: "submenu",
        label: "Priorität",
        icon: "flag",
        children: priorityOptions.map((option) => ({
          label: option.label,
          checked: currentPriority === option.value,
          leading: (
            <FokunaIcon
              fill={option.value === "none" ? "off" : "on"}
              name="flag"
              size={16}
              stroke={1.5}
              style={{ color: option.color }}
            />
          ),
          onSelect: () => patchTask(task.id, { priority: option.value }),
        })),
      },
      {
        type: "submenu",
        label: "Fälligkeit",
        icon: "calendar",
        panel: true,
        content: <TaskDueDateMenuPanel onUpdate={patchTask} task={task} />,
      },
      {
        type: "submenu",
        label: "Zeitschätzung",
        icon: "clock",
        panel: true,
        content: <TaskEstimateMenuPanel onUpdate={patchTask} task={task} />,
      },
      {
        type: "submenu",
        label: "Verschieben",
        icon: "folder",
        children: orderedGroupKeys.map((groupKey) => ({
          label: groupTitle(groupKey),
          checked: task.groupKey === groupKey,
          onSelect: () => patchTask(task.id, { groupKey }),
        })),
      },
      {
        label: "Duplizieren",
        icon: "layers",
        onSelect: () =>
          createMutation.mutate({
            title: `${task.title} (Kopie)`,
            description: task.description ?? undefined,
            groupKey: task.groupKey,
            parentTaskId: task.parentTaskId ?? undefined,
            goalId: task.goalId ?? undefined,
            milestoneId: task.milestoneId ?? undefined,
            priority: normalizePriority(task.priority),
            estimateMinutes: task.estimateMinutes ?? undefined,
            dueDate: task.dueDate ?? undefined,
            tags: task.tags,
            isFavorite: task.isFavorite,
          }),
      },
      { type: "separator" },
      {
        label: "Löschen",
        icon: "delete",
        destructive: true,
        onSelect: () => deleteMutation.mutate(task.id),
      },
    ];
  }

  function renderFlatGroup(groupKey: string) {
    const tasksByVisibleId = new Map(visibleTasks.map((task) => [task.id, task]));
    const flatRows: FlatTaskRow[] = dragFlatItems
      .filter((item) => item.groupKey === groupKey)
      .flatMap((item) => {
        const task = tasksByVisibleId.get(item.id);
        if (!task) return [];
        const baseDepth =
          activeId === item.id && dragProjection ? dragProjection.depth : item.depth;
        const depth = Math.min(baseDepth, TASK_MAX_INDENT_LEVEL) as TaskIndentLevel;
        const childList = childrenByParent.get(task.id) ?? [];
        return [
          {
            task,
            depth,
            hasChildren: childList.length > 0,
          },
        ];
      });

    return flatRows.map(({ task, depth, hasChildren }) => {
      const childList = childrenByParent.get(task.id) ?? [];
      const subtaskLabel =
        childList.length > 0
          ? `${childList.filter((child) => child.isCompleted).length}/${childList.length}`
          : undefined;

      return (
        <SortableFlatTask
          contextMenuItems={buildTaskContextMenuItems(task)}
          depth={depth}
          expanded={expandedById[task.id] !== false}
          goalTitle={task.goalId ? goalTitles.get(task.goalId) : undefined}
          hasChildren={hasChildren}
          key={task.id}
          lockedHeight={activeId === task.id ? activeHeight : null}
          nestHint={nestTargetId === task.id}
          onExpandedChange={(expanded) =>
            setExpandedById((current) => ({ ...current, [task.id]: expanded }))
          }
          onFavorite={(current, favorite) =>
            updateMutation.mutate({ id: current.id, isFavorite: favorite })
          }
          onOpen={(current) => setTaskQuery(current.id)}
          onToggle={(current, completed) =>
            updateMutation.mutate({ id: current.id, isCompleted: completed })
          }
          subtaskLabel={subtaskLabel}
          task={task}
        />
      );
    });
  }

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <PageHeader
          actions={
            <>
              <MetaMenu
                items={[
                  {
                    label: showCompleted ? "Erledigte ausblenden" : "Erledigte einblenden",
                    icon: "checklist",
                    onSelect: () => setShowCompleted((value) => !value),
                  },
                ]}
              />
              <SearchField
                collapsedWidth={152}
                expandedWidth={240}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Suchen..."
                value={search}
              />
              <Button
                intent="secondary"
                leadingIcon={<FokunaIcon fill="on" name="magic-eye" size={16} />}
                onClick={() => router.push("/app/fokus")}
                trailingIcon={null}
                type="button"
              >
                Fokus
              </Button>
              <Button
                aria-label={drawerOpen ? "Kalenderleiste schließen" : "Kalenderleiste öffnen"}
                aria-pressed={drawerOpen}
                buttonType="outline"
                iconOnly
                intent="tertiary"
                leadingIcon={
                  <FokunaIcon
                    name="sidebar-left-arrow"
                    size={16}
                    style={drawerOpen ? { transform: "scaleX(-1)" } : undefined}
                  />
                }
                onClick={() => setDrawerOpen((value) => !value)}
              >
                Kalenderleiste
              </Button>
            </>
          }
        />

        <div className={styles.listStack}>
          <h1 className={styles.listTitle}>{listTitleForFilter(filter)}</h1>

          {tasksQuery.isLoading ? <p className={styles.status}>Aufgaben werden geladen…</p> : null}
          {tasksQuery.isError ? (
            <p className={styles.status}>Aufgaben konnten nicht geladen werden.</p>
          ) : null}

          {!tasksQuery.isLoading && !tasksQuery.isError && visibleTasks.length === 0 ? (
            <div className={styles.empty}>
              <strong>Noch keine Aufgaben</strong>
              <span>Lege die erste Aufgabe an, um deinen Tag zu strukturieren.</span>
            </div>
          ) : null}

          <div className={styles.list}>
            <DndContext
              collisionDetection={taskListCollisionDetection}
              measuring={measuring}
              onDragCancel={onDragCancel}
              onDragEnd={onDragEnd}
              onDragMove={onDragMove}
              onDragOver={onDragOver}
              onDragStart={onDragStart}
              sensors={sensors}
            >
              <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
                {orderedGroupKeys.map((groupKey) => {
                  const tasks = rootTasksByGroup.get(groupKey) ?? [];
                  if (groupKey === primaryGroupKey) {
                    return (
                      <div className={`${styles.rootList} fk-task-list`} key={groupKey}>
                        {renderFlatGroup(groupKey)}
                        <AddTask
                          onSubmit={async ({ title, description }) => {
                            await createMutation.mutateAsync({
                              title,
                              description: description || undefined,
                              groupKey: primaryGroupKey,
                            });
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <TaskGroup
                      count={countTaskTree(tasks, childrenByParent)}
                      key={groupKey}
                      onAddSubmit={async ({ title, description }) => {
                        await createMutation.mutateAsync({
                          title,
                          description: description || undefined,
                          groupKey,
                        });
                      }}
                      title={groupTitle(groupKey)}
                    >
                      {renderFlatGroup(groupKey)}
                    </TaskGroup>
                  );
                })}
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeTask ? (
                  <DnDGhostShell>
                    <TaskListItem
                      completed={activeTask.isCompleted}
                      due={formatDueLabel(activeTask.dueDate)}
                      dueTone={dueMetaTone(activeTask.dueDate)}
                      expandable={dragOverlayMeta?.hasChildren}
                      expanded={false}
                      favorite={activeTask.isFavorite}
                      goal={
                        activeTask.goalId ? goalTitles.get(activeTask.goalId) : undefined
                      }
                      state="dragged"
                      style={{
                        width: "var(--fk-task-column-width, 800px)",
                        ...(activeHeight
                          ? {
                              boxSizing: "border-box",
                              height: activeHeight,
                              maxHeight: activeHeight,
                              minHeight: activeHeight,
                              overflow: "hidden",
                            }
                          : {}),
                      }}
                      subtasks={dragOverlayMeta?.subtaskLabel}
                      tags={activeTask.tags}
                      title={activeTask.title}
                    />
                  </DnDGhostShell>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      <aside
        aria-hidden={!drawerOpen}
        className={styles.aside}
        data-open={drawerOpen ? "true" : "false"}
        inert={!drawerOpen ? true : undefined}
      >
        <div className={styles.asidePanel}>
          <CalendarDrawer
            actions={<Switcher size="md" value={drawerDateLabel} />}
            className={styles.drawer}
            endHour={DRAWER_END_HOUR}
            startHour={DRAWER_START_HOUR}
            viewControl={
              <Dropdown
                appearance="text"
                aria-label="Kalenderfilter"
                controlSize="md"
                defaultValue="all"
                leadingIcon="calendar"
                options={[
                  { value: "all", label: "Alle" },
                  { value: "tasks", label: "Aufgaben" },
                  { value: "blocks", label: "Blocks" },
                ]}
              />
            }
          >
            {(calendarQuery.data ?? []).map((entry) => {
              const position = getCalendarEntryPosition(
                entry.startsAt,
                entry.endsAt,
                DRAWER_DAY_RANGE,
              );
              return (
                <CalendarItem
                  key={entry.id}
                  icon={entryIcon(entry, blocksById)}
                  kind={entryKind(entry.source)}
                  meta={entry.description ?? undefined}
                  style={position}
                  time={formatEntryTime(entry.startsAt)}
                  title={entry.title}
                  tone={entryTone(entry, blocksById)}
                />
              );
            })}
          </CalendarDrawer>
          <BlockRail
            className={styles.rail}
            items={
              railItems.length > 0
                ? railItems
                : [
                    { id: "deep", label: "Deep Work", icon: "focus-target", tone: "teal" },
                    { id: "read", label: "Lesen", icon: "newspaper", tone: "coral" },
                    { id: "food", label: "Essen", icon: "fork-spoon", tone: "purple" },
                  ]
            }
            onEdit={() => {
              window.location.href = "/app/aufgaben/blocks";
            }}
          />
        </div>
      </aside>

      <TaskDetailModal
        canCreateSubtask={canCreateSelectedSubtask}
        onCreateSubtask={async ({ parentTaskId, title, description }) => {
          const parent = (tasksQuery.data ?? []).find((task) => task.id === parentTaskId);
          if (parent && !canCreateSubtaskAtDepth(getTaskDepth(parent, tasksById))) {
            return;
          }
          await createMutation.mutateAsync({
            title,
            description,
            groupKey: parent?.groupKey ?? ROOT_GROUP,
            parentTaskId,
          });
        }}
        onDelete={async (taskId) => {
          await deleteMutation.mutateAsync(taskId);
          setTaskQuery(null);
        }}
        onOpenChange={(open) => {
          if (!open) setTaskQuery(null);
        }}
        onOpenSubtask={(taskId) => setTaskQuery(taskId)}
        onUpdate={async (taskId, patch) => {
          await updateMutation.mutateAsync({ id: taskId, ...patch });
        }}
        open={Boolean(selectedTask)}
        breadcrumbItems={selectedBreadcrumbItems}
        subtasks={selectedSubtasks}
        task={selectedTask}
      />
    </div>
  );
}
