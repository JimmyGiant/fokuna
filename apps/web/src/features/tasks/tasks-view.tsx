"use client";

import {
  DragOverlay,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
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
  todayIsoDateString,
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
  type TagTone,
  type TaskListTag,
  useToast,
} from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  DnDGhostShell,
  cancelScheduledDragClear,
  resolveSortableInsertIndex,
  sortableItemStyle,
} from "@/components/dnd";
import {
  ConfirmDeleteModal,
  deleteConfirmCopy,
} from "@/components/confirm-delete-modal";
import { apiGet, apiSend } from "@/lib/api";
import { useTaskTaxonomy } from "./aufgaben-shell";
import { colorTokenToCssVar, colorTokenToTone } from "./taxonomy";
import { TaskDetailModal } from "./task-detail-modal";
import { TaskDueDateMenuPanel, TaskEstimateMenuPanel, TaskLabelsMenuPanel } from "./task-property-editor";
import { priorityOptions } from "./task-property-options";
import { useTasksListDndRegistration } from "./tasks-dnd-host";
import styles from "./tasks-view.module.css";

const ROOT_GROUP = "root";
/**
 * Create target for the active sidebar filter.
 * New tasks without a category land in Eingang; Heute sets group + dueDate.
 */
function createGroupKeyForFilter(filter: string): string {
  if (filter === "today") return "today";
  return "inbox";
}

/** Todoist-style: full step right = nest, full step left = outdent. */
const INDENTATION_WIDTH = 48;

function placementsEqual(a: TaskPlacement[], b: TaskPlacement[]): boolean {
  if (a.length !== b.length) return false;
  const serialize = (placement: TaskPlacement) =>
    `${placement.id}:${placement.groupKey}:${placement.parentTaskId ?? ""}:${placement.sortOrder}`;
  const right = new Map(b.map((placement) => [placement.id, serialize(placement)]));
  return a.every((placement) => right.get(placement.id) === serialize(placement));
}

/** No layout animation on sort/drop — slot moves are instant (no transform slides). */
const animateLayoutChanges: AnimateLayoutChanges = () => false;

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

/** Near-term and overdue dues may emphasize; other dates stay neutral meta gray. */
function dueMetaTone(dueDate: string | null): "coral" | "neutral" {
  if (!dueDate) return "neutral";
  const due = new Date(`${dueDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays <= 1) return "coral";
  return "neutral";
}

function isOverdueDueDate(dueDate: string | null, today: string): boolean {
  return Boolean(dueDate && dueDate < today);
}

/** Nested matches whose parent isn't visible become roots (e.g. Favoriten-Subtasks). */
function promoteOrphanNestedTasks<T extends { id: string; parentTaskId: string | null }>(
  tasks: T[],
): T[] {
  const ids = new Set(tasks.map((task) => task.id));
  return tasks.map((task) => {
    if (task.parentTaskId && !ids.has(task.parentTaskId)) {
      return { ...task, parentTaskId: null };
    }
    return task;
  });
}

/** Flatten visible tasks for DnD; overdue trees are separate from group buckets on Heute. */
function flattenTasksForDragList(input: {
  filter: string;
  promoteOrphans: boolean;
  visibleTasks: TaskDto[];
  expandedById: Record<string, boolean>;
  orderedGroupKeys: string[];
  overdueTreeIds: Set<string>;
  activeId: string | null;
}): FlatTreeItem[] {
  const {
    filter,
    promoteOrphans,
    visibleTasks,
    expandedById,
    orderedGroupKeys,
    overdueTreeIds,
    activeId,
  } = input;

  const tasksForTree = promoteOrphans ? promoteOrphanNestedTasks(visibleTasks) : visibleTasks;

  if (filter === "today" && overdueTreeIds.size > 0) {
    const overdueTasks = tasksForTree.filter((task) => overdueTreeIds.has(task.id));
    const todayTasks = tasksForTree.filter((task) => !overdueTreeIds.has(task.id));
    const overdueFlat = flattenTasksForTree(overdueTasks, expandedById, undefined, true);
    const todayFlat = flattenTasksForTree(todayTasks, expandedById, orderedGroupKeys, true);
    return removeChildrenOfActive([...overdueFlat, ...todayFlat], activeId);
  }

  // Alle / Favoriten / Eingang / Kategorie / Label: one continuous list, no Abschnitt buckets.
  const unifyRoots = filter !== "today";
  return removeChildrenOfActive(
    flattenTasksForTree(tasksForTree, expandedById, orderedGroupKeys, unifyRoots),
    activeId,
  );
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
  tags,
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
  tags?: TaskListTag[];
  contextMenuItems?: FokunaContextMenuEntry[];
  onExpandedChange: (expanded: boolean) => void;
  onOpen: (task: TaskDto) => void;
  onToggle: (task: TaskDto, completed: boolean) => void;
  onFavorite: (task: TaskDto, favorite: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: task.id,
    animateLayoutChanges,
    transition: null,
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

  return (
    <div
      className={styles.sortableRow}
      data-indent={depth || undefined}
      data-placeholder={isDragging ? "true" : undefined}
      ref={setNodeRef}
      style={{
        ...indentStyle,
        // Live DOM order owns the slot — never apply sortable transforms/transitions.
        ...sortableItemStyle({ transform: null, transition: undefined, layoutControlled: true }),
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
        tags={tags}
        title={task.title}
      />
    </div>
  );
}

function todayIsoDate() {
  return todayIsoDateString();
}

function listTitleForFilter(
  filter: string,
  options?: { categoryName?: string; labelName?: string },
): string {
  if (filter === "favorites") return "Favoriten";
  if (filter === "today") return "Heute";
  if (filter === "inbox") return "Eingang";
  if (options?.categoryName) return options.categoryName;
  if (options?.labelName) return options.labelName;
  return "Alle Aufgaben";
}

/** Section title under Überfällig on the Heute view, e.g. "Mittwoch, 22. Juli". */
function formatTodaySectionTitle(date = new Date()): string {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function normalizePriority(priority: TaskDto["priority"]): TaskDto["priority"] {
  return priority === "high" ? "urgent" : priority;
}

export function TasksView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { labels, labelsById, categories, openLabelManager } = useTaskTaxonomy();
  const filter = searchParams.get("filter") ?? "all";
  const categoryId = searchParams.get("category");
  const labelId = searchParams.get("label");
  const selectedTaskId = searchParams.get("task");
  const openLabelsAfterTaskCloseRef = useRef(false);
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
  const [pendingDeleteTask, setPendingDeleteTask] = useState<{
    id: string;
    title: string;
  } | null>(null);

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
      categoryId?: string;
      priority?: TaskDto["priority"];
      estimateMinutes?: number;
      dueDate?: string;
      labelIds?: string[];
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

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );
  const activeLabel = useMemo(
    () => labels.find((label) => label.id === labelId) ?? null,
    [labelId, labels],
  );

  function resolveTaskTagLabels(task: TaskDto): TaskListTag[] {
    return task.labelIds
      .map((id) => {
        const label = labelsById.get(id);
        if (!label) return null;
        return { label: label.name, tone: colorTokenToTone(label.colorToken) };
      })
      .filter((tag): tag is { label: string; tone: TagTone } => Boolean(tag));
  }

  const sourceTasks = tasksQuery.data ?? [];

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = todayIsoDate();
    const all = sourceTasks;

    function matchesSearch(task: TaskDto) {
      if (!query) return true;
      const tagNames = task.labelIds
        .map((id) => labelsById.get(id)?.name?.toLowerCase() ?? "")
        .join(" ");
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false) ||
        tagNames.includes(query)
      );
    }

    function matchesFilter(task: TaskDto) {
      if (!showCompleted && task.isCompleted) return false;
      if (filter === "favorites" && !task.isFavorite) return false;
      if (filter === "today") {
        const isDueToday = task.dueDate === today;
        const isTodayGroup = task.groupKey === "today";
        const isOverdue = isOverdueDueDate(task.dueDate, today);
        if (!isDueToday && !isTodayGroup && !isOverdue) return false;
      }
      if (filter === "inbox" && task.categoryId !== null) return false;
      if (categoryId && task.categoryId !== categoryId) return false;
      if (labelId && !task.labelIds.includes(labelId)) return false;
      return matchesSearch(task);
    }

    const matchedRoots = all.filter((task) => !task.parentTaskId && matchesFilter(task));
    const matchedRootIds = new Set(matchedRoots.map((task) => task.id));
    const matchedSelf = all.filter((task) => matchesFilter(task));
    const matchedIds = new Set(matchedSelf.map((task) => task.id));

    // Favoriten / Label: only matching tasks (nested ones are promoted when flattening).
    if (filter === "favorites" || labelId) {
      return matchedSelf;
    }

    return all.filter((task) => {
      if (matchedIds.has(task.id)) return true;
      if (task.parentTaskId && matchedRootIds.has(task.parentTaskId)) {
        return showCompleted || !task.isCompleted;
      }
      return false;
    });
  }, [categoryId, filter, labelId, labelsById, search, showCompleted, sourceTasks]);

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

  const overdueTreeIds = useMemo(() => {
    if (filter !== "today") return new Set<string>();
    const today = todayIsoDate();
    const byId = new Map(visibleTasks.map((task) => [task.id, task]));
    const ids = new Set<string>();
    for (const task of visibleTasks) {
      let root = task;
      while (root.parentTaskId) {
        const parent = byId.get(root.parentTaskId);
        if (!parent) break;
        root = parent;
      }
      if (isOverdueDueDate(root.dueDate, today)) {
        ids.add(task.id);
      }
    }
    return ids;
  }, [filter, visibleTasks]);

  const overdueRootCount = useMemo(() => {
    if (filter !== "today") return 0;
    return visibleTasks.filter(
      (task) => !task.parentTaskId && overdueTreeIds.has(task.id),
    ).length;
  }, [filter, overdueTreeIds, visibleTasks]);

  const todayRootCount = useMemo(() => {
    if (filter !== "today") return 0;
    return visibleTasks.filter(
      (task) => !task.parentTaskId && !overdueTreeIds.has(task.id),
    ).length;
  }, [filter, overdueTreeIds, visibleTasks]);

  const rootTasksByGroup = useMemo(() => {
    const map = new Map<string, TaskDto[]>();
    for (const task of visibleTasks) {
      if (task.parentTaskId) continue;
      if (overdueTreeIds.has(task.id)) continue;
      const list = map.get(task.groupKey) ?? [];
      list.push(task);
      map.set(task.groupKey, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [overdueTreeIds, visibleTasks]);

  const createGroupKey = createGroupKeyForFilter(filter);
  const unifyFlatList = filter !== "today";

  const orderedGroupKeys = useMemo(() => {
    const keys = [...rootTasksByGroup.keys()];
    keys.sort((a, b) => {
      if (a === createGroupKey) return -1;
      if (b === createGroupKey) return 1;
      return a.localeCompare(b, "de");
    });
    if (!keys.includes(createGroupKey)) {
      keys.unshift(createGroupKey);
    }
    return keys;
  }, [createGroupKey, rootTasksByGroup]);

  /** Base flat tree (children of active hidden while dragging). */
  const dragFlatBase = useMemo(
    () =>
      flattenTasksForDragList({
        filter,
        promoteOrphans: filter === "favorites" || Boolean(labelId),
        visibleTasks,
        expandedById,
        orderedGroupKeys,
        overdueTreeIds,
        activeId,
      }),
    [activeId, expandedById, filter, labelId, orderedGroupKeys, overdueTreeIds, visibleTasks],
  );

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
          undefined,
          !unifyFlatList,
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

  useEffect(() => {
    if (selectedTaskId || !openLabelsAfterTaskCloseRef.current) {
      return;
    }
    openLabelsAfterTaskCloseRef.current = false;
    // Open only after the task dialog has painted closed (URL-driven `open`).
    const frame = window.requestAnimationFrame(() => {
      openLabelManager();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openLabelManager, selectedTaskId]);

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

    // Live reorder: Abschnitte only on Heute; flat filters allow any visible pair.
    const activeMeta = dragFlatBase.find((item) => item.id === input.activeId);
    const overMeta = dragFlatBase.find((item) => item.id === input.overId);
    if (!activeMeta || !overMeta) return;
    if (!unifyFlatList && activeMeta.groupKey !== overMeta.groupKey) return;

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
    const flat = flattenTasksForDragList({
      filter,
      promoteOrphans: filter === "favorites" || Boolean(labelId),
      visibleTasks,
      expandedById,
      orderedGroupKeys,
      overdueTreeIds,
      activeId: id,
    });
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
          (snapshot.labelIds?.length ?? 0) > 0 ||
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
      undefined,
      !unifyFlatList,
    );
    if (!projected) return;

    const patch = commitTaskTreeMove({
      tasks,
      expandedById,
      activeId: active,
      overId: over,
      projected,
      liveOrderedIds,
      preserveGroupKeys: unifyFlatList,
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
    const sortedCategories = [...categories].sort((a, b) =>
      a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
    );

    function patchTask(taskId: string, patch: Partial<TaskDto>) {
      updateMutation.mutate({ id: taskId, ...patch });
    }

    function moveToCategory(nextCategoryId: string | null) {
      if (task.categoryId === nextCategoryId) return;
      const previousCategoryId = task.categoryId;
      const destinationName =
        nextCategoryId === null
          ? "Eingang"
          : sortedCategories.find((entry) => entry.id === nextCategoryId)?.name;
      updateMutation.mutate(
        { id: task.id, categoryId: nextCategoryId },
        {
          onSuccess: () => {
            toast({
              id: `task-category:${task.id}`,
              title: destinationName
                ? `Nach „${destinationName}“ verschoben`
                : "Aufgabe verschoben",
              action: {
                label: "Rückgängig",
                altText: "Verschieben rückgängig machen",
                leadingIcon: "arrow-undo-down",
                onClick: () => {
                  updateMutation.mutate({ id: task.id, categoryId: previousCategoryId });
                },
              },
            });
          },
        },
      );
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
        label: "Labels",
        icon: "tag",
        panel: true,
        content: (
          <TaskLabelsMenuPanel
            onManageLabels={openLabelManager}
            onUpdate={patchTask}
            task={task}
          />
        ),
      },
      {
        type: "submenu",
        label: "Verschieben",
        icon: "folder",
        children: [
          {
            label: "Eingang",
            icon: "inbox-empty",
            checked: task.categoryId === null,
            onSelect: () => moveToCategory(null),
          },
          ...sortedCategories.map((category) => ({
            label: category.name,
            checked: task.categoryId === category.id,
            leading: (
              <span
                aria-hidden
                className={styles.categoryMenuSwatch}
                style={{ background: colorTokenToCssVar(category.colorToken) }}
              />
            ),
            onSelect: () => moveToCategory(category.id),
          })),
        ],
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
            labelIds: task.labelIds,
            categoryId: task.categoryId ?? undefined,
            isFavorite: task.isFavorite,
          }),
      },
      { type: "separator" },
      {
        label: "Löschen",
        icon: "delete",
        destructive: true,
        onSelect: () => setPendingDeleteTask({ id: task.id, title: task.title }),
      },
    ];
  }

  function renderFlatRows(predicate: (item: FlatTreeItem) => boolean) {
    const tasksByVisibleId = new Map(visibleTasks.map((task) => [task.id, task]));
    const flatRows: FlatTaskRow[] = dragFlatItems.filter(predicate).flatMap((item) => {
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
          tags={resolveTaskTagLabels(task)}
          task={task}
        />
      );
    });
  }

  const createDueDate = filter === "today" ? todayIsoDate() : undefined;

  async function submitNewTask(title: string, description: string, groupKey = createGroupKey) {
    await createMutation.mutateAsync({
      title,
      description: description || undefined,
      groupKey,
      ...(createDueDate ? { dueDate: createDueDate } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(labelId ? { labelIds: [labelId] } : {}),
    });
  }

  useTasksListDndRegistration({
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
    onDragCancel,
  });

  const listTitle = listTitleForFilter(filter, {
    categoryName: activeCategory?.name,
    labelName: activeLabel?.name,
  });

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
          <h1 className={styles.listTitle}>{listTitle}</h1>

          {tasksQuery.isError ? (
            <p className={styles.status}>Aufgaben konnten nicht geladen werden.</p>
          ) : null}

          <div className={styles.list}>
              <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
                {filter === "today" ? (
                  <>
                    {overdueRootCount > 0 ? (
                      <TaskGroup
                        count={overdueRootCount}
                        defaultExpanded
                        key="overdue"
                        showAdd={false}
                        title="Überfällig"
                      >
                        {renderFlatRows((item) => overdueTreeIds.has(item.id))}
                      </TaskGroup>
                    ) : null}
                    {overdueRootCount > 0 ? (
                      <TaskGroup
                        count={todayRootCount}
                        defaultExpanded
                        key="today-section"
                        onAddSubmit={async ({ title, description }) => {
                          await submitNewTask(title, description);
                        }}
                        title={formatTodaySectionTitle()}
                      >
                        {renderFlatRows((item) => !overdueTreeIds.has(item.id))}
                      </TaskGroup>
                    ) : (
                      <div className={`${styles.rootList} fk-task-list`} key="today-flat">
                        {renderFlatRows((item) => !overdueTreeIds.has(item.id))}
                        <AddTask
                          keepOpenOnSubmit
                          onSubmit={async ({ title, description }) => {
                            await submitNewTask(title, description);
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`${styles.rootList} fk-task-list`} key="flat-list">
                    {renderFlatRows(() => true)}
                    <AddTask
                      keepOpenOnSubmit
                      onSubmit={async ({ title, description }) => {
                        await submitNewTask(title, description);
                      }}
                    />
                  </div>
                )}
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
                      tags={resolveTaskTagLabels(activeTask)}
                      title={activeTask.title}
                    />
                  </DnDGhostShell>
                ) : null}
              </DragOverlay>
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
            groupKey: parent?.groupKey ?? "inbox",
            parentTaskId,
          });
        }}
        onDelete={async (taskId) => {
          await deleteMutation.mutateAsync(taskId);
          setTaskQuery(null);
        }}
        onManageLabels={() => {
          openLabelsAfterTaskCloseRef.current = true;
          setTaskQuery(null);
        }}
        onOpenChange={(open) => {
          if (!open) setTaskQuery(null);
        }}
        onOpenSubtask={(taskId) => setTaskQuery(taskId)}
        onReorderSubtasks={async (orderedIds) => {
          if (!selectedTask) return;
          const placements = orderedIds.map((id, sortOrder) => ({
            id,
            groupKey: selectedTask.groupKey,
            parentTaskId: selectedTask.id,
            sortOrder,
          }));
          await relocateMutation.mutateAsync({ placements });
        }}
        onUpdate={async (taskId, patch) => {
          await updateMutation.mutateAsync({ id: taskId, ...patch });
        }}
        open={Boolean(selectedTask)}
        breadcrumbItems={selectedBreadcrumbItems}
        subtasks={selectedSubtasks}
        task={selectedTask}
      />
      {pendingDeleteTask ? (
        <ConfirmDeleteModal
          {...deleteConfirmCopy("task", pendingDeleteTask.title)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(pendingDeleteTask.id);
            if (selectedTaskId === pendingDeleteTask.id) {
              setTaskQuery(null);
            }
          }}
          onOpenChange={(open) => {
            if (!open) setPendingDeleteTask(null);
          }}
          open
        />
      ) : null}
    </div>
  );
}
