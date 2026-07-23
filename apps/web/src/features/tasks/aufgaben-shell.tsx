"use client";

import {
  DragOverlay,
  useDndContext,
  useDndMonitor,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import type {
  CategoryDto,
  GoalDto,
  LabelDto,
  TaskDto,
  UserProfileDto,
} from "@fokuna/api-contracts";
import {
  applySortOrders,
  resolveTasksSidebarPreferences,
  todayIsoDateString,
  type TasksSidebarPreferences,
  type TasksSidebarSectionId,
} from "@fokuna/domain";
import { FokunaIcon } from "@fokuna/icons";
import {
  SecondaryNavItem,
  Sidebar,
  SidebarAvatar,
  UiShell,
  useToast,
  FokunaContextMenu,
  type SidebarItem,
  type SidebarSecondaryItem,
  type SidebarSecondarySection,
} from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import styles from "@/components/app-shell.module.css";
import {
  ConfirmDeleteModal,
  deleteConfirmCopy,
  type DeleteEntityKind,
} from "@/components/confirm-delete-modal";
import { DnDGhostShell } from "@/components/dnd/dnd-ghost-shell";
import { sortableItemStyle } from "@/components/dnd/sortable-styles";
import { apiGet, apiSend } from "@/lib/api";
import { TaxonomyCreateModal, TaxonomyOrganizeModal } from "./taxonomy-manager-modal";
import { priorityOptions } from "./task-property-options";
import { SidebarEditModal } from "./sidebar-edit-modal";
import {
  SIDEBAR_DROP,
  collectCategoryDeleteTaskIds,
  colorTokenToCssVar,
  isSidebarTaxonomyDrag,
  parseSidebarDropTarget,
  parseSidebarTaxonomySortableId,
  type SidebarTaxonomyDragData,
  type SidebarTaxonomySection,
} from "./taxonomy";
import { TasksDndHost } from "./tasks-dnd-host";

function normalizePriority(priority: TaskDto["priority"]): TaskDto["priority"] {
  return priority === "high" ? "urgent" : priority;
}

type ShellSecondaryItem = SidebarSecondaryItem & {
  sortableId: string;
  entityId: string;
};

type ShellSecondarySection = Omit<SidebarSecondarySection, "id" | "items"> & {
  id: SidebarTaxonomySection;
  items: ShellSecondaryItem[];
};

/** No post-drop layout slide — list order updates instantly after commit. */
const taxonomyAnimateLayoutChanges: AnimateLayoutChanges = () => false;

const primaryItems: SidebarItem[] = [
  { id: "calendar", label: "Kalender", href: "/app/kalender", icon: "calendar" },
  { id: "tasks", label: "Aufgaben", href: "/app/aufgaben", icon: "circle-check" },
  { id: "journal", label: "Journal", href: "/app/journal", icon: "writing" },
  { id: "goals", label: "Ziele", href: "/app/ziele", icon: "focus-target" },
  { id: "insights", label: "Insights", href: "/app/insights", icon: "trending" },
];

const footerItems: SidebarItem[] = [
  { id: "settings", label: "Einstellungen", href: "/app/einstellungen", icon: "settings-gear" },
];

type TaxonomyKind = "category" | "label";
type TaxonomyUi =
  | null
  | { kind: TaxonomyKind; view: "create" }
  | { kind: TaxonomyKind; view: "organize"; selectedId?: string };

type TaxonomyContextValue = {
  categories: CategoryDto[];
  labels: LabelDto[];
  labelsById: Map<string, LabelDto>;
  openLabelManager: () => void;
};

const TaxonomyContext = createContext<TaxonomyContextValue | null>(null);

export function useTaskTaxonomy() {
  const value = useContext(TaxonomyContext);
  if (!value) {
    throw new Error("useTaskTaxonomy must be used within AufgabenShell");
  }
  return value;
}

function DroppableNavItem({
  item,
  activeId,
}: {
  item: SidebarSecondaryItem;
  activeId?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: item.droppableId ?? `nav:${item.id}`,
    disabled: !item.droppableId,
    data: { type: "sidebar-nav", navId: item.id },
  });

  return (
    <SecondaryNavItem
      activeId={activeId}
      item={{ ...item, dropOver: Boolean(item.droppableId && isOver) }}
      itemRef={item.droppableId ? setNodeRef : undefined}
    />
  );
}

function SortableTaxonomyNavItem({
  item,
  activeId,
  section,
}: {
  item: ShellSecondaryItem;
  activeId?: string;
  section: SidebarTaxonomySection;
}) {
  const { active } = useDndContext();
  const { attributes, listeners, setNodeRef, isDragging, isOver } = useSortable({
    id: item.sortableId,
    animateLayoutChanges: taxonomyAnimateLayoutChanges,
    transition: null,
    data: {
      type: "sidebar-taxonomy",
      section,
      entityId: item.entityId,
    } satisfies SidebarTaxonomyDragData,
  });

  const isTaskDropOver =
    Boolean(item.droppableId) &&
    isOver &&
    active != null &&
    !isSidebarTaxonomyDrag(active.data.current);

  return (
    <SecondaryNavItem
      activeId={activeId}
      item={{ ...item, dropOver: isTaskDropOver || undefined }}
      itemRef={setNodeRef}
      liProps={{ ...attributes, ...listeners }}
      placeholder={isDragging}
      style={sortableItemStyle({
        // Live DOM order owns the slot — same as task list.
        transform: null,
        transition: undefined,
        layoutControlled: true,
      })}
    />
  );
}

function isTaxonomyDragActive(active: { id: unknown; data: { current?: unknown } }) {
  return (
    isSidebarTaxonomyDrag(active.data.current) ||
    Boolean(parseSidebarTaxonomySortableId(String(active.id)))
  );
}

/** Free-floating ghost — same DnD language as task DragOverlay. */
function SidebarTaxonomyDragOverlay({
  itemsBySortableId,
}: {
  itemsBySortableId: Map<string, ShellSecondaryItem>;
}) {
  const [activeSortableId, setActiveSortableId] = useState<string | null>(null);
  const [width, setWidth] = useState<number | undefined>();

  useDndMonitor({
    onDragStart(event) {
      if (!isTaxonomyDragActive(event.active)) return;
      setActiveSortableId(String(event.active.id));
      const initial = event.active.rect.current.initial;
      setWidth(initial?.width);
    },
    onDragEnd() {
      setActiveSortableId(null);
      setWidth(undefined);
    },
    onDragCancel() {
      setActiveSortableId(null);
      setWidth(undefined);
    },
  });

  const item = activeSortableId ? itemsBySortableId.get(activeSortableId) : null;

  return (
    <DragOverlay dropAnimation={null}>
      {item ? (
        <DnDGhostShell>
          <ul
            className="fk-sidebar__secondary-list"
            style={{ margin: 0, padding: 0, width: width ?? undefined }}
          >
            <SecondaryNavItem dragging item={item} />
          </ul>
        </DnDGhostShell>
      ) : null}
    </DragOverlay>
  );
}

function SecondarySectionStatic({
  label,
  items,
  activeId,
}: {
  label: string;
  items: SidebarSecondaryItem[];
  activeId?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      className="fk-sidebar__secondary-section"
      data-expanded={expanded || undefined}
      onContextMenu={(event) => event.stopPropagation()}
    >
      <header>
        <strong>{label}</strong>
        {/* No add control — predefined entries (e.g. priority levels). */}
        <span aria-hidden="true" />
        <button
          aria-expanded={expanded}
          aria-label={expanded ? `${label} einklappen` : `${label} ausklappen`}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          <FokunaIcon name={expanded ? "chevron-up" : "chevron-down"} size={16} stroke={1.5} />
        </button>
      </header>
      {expanded ? (
        <ul className="fk-sidebar__secondary-list">
          {items.map((item) => (
            <SecondaryNavItem activeId={activeId} item={item} key={item.id} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function SecondarySectionDroppable({
  section,
  activeId,
  onReorderCommit,
}: {
  section: ShellSecondarySection;
  activeId?: string;
  onReorderCommit: (
    section: SidebarTaxonomySection,
    orderedEntityIds: string[],
  ) => void | Promise<void>;
}) {
  const [expanded, setExpanded] = useState(true);
  const baseSortableIds = useMemo(
    () => section.items.map((item) => item.sortableId),
    [section.items],
  );
  const [liveSortableIds, setLiveSortableIds] = useState<string[] | null>(null);
  const liveIdsRef = useRef<string[] | null>(null);
  const dragActiveRef = useRef(false);
  const itemsBySortableId = useMemo(() => {
    const map = new Map(section.items.map((item) => [item.sortableId, item]));
    return map;
  }, [section.items]);

  // Clear live order only after drag ends and query data matches.
  // Must not run during drag: at start live === base, clearing freezes the placeholder.
  useEffect(() => {
    if (dragActiveRef.current || !liveSortableIds) return;
    if (
      baseSortableIds.length === liveSortableIds.length &&
      baseSortableIds.every((id, index) => id === liveSortableIds[index])
    ) {
      setLiveSortableIds(null);
      liveIdsRef.current = null;
    }
  }, [baseSortableIds, liveSortableIds]);

  useDndMonitor({
    onDragStart(event) {
      if (!isTaxonomyDragActive(event.active)) return;
      const meta =
        (isSidebarTaxonomyDrag(event.active.data.current)
          ? event.active.data.current
          : null) ?? parseSidebarTaxonomySortableId(String(event.active.id));
      if (!meta || meta.section !== section.id) return;

      const ids = section.items.map((item) => item.sortableId);
      dragActiveRef.current = true;
      liveIdsRef.current = ids;
      setLiveSortableIds(ids);
    },
    onDragOver(event) {
      const ids = liveIdsRef.current;
      if (!ids || !dragActiveRef.current || !event.over) return;
      if (!isTaxonomyDragActive(event.active)) return;

      const draggedId = String(event.active.id);
      const overId = String(event.over.id);
      // After a live move, `over` is often the placeholder itself — wait for a neighbor.
      if (draggedId === overId) return;

      const overMeta =
        (isSidebarTaxonomyDrag(event.over.data.current)
          ? event.over.data.current
          : null) ?? parseSidebarTaxonomySortableId(overId);
      if (!overMeta || overMeta.section !== section.id) return;

      const activeIndex = ids.indexOf(draggedId);
      const overIndex = ids.indexOf(overId);
      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return;

      // Short L2 rows: move as soon as `over` flips — no midpoint hysteresis
      // (that fights DOM remounts and causes flicker on ~32px rows).
      const next = arrayMove(ids, activeIndex, overIndex);
      liveIdsRef.current = next;
      setLiveSortableIds(next);
    },
    onDragEnd() {
      if (!dragActiveRef.current) return;
      dragActiveRef.current = false;

      const live = liveIdsRef.current;
      if (!live) return;

      const changed = live.some((id, index) => id !== baseSortableIds[index]);
      if (!changed) {
        liveIdsRef.current = null;
        setLiveSortableIds(null);
        return;
      }

      const orderedEntityIds = live
        .map((id) => itemsBySortableId.get(id)?.entityId)
        .filter((id): id is string => Boolean(id));
      if (orderedEntityIds.length !== live.length) return;

      // Keep live order visible until baseSortableIds catches up (effect).
      void Promise.resolve(onReorderCommit(section.id, orderedEntityIds)).catch(() => {
        liveIdsRef.current = null;
        setLiveSortableIds(null);
      });
    },
    onDragCancel() {
      if (!dragActiveRef.current) return;
      dragActiveRef.current = false;
      liveIdsRef.current = null;
      setLiveSortableIds(null);
    },
  });

  const sortableIds = liveSortableIds ?? baseSortableIds;
  const displayItems = useMemo(
    () =>
      sortableIds
        .map((id) => itemsBySortableId.get(id))
        .filter((item): item is ShellSecondaryItem => Boolean(item)),
    [itemsBySortableId, sortableIds],
  );

  return (
    <section
      className="fk-sidebar__secondary-section"
      data-expanded={expanded || undefined}
      onContextMenu={(event) => event.stopPropagation()}
    >
      <header>
        <strong>{section.label}</strong>
        {section.onAdd ? (
          <button aria-label={`${section.label} hinzufügen`} onClick={section.onAdd} type="button">
            <FokunaIcon name="add-small" size={16} stroke={1.5} />
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <button
          aria-expanded={expanded}
          aria-label={expanded ? `${section.label} einklappen` : `${section.label} ausklappen`}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          <FokunaIcon name={expanded ? "chevron-up" : "chevron-down"} size={16} stroke={1.5} />
        </button>
      </header>
      {expanded ? (
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <ul className="fk-sidebar__secondary-list">
            {displayItems.map((item) => (
              <SortableTaxonomyNavItem
                activeId={activeId}
                item={item}
                key={item.id}
                section={section.id}
              />
            ))}
          </ul>
        </SortableContext>
      ) : null}
    </section>
  );
}

function sortBySortOrderThenName<T extends { sortOrder: number; name: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
  );
}

function sortGoals(items: GoalDto[]): GoalDto[] {
  return [...items].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.title.localeCompare(b.title, "de", { sensitivity: "base" }),
  );
}

function countOpenTasks(tasks: TaskDto[], predicate: (task: TaskDto) => boolean): number {
  return tasks.filter((task) => !task.archivedAt && !task.parentTaskId && predicate(task)).length;
}

function todayIsoDate() {
  return todayIsoDateString();
}

export function AufgabenShell({
  secondaryActiveId,
  children,
  overlay,
}: {
  secondaryActiveId?: string;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [taxonomyUi, setTaxonomyUi] = useState<TaxonomyUi>(null);
  const [sidebarEditOpen, setSidebarEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    kind: DeleteEntityKind;
    id: string;
    name: string;
    taskCount?: number;
  } | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiGet<TaskDto[]>("/api/v1/tasks"),
  });
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<UserProfileDto>("/api/v1/profile"),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<CategoryDto[]>("/api/v1/categories"),
  });
  const labelsQuery = useQuery({
    queryKey: ["labels"],
    queryFn: () => apiGet<LabelDto[]>("/api/v1/labels"),
  });
  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiGet<GoalDto[]>("/api/v1/goals"),
  });

  const updateProfile = useMutation({
    mutationFn: (payload: { tasksSidebar: TasksSidebarPreferences }) =>
      apiSend<UserProfileDto>("/api/v1/profile", "PATCH", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const tasks = tasksQuery.data ?? [];
  const categories = useMemo(
    () => sortBySortOrderThenName(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const labels = useMemo(
    () => sortBySortOrderThenName(labelsQuery.data ?? []),
    [labelsQuery.data],
  );
  const goals = useMemo(() => sortGoals(goalsQuery.data ?? []), [goalsQuery.data]);

  const createCategory = useMutation({
    mutationFn: (payload: { name: string; colorToken: CategoryDto["colorToken"] }) =>
      apiSend<CategoryDto>("/api/v1/categories", "POST", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  const updateCategory = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: {
      id: string;
      name?: string;
      colorToken?: CategoryDto["colorToken"];
    }) => apiSend<CategoryDto>(`/api/v1/categories/${id}`, "PATCH", patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  const deleteCategory = useMutation({
    mutationFn: (id: string) => apiSend(`/api/v1/categories/${id}`, "DELETE"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const createLabel = useMutation({
    mutationFn: (payload: { name: string; colorToken: LabelDto["colorToken"] }) =>
      apiSend<LabelDto>("/api/v1/labels", "POST", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });
  const updateLabel = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: {
      id: string;
      name?: string;
      colorToken?: LabelDto["colorToken"];
    }) => apiSend<LabelDto>(`/api/v1/labels/${id}`, "PATCH", patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });
  const deleteLabel = useMutation({
    mutationFn: (id: string) => apiSend(`/api/v1/labels/${id}`, "DELETE"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["labels"] });
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<TaskDto>) =>
      apiSend<TaskDto>(`/api/v1/tasks/${id}`, "PATCH", patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const labelsById = useMemo(() => {
    const map = new Map<string, LabelDto>();
    for (const label of labels) map.set(label.id, label);
    return map;
  }, [labels]);

  const openLabelManager = useCallback(
    () => setTaxonomyUi({ kind: "label", view: "organize" }),
    [],
  );

  const taxonomyValue = useMemo<TaxonomyContextValue>(
    () => ({ categories, labels, labelsById, openLabelManager }),
    [categories, labels, labelsById, openLabelManager],
  );

  const sidebarPrefs = useMemo(
    () => resolveTasksSidebarPreferences(profileQuery.data?.uiPreferences),
    [profileQuery.data?.uiPreferences],
  );
  const hiddenSidebarIds = useMemo(
    () => new Set(sidebarPrefs.hiddenIds),
    [sidebarPrefs.hiddenIds],
  );

  const secondaryNavById = useMemo(
    () =>
      ({
        all: {
          id: "all",
          label: "Alle Aufgaben",
          href: "/app/aufgaben",
          icon: "checklist" as const,
        },
        favorites: {
          id: "favorites",
          label: "Favoriten",
          href: "/app/aufgaben?filter=favorites",
          icon: "star" as const,
          droppableId: SIDEBAR_DROP.favorites,
        },
        today: {
          id: "today",
          label: "Heute",
          href: "/app/aufgaben?filter=today",
          icon: "calendar-today" as const,
          droppableId: SIDEBAR_DROP.today,
        },
        inbox: {
          id: "inbox",
          label: "Eingang",
          href: "/app/aufgaben?filter=inbox",
          icon: "inbox-empty" as const,
          droppableId: SIDEBAR_DROP.inbox,
        },
      }) satisfies Record<
        "all" | "favorites" | "today" | "inbox",
        SidebarSecondaryItem
      >,
    [],
  );

  const secondaryItems: SidebarSecondaryItem[] = useMemo(() => {
    return sidebarPrefs.navOrder
      .filter((id) => id === "inbox" || !hiddenSidebarIds.has(id))
      .map((id) => secondaryNavById[id]);
  }, [hiddenSidebarIds, secondaryNavById, sidebarPrefs.navOrder]);

  const secondarySections: ShellSecondarySection[] = useMemo(    () => [
      {
        id: "categories",
        label: "Kategorien",
        onAdd: () => setTaxonomyUi({ kind: "category", view: "create" }),
        items: categories.map((category) => ({
          id: `category:${category.id}`,
          sortableId: SIDEBAR_DROP.category(category.id),
          entityId: category.id,
          label: category.name,
          href: `/app/aufgaben?category=${category.id}`,
          badge: String(countOpenTasks(tasks, (task) => task.categoryId === category.id)),
          color: colorTokenToCssVar(category.colorToken),
          droppableId: SIDEBAR_DROP.category(category.id),
          contextMenuItems: [
            {
              label: "Bearbeiten",
              icon: "edit" as const,
              onSelect: () =>
                setTaxonomyUi({
                  kind: "category",
                  view: "organize",
                  selectedId: category.id,
                }),
            },
            {
              label: "Löschen",
              icon: "delete-alt" as const,
              destructive: true,
              onSelect: () => {
                setPendingDelete({
                  kind: "category",
                  id: category.id,
                  name: category.name,
                  taskCount: collectCategoryDeleteTaskIds(tasks, category.id).size,
                });
              },
            },
          ],
        })),
      },
      {
        id: "goals",
        label: "Ziele",
        items: goals.map((goal) => ({
          id: `goal:${goal.id}`,
          sortableId: SIDEBAR_DROP.goal(goal.id),
          entityId: goal.id,
          label: goal.title,
          href: "/app/aufgaben/ziele",
          icon: "focus-target" as const,
          badge: String(countOpenTasks(tasks, (task) => task.goalId === goal.id)),
        })),
      },
      {
        id: "labels",
        label: "Labels",
        onAdd: () => setTaxonomyUi({ kind: "label", view: "create" }),
        items: labels.map((label) => ({
          id: `label:${label.id}`,
          sortableId: SIDEBAR_DROP.label(label.id),
          entityId: label.id,
          label: label.name,
          href: `/app/aufgaben?label=${label.id}`,
          icon: "tag" as const,
          iconColor: colorTokenToCssVar(label.colorToken),
          badge: String(countOpenTasks(tasks, (task) => task.labelIds.includes(label.id))),
          droppableId: SIDEBAR_DROP.label(label.id),
          contextMenuItems: [
            {
              label: "Bearbeiten",
              icon: "edit" as const,
              onSelect: () =>
                setTaxonomyUi({
                  kind: "label",
                  view: "organize",
                  selectedId: label.id,
                }),
            },
            {
              label: "Löschen",
              icon: "delete-alt" as const,
              destructive: true,
              onSelect: () => {
                setPendingDelete({
                  kind: "label",
                  id: label.id,
                  name: label.name,
                });
              },
            },
          ],
        })),
      },
    ],
    [categories, goals, labels, tasks],
  );

  const prioritySectionItems: SidebarSecondaryItem[] = useMemo(
    () =>
      priorityOptions.map((option) => ({
        id: `priority:${option.value}`,
        label: option.label,
        href: `/app/aufgaben?priority=${option.value}`,
        icon: "flag" as const,
        iconColor: option.color,
        badge: String(
          countOpenTasks(
            tasks,
            (task) => normalizePriority(task.priority) === option.value,
          ),
        ),
      })),
    [tasks],
  );

  const orderedSidebarSections = useMemo(() => {
    const taxonomyById = new Map(
      secondarySections.map((section) => [section.id as TasksSidebarSectionId, section]),
    );
    return sidebarPrefs.sectionOrder
      .filter((id) => !hiddenSidebarIds.has(id))
      .map((id) => {
        if (id === "priority") {
          return {
            kind: "priority" as const,
            id,
            label: "Priorität",
            items: prioritySectionItems,
          };
        }
        const section = taxonomyById.get(id);
        if (!section) return null;
        return { kind: "taxonomy" as const, section };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }, [hiddenSidebarIds, prioritySectionItems, secondarySections, sidebarPrefs.sectionOrder]);

  const persistTaxonomyOrder = useCallback(
    async (section: SidebarTaxonomySection, orderedIds: string[]) => {
      const path =
        section === "categories"
          ? "/api/v1/categories"
          : section === "labels"
            ? "/api/v1/labels"
            : "/api/v1/goals";
      const queryKey =
        section === "categories"
          ? (["categories"] as const)
          : section === "labels"
            ? (["labels"] as const)
            : (["goals"] as const);

      const previous = queryClient.getQueryData(queryKey);

      if (section === "categories") {
        const current = sortBySortOrderThenName(
          (queryClient.getQueryData<CategoryDto[]>(queryKey) ?? []).slice(),
        );
        queryClient.setQueryData(
          queryKey,
          applySortOrders(current, orderedIds),
        );
      } else if (section === "labels") {
        const current = sortBySortOrderThenName(
          (queryClient.getQueryData<LabelDto[]>(queryKey) ?? []).slice(),
        );
        queryClient.setQueryData(queryKey, applySortOrders(current, orderedIds));
      } else {
        const current = sortGoals((queryClient.getQueryData<GoalDto[]>(queryKey) ?? []).slice());
        queryClient.setQueryData(queryKey, applySortOrders(current, orderedIds));
      }

      try {
        if (section === "categories") {
          const next = await apiSend<CategoryDto[]>(path, "PUT", { orderedIds });
          queryClient.setQueryData(queryKey, next);
        } else if (section === "labels") {
          const next = await apiSend<LabelDto[]>(path, "PUT", { orderedIds });
          queryClient.setQueryData(queryKey, next);
        } else {
          const next = await apiSend<GoalDto[]>(path, "PUT", { orderedIds });
          queryClient.setQueryData(queryKey, next);
        }
      } catch (error) {
        queryClient.setQueryData(queryKey, previous);
        toast({
          id: `sidebar-reorder:${section}`,
          title: "Reihenfolge konnte nicht gespeichert werden",
        });
        throw error;
      }
    },
    [queryClient, toast],
  );

  const handleTaxonomyReorderCommit = useCallback(
    (section: SidebarTaxonomySection, orderedEntityIds: string[]) =>
      persistTaxonomyOrder(section, orderedEntityIds),
    [persistTaxonomyOrder],
  );

  const taxonomyItemsBySortableId = useMemo(() => {
    const map = new Map<string, ShellSecondaryItem>();
    for (const section of secondarySections) {
      for (const item of section.items) {
        map.set(item.sortableId, item);
      }
    }
    return map;
  }, [secondarySections]);

  async function handleSidebarDrop(taskId: string, overId: string) {
    const target = parseSidebarDropTarget(overId);
    if (!target) return false;
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task) return false;

    if (target.type === "favorites") {
      await updateTask.mutateAsync({ id: taskId, isFavorite: true });
      return true;
    }
    if (target.type === "today") {
      await updateTask.mutateAsync({ id: taskId, dueDate: todayIsoDate() });
      return true;
    }
    if (target.type === "inbox") {
      await updateTask.mutateAsync({ id: taskId, categoryId: null });
      return true;
    }
    if (target.type === "category") {
      if (task.categoryId === target.categoryId) return true;
      const previousCategoryId = task.categoryId;
      const categoryName = categories.find((entry) => entry.id === target.categoryId)?.name;
      await updateTask.mutateAsync({ id: taskId, categoryId: target.categoryId });
      toast({
        id: `task-category:${taskId}`,
        title: categoryName ? `Nach „${categoryName}“ verschoben` : "Aufgabe verschoben",
        action: {
          label: "Rückgängig",
          altText: "Verschieben rückgängig machen",
          leadingIcon: "arrow-undo-down",
          onClick: () => {
            void updateTask.mutateAsync({ id: taskId, categoryId: previousCategoryId });
          },
        },
      });
      return true;
    }
    if (target.type === "label") {
      if (task.labelIds.includes(target.labelId)) return true;
      const previousLabelIds = task.labelIds;
      const labelName = labels.find((entry) => entry.id === target.labelId)?.name;
      await updateTask.mutateAsync({
        id: taskId,
        labelIds: [...task.labelIds, target.labelId],
      });
      toast({
        id: `task-label:${taskId}:${target.labelId}`,
        title: labelName ? `Label „${labelName}“ hinzugefügt` : "Label hinzugefügt",
        action: {
          label: "Rückgängig",
          altText: "Label-Zuweisung rückgängig machen",
          leadingIcon: "arrow-undo-down",
          onClick: () => {
            void updateTask.mutateAsync({ id: taskId, labelIds: previousLabelIds });
          },
        },
      });
      return true;
    }
    return false;
  }

  return (
    <TaxonomyContext.Provider value={taxonomyValue}>
      <TasksDndHost onSidebarDrop={handleSidebarDrop}>
        <UiShell
          className={styles.shell}
          overlay={overlay}
          sidebar={
            <Sidebar
              activeId="tasks"
              footer={
                <SidebarAvatar alt="Demo Nutzer" src="/pattern-library/demo-profile.png" />
              }
              footerItems={footerItems}
              items={primaryItems}
              logo={
                <Image
                  alt="Fokuna"
                  height={32}
                  src="/branding/fokuna_logo_no-text.svg"
                  width={34}
                />
              }
              secondary={
                <FokunaContextMenu
                  items={[
                    {
                      label: "Seitenleiste bearbeiten",
                      icon: "edit",
                      onSelect: () => setSidebarEditOpen(true),
                    },
                  ]}
                >
                  <div className="fk-sidebar__secondary-stack">
                    <ul
                      className="fk-sidebar__secondary-list fk-sidebar__secondary-list--nav"
                      onContextMenu={(event) => event.stopPropagation()}
                    >
                      {secondaryItems.map((item) => (
                        <DroppableNavItem
                          activeId={secondaryActiveId}
                          item={item}
                          key={item.id}
                        />
                      ))}
                    </ul>
                    {orderedSidebarSections.map((entry) =>
                      entry.kind === "priority" ? (
                        <SecondarySectionStatic
                          activeId={secondaryActiveId}
                          items={entry.items}
                          key={entry.id}
                          label={entry.label}
                        />
                      ) : (
                        <SecondarySectionDroppable
                          activeId={secondaryActiveId}
                          key={entry.section.id}
                          onReorderCommit={handleTaxonomyReorderCommit}
                          section={entry.section}
                        />
                      ),
                    )}
                  </div>
                </FokunaContextMenu>
              }
              secondaryActiveId={secondaryActiveId}
            />
          }
        >
          <div className={styles.content}>{children}</div>
        </UiShell>
        <SidebarTaxonomyDragOverlay itemsBySortableId={taxonomyItemsBySortableId} />
      </TasksDndHost>

      <SidebarEditModal
        onOpenChange={setSidebarEditOpen}
        onSave={async (next) => {
          const previous = sidebarPrefs;
          await updateProfile.mutateAsync({ tasksSidebar: next });
          toast({
            id: "tasks-sidebar-prefs",
            title: "Seitenleiste bearbeitet",
            action: {
              label: "Rückgängig",
              altText: "Seitenleisten-Änderung rückgängig machen",
              leadingIcon: "arrow-undo-down",
              onClick: () => {
                void updateProfile.mutateAsync({ tasksSidebar: previous });
              },
            },
          });
        }}
        open={sidebarEditOpen}
        value={sidebarPrefs}
      />

      <TaxonomyCreateModal
        kind="category"
        onCreate={async (input) => {
          await createCategory.mutateAsync(input);
        }}
        onOpenChange={(open) => {
          if (!open && taxonomyUi?.kind === "category" && taxonomyUi.view === "create") {
            setTaxonomyUi(null);
          }
        }}
        onOpenManage={() => setTaxonomyUi({ kind: "category", view: "organize" })}
        open={taxonomyUi?.kind === "category" && taxonomyUi.view === "create"}
      />
      <TaxonomyCreateModal
        kind="label"
        onCreate={async (input) => {
          await createLabel.mutateAsync(input);
        }}
        onOpenChange={(open) => {
          if (!open && taxonomyUi?.kind === "label" && taxonomyUi.view === "create") {
            setTaxonomyUi(null);
          }
        }}
        onOpenManage={() => setTaxonomyUi({ kind: "label", view: "organize" })}
        open={taxonomyUi?.kind === "label" && taxonomyUi.view === "create"}
      />
      <TaxonomyOrganizeModal
        getDeleteTaskCount={(id) => collectCategoryDeleteTaskIds(tasks, id).size}
        initialSelectedId={
          taxonomyUi?.kind === "category" && taxonomyUi.view === "organize"
            ? (taxonomyUi.selectedId ?? null)
            : null
        }
        items={categories}
        kind="category"
        onDelete={async (id) => {
          await deleteCategory.mutateAsync(id);
        }}
        onOpenChange={(open) => {
          if (!open && taxonomyUi?.kind === "category" && taxonomyUi.view === "organize") {
            setTaxonomyUi(null);
          }
        }}
        onOpenCreate={() => setTaxonomyUi({ kind: "category", view: "create" })}
        onUpdate={async (id, input) => {
          await updateCategory.mutateAsync({ id, ...input });
        }}
        open={taxonomyUi?.kind === "category" && taxonomyUi.view === "organize"}
      />
      <TaxonomyOrganizeModal
        initialSelectedId={
          taxonomyUi?.kind === "label" && taxonomyUi.view === "organize"
            ? (taxonomyUi.selectedId ?? null)
            : null
        }
        items={labels}
        kind="label"
        onDelete={async (id) => {
          await deleteLabel.mutateAsync(id);
        }}
        onOpenChange={(open) => {
          if (!open && taxonomyUi?.kind === "label" && taxonomyUi.view === "organize") {
            setTaxonomyUi(null);
          }
        }}
        onOpenCreate={() => setTaxonomyUi({ kind: "label", view: "create" })}
        onUpdate={async (id, input) => {
          await updateLabel.mutateAsync({ id, ...input });
        }}
        open={taxonomyUi?.kind === "label" && taxonomyUi.view === "organize"}
      />
      {pendingDelete ? (
        <ConfirmDeleteModal
          {...deleteConfirmCopy(pendingDelete.kind, pendingDelete.name, {
            taskCount: pendingDelete.taskCount,
          })}
          onConfirm={async () => {
            if (pendingDelete.kind === "category") {
              await deleteCategory.mutateAsync(pendingDelete.id);
            } else {
              await deleteLabel.mutateAsync(pendingDelete.id);
            }
          }}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          open
        />
      ) : null}
    </TaxonomyContext.Provider>
  );
}
