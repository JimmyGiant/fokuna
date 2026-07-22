"use client";

import { useDroppable } from "@dnd-kit/core";
import type { CategoryDto, LabelDto, TaskDto } from "@fokuna/api-contracts";
import { FokunaIcon } from "@fokuna/icons";
import {
  SecondaryNavItem,
  Sidebar,
  SidebarAvatar,
  UiShell,
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
  useMemo,
  useState,
  type ReactNode,
} from "react";

import styles from "@/components/app-shell.module.css";
import { apiGet, apiSend } from "@/lib/api";
import { TaxonomyCreateModal, TaxonomyOrganizeModal } from "./taxonomy-manager-modal";
import { SIDEBAR_DROP, colorTokenToCssVar, parseSidebarDropTarget } from "./taxonomy";
import { TasksDndHost } from "./tasks-dnd-host";

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
  | { kind: TaxonomyKind; view: "organize" };

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

function SecondarySectionDroppable({
  section,
  activeId,
}: {
  section: SidebarSecondarySection;
  activeId?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      className="fk-sidebar__secondary-section"
      data-expanded={expanded || undefined}
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
        <ul className="fk-sidebar__secondary-list">
          {section.items.map((item) => (
            <DroppableNavItem activeId={activeId} item={item} key={item.id} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function countOpenTasks(tasks: TaskDto[], predicate: (task: TaskDto) => boolean): number {
  return tasks.filter((task) => !task.archivedAt && !task.parentTaskId && predicate(task)).length;
}

function todayIsoDate() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today.toISOString().slice(0, 10);
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
  const [taxonomyUi, setTaxonomyUi] = useState<TaxonomyUi>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiGet<TaskDto[]>("/api/v1/tasks"),
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
    queryFn: () => apiGet<Array<{ id: string; title: string }>>("/api/v1/goals"),
  });

  const tasks = tasksQuery.data ?? [];
  const categories = useMemo(
    () =>
      [...(categoriesQuery.data ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
      ),
    [categoriesQuery.data],
  );
  const labels = useMemo(
    () =>
      [...(labelsQuery.data ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
      ),
    [labelsQuery.data],
  );
  const goals = goalsQuery.data ?? [];

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

  const secondaryItems: SidebarSecondaryItem[] = useMemo(
    () => [
      { id: "all", label: "Alle Aufgaben", href: "/app/aufgaben", icon: "checklist" },
      {
        id: "favorites",
        label: "Favoriten",
        href: "/app/aufgaben?filter=favorites",
        icon: "star",
        droppableId: SIDEBAR_DROP.favorites,
      },
      {
        id: "today",
        label: "Heute",
        href: "/app/aufgaben?filter=today",
        icon: "calendar-today",
        droppableId: SIDEBAR_DROP.today,
      },
      {
        id: "inbox",
        label: "Eingang",
        href: "/app/aufgaben?filter=inbox",
        icon: "inbox-empty",
        droppableId: SIDEBAR_DROP.inbox,
      },
    ],
    [],
  );

  const secondarySections: SidebarSecondarySection[] = useMemo(
    () => [
      {
        id: "categories",
        label: "Kategorien",
        onAdd: () => setTaxonomyUi({ kind: "category", view: "create" }),
        items: categories.map((category) => ({
          id: `category:${category.id}`,
          label: category.name,
          href: `/app/aufgaben?category=${category.id}`,
          badge: String(countOpenTasks(tasks, (task) => task.categoryId === category.id)),
          color: colorTokenToCssVar(category.colorToken),
          droppableId: SIDEBAR_DROP.category(category.id),
        })),
      },
      {
        id: "goals",
        label: "Ziele",
        items: goals.map((goal) => ({
          id: `goal:${goal.id}`,
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
          label: label.name,
          href: `/app/aufgaben?label=${label.id}`,
          icon: "tag" as const,
          iconColor: colorTokenToCssVar(label.colorToken),
          badge: String(countOpenTasks(tasks, (task) => task.labelIds.includes(label.id))),
          droppableId: SIDEBAR_DROP.label(label.id),
        })),
      },
    ],
    [categories, goals, labels, tasks],
  );

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
      await updateTask.mutateAsync({ id: taskId, categoryId: target.categoryId });
      return true;
    }
    if (target.type === "label") {
      if (task.labelIds.includes(target.labelId)) return true;
      await updateTask.mutateAsync({
        id: taskId,
        labelIds: [...task.labelIds, target.labelId],
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
                <div className="fk-sidebar__secondary-stack">
                  <ul className="fk-sidebar__secondary-list fk-sidebar__secondary-list--nav">
                    {secondaryItems.map((item) => (
                      <DroppableNavItem
                        activeId={secondaryActiveId}
                        item={item}
                        key={item.id}
                      />
                    ))}
                  </ul>
                  {secondarySections.map((section) => (
                    <SecondarySectionDroppable
                      activeId={secondaryActiveId}
                      key={section.id}
                      section={section}
                    />
                  ))}
                </div>
              }
              secondaryActiveId={secondaryActiveId}
            />
          }
        >
          <div className={styles.content}>{children}</div>
        </UiShell>
      </TasksDndHost>

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
    </TaxonomyContext.Provider>
  );
}
