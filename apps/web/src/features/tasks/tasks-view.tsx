"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlockDto, CalendarEntryDto, TaskDto } from "@fokuna/api-contracts";
import {
  canCreateSubtaskAtDepth,
  TASK_MAX_INDENT_LEVEL,
  type TaskIndentLevel,
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
import { Children, useMemo, useState, type ReactNode } from "react";

import { apiGet, apiSend } from "@/lib/api";
import { TaskDetailModal } from "./task-detail-modal";
import { TaskDueDateMenuPanel, TaskEstimateMenuPanel } from "./task-property-editor";
import { priorityOptions } from "./task-property-options";
import styles from "./tasks-view.module.css";

const ROOT_GROUP = "root";

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

function SortableTask({
  task,
  children,
  goalTitle,
  subtaskLabel,
  indentLevel = 0,
  contextMenuItems,
  onOpen,
  onToggle,
  onFavorite,
}: {
  task: TaskDto;
  children?: ReactNode;
  goalTitle?: string;
  subtaskLabel?: string;
  indentLevel?: TaskIndentLevel;
  contextMenuItems?: FokunaContextMenuEntry[];
  onOpen: (task: TaskDto) => void;
  onToggle: (task: TaskDto, completed: boolean) => void;
  onFavorite: (task: TaskDto, favorite: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskListItem
        completed={task.isCompleted}
        contextMenuItems={contextMenuItems}
        due={formatDueLabel(task.dueDate)}
        dueTone={dueMetaTone(task.dueDate)}
        favorite={task.isFavorite}
        goal={goalTitle}
        indentLevel={indentLevel}
        onClick={() => onOpen(task)}
        onCompletedChange={(completed) => onToggle(task, completed)}
        onFavoriteChange={(favorite) => onFavorite(task, favorite)}
        state={isDragging ? "dragged" : "default"}
        subtasks={subtaskLabel}
        tags={task.tags}
        title={task.title}
      >
        {Children.count(children) > 0 ? children : undefined}
      </TaskListItem>
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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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

  const reorderMutation = useMutation({
    mutationFn: (payload: { groupKey: string; orderedIds: string[] }) =>
      apiSend<TaskDto[]>("/api/v1/tasks", "PUT", payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<TaskDto[]>(["tasks"]);
      if (previous) {
        const byId = new Map(previous.map((task) => [task.id, task]));
        const nextGroup = payload.orderedIds
          .map((id, index) => {
            const task = byId.get(id);
            return task ? { ...task, sortOrder: index } : null;
          })
          .filter(Boolean) as TaskDto[];
        const others = previous.filter((task) => task.groupKey !== payload.groupKey);
        queryClient.setQueryData(["tasks"], [...nextGroup, ...others]);
      }
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const goalTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const goal of goalsQuery.data ?? []) {
      map.set(goal.id, goal.title);
    }
    return map;
  }, [goalsQuery.data]);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = todayIsoDate();
    const all = tasksQuery.data ?? [];

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
  }, [filter, search, showCompleted, tasksQuery.data]);

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

  const orderedGroupKeys = useMemo(() => {
    const keys = [...rootTasksByGroup.keys()];
    keys.sort((a, b) => {
      if (a === ROOT_GROUP) return -1;
      if (b === ROOT_GROUP) return 1;
      return a.localeCompare(b, "de");
    });
    if (!keys.includes(ROOT_GROUP)) {
      keys.unshift(ROOT_GROUP);
    }
    return keys;
  }, [rootTasksByGroup]);

  const activeTask = visibleTasks.find((task) => task.id === activeId) ?? null;
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

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) {
      return;
    }

    const tasks = tasksQuery.data ?? [];
    const activeTaskItem = tasks.find((task) => task.id === active.id);
    const overTaskItem = tasks.find((task) => task.id === over.id);
    if (!activeTaskItem || !overTaskItem || activeTaskItem.groupKey !== overTaskItem.groupKey) {
      return;
    }

    const groupTasks = tasks
      .filter((task) => task.groupKey === activeTaskItem.groupKey && !task.parentTaskId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = groupTasks.findIndex((task) => task.id === active.id);
    const newIndex = groupTasks.findIndex((task) => task.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const orderedIds = arrayMove(groupTasks, oldIndex, newIndex).map((task) => task.id);
    reorderMutation.mutate({ groupKey: activeTaskItem.groupKey, orderedIds });
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

  function renderNestedTask(task: TaskDto, indentLevel: TaskIndentLevel): ReactNode {
    const children = childrenByParent.get(task.id) ?? [];
    const subtaskLabel =
      children.length > 0
        ? `${children.filter((child) => child.isCompleted).length}/${children.length}`
        : undefined;
    const nextIndent = Math.min(indentLevel + 1, TASK_MAX_INDENT_LEVEL) as TaskIndentLevel;

    return (
      <TaskListItem
        completed={task.isCompleted}
        contextMenuItems={buildTaskContextMenuItems(task)}
        due={formatDueLabel(task.dueDate)}
        dueTone={dueMetaTone(task.dueDate)}
        favorite={task.isFavorite}
        goal={task.goalId ? goalTitles.get(task.goalId) : undefined}
        indentLevel={indentLevel}
        key={task.id}
        onClick={() => setTaskQuery(task.id)}
        onCompletedChange={(completed) =>
          updateMutation.mutate({ id: task.id, isCompleted: completed })
        }
        onFavoriteChange={(favorite) =>
          updateMutation.mutate({ id: task.id, isFavorite: favorite })
        }
        subtasks={subtaskLabel}
        tags={task.tags}
        title={task.title}
      >
        {children.map((child) => renderNestedTask(child, nextIndent))}
      </TaskListItem>
    );
  }

  function renderTask(task: TaskDto) {
    const children = childrenByParent.get(task.id) ?? [];
    const subtaskLabel =
      children.length > 0
        ? `${children.filter((child) => child.isCompleted).length}/${children.length}`
        : undefined;

    return (
      <SortableTask
        contextMenuItems={buildTaskContextMenuItems(task)}
        goalTitle={task.goalId ? goalTitles.get(task.goalId) : undefined}
        key={task.id}
        onFavorite={(current, favorite) =>
          updateMutation.mutate({ id: current.id, isFavorite: favorite })
        }
        onOpen={(current) => setTaskQuery(current.id)}
        onToggle={(current, completed) =>
          updateMutation.mutate({ id: current.id, isCompleted: completed })
        }
        subtaskLabel={subtaskLabel}
        task={task}
      >
        {children.map((child) => renderNestedTask(child, 1))}
      </SortableTask>
    );
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
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              sensors={sensors}
            >
              {orderedGroupKeys.map((groupKey) => {
                const tasks = rootTasksByGroup.get(groupKey) ?? [];
                if (groupKey === ROOT_GROUP) {
                  return (
                    <div className={`${styles.rootList} fk-task-list`} key={groupKey}>
                      <SortableContext
                        items={tasks.map((task) => task.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {tasks.map((task) => renderTask(task))}
                      </SortableContext>
                      <AddTask
                        onSubmit={async ({ title, description }) => {
                          await createMutation.mutateAsync({
                            title,
                            description: description || undefined,
                            groupKey: ROOT_GROUP,
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
                    <SortableContext
                      items={tasks.map((task) => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {tasks.map((task) => renderTask(task))}
                    </SortableContext>
                  </TaskGroup>
                );
              })}
              <DragOverlay>
                {activeTask ? (
                  <TaskListItem
                    completed={activeTask.isCompleted}
                    favorite={activeTask.isFavorite}
                    state="dragged"
                    tags={activeTask.tags}
                    title={activeTask.title}
                  />
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
