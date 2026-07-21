"use client";

import type { TaskDto } from "@fokuna/api-contracts";
import { FokunaIcon } from "@fokuna/icons";
import {
  Breadcrumb,
  collapseBreadcrumbItems,
  DatePicker,
  Dropdown,
  MetaMenu,
  SearchField,
  Tag,
  TaskGroup,
  TaskListItem,
  TaskModalDialog,
  TaskModalHeader,
  TaskModalMenu,
  TaskModalSlot,
} from "@fokuna/ui";
import { useMemo, useState, type CSSProperties } from "react";

import styles from "./task-detail-modal.module.css";

const priorityOptions = [
  { value: "urgent", label: "Hoch", color: "var(--fk-color-task-priority-urgent)" },
  { value: "medium", label: "Mittel", color: "var(--fk-color-task-priority-medium)" },
  { value: "low", label: "Niedrig", color: "var(--fk-color-task-priority-low)" },
  { value: "none", label: "Keine", color: "var(--fk-color-icon-tertiary)" },
] as const;

const estimateOptions = [
  { value: "30", label: "30 Min" },
  { value: "60", label: "1:00 Std" },
  { value: "90", label: "1:30 Std" },
  { value: "120", label: "2:00 Std" },
  { value: "180", label: "3 Std" },
  { value: "240", label: "4 Std" },
];

const tagCatalog = [
  {
    label: "Admin",
    tone: "teal" as const,
    color: "var(--fk-color-category-teal)",
    surface: "var(--fk-color-category-teal-10)",
  },
  {
    label: "Launch",
    tone: "coral" as const,
    color: "var(--fk-color-category-coral)",
    surface: "var(--fk-color-category-coral-10)",
  },
  {
    label: "Training",
    tone: "blue" as const,
    color: "var(--fk-color-category-blue)",
    surface: "var(--fk-color-category-blue-10)",
  },
  {
    label: "Fokus",
    tone: "purple" as const,
    color: "var(--fk-color-category-purple)",
    surface: "var(--fk-color-category-purple-10)",
  },
  {
    label: "Etikettenname",
    tone: "neutral" as const,
    color: "var(--fk-color-icon-tertiary)",
    surface: "var(--fk-color-surface-subtle)",
  },
];

type OpenProperty = "priority" | "due-date" | "estimate" | "tags" | null;

function formatDueLabel(dueDate: string | null): string | undefined {
  if (!dueDate) return undefined;
  const due = new Date(`${dueDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Morgen";
  return due.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function estimateLabel(minutes: number | null): string | undefined {
  if (!minutes) return undefined;
  if (minutes < 60) return `${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} Std` : `${hours}:${String(remainder).padStart(2, "0")} Std`;
}

export function TaskDetailModal({
  open,
  task,
  subtasks,
  breadcrumbItems,
  onOpenChange,
  onOpenSubtask,
  onUpdate,
  onCreateSubtask,
  onDelete,
}: {
  open: boolean;
  task: TaskDto | null;
  subtasks: TaskDto[];
  breadcrumbItems?: Array<{
    id: string;
    label: string;
  }>;
  onOpenChange: (open: boolean) => void;
  onOpenSubtask?: (taskId: string) => void;
  onUpdate: (taskId: string, patch: Partial<TaskDto>) => Promise<void>;
  onCreateSubtask: (payload: {
    parentTaskId: string;
    title: string;
    description?: string;
  }) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}) {
  const [openProperty, setOpenProperty] = useState<OpenProperty>(null);
  const [tagQuery, setTagQuery] = useState("");

  const selectablePriorities = priorityOptions;
  const displayPriority = task?.priority === "high" ? "urgent" : (task?.priority ?? "none");
  const priorityOption =
    selectablePriorities.find((option) => option.value === displayPriority) ??
    priorityOptions.find((option) => option.value === "none");
  const dueDate = task?.dueDate ? new Date(`${task.dueDate}T12:00:00`) : undefined;
  const estimate = task?.estimateMinutes ? String(task.estimateMinutes) : undefined;
  const selectedTags = task?.tags ?? [];

  const filteredTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase();
    if (!query) return tagCatalog;
    return tagCatalog.filter((tag) => tag.label.toLowerCase().includes(query));
  }, [tagQuery]);

  const breadcrumb = useMemo(() => {
    if (!task || !breadcrumbItems?.length) return undefined;

    const chain = [
      ...breadcrumbItems.map((item) => ({
        label: item.label,
        onClick: () => onOpenSubtask?.(item.id),
      })),
      { label: task.title },
    ];

    return <Breadcrumb items={collapseBreadcrumbItems(chain)} />;
  }, [breadcrumbItems, onOpenSubtask, task]);

  if (!task) {
    return null;
  }

  return (
    <TaskModalDialog
      onOpenChange={(next) => {
        if (!next) setOpenProperty(null);
        onOpenChange(next);
      }}
      open={open}
      title={task.title}
    >
      <TaskModalSlot
        actions={
          <MetaMenu
            items={[
              {
                label: "Aufgabe löschen",
                icon: "delete",
                destructive: true,
                onSelect: () => {
                  void onDelete(task.id);
                },
              },
            ]}
            label="Weitere Aufgabenaktionen"
            trigger={
              <button
                aria-label="Weitere Aufgabenaktionen"
                className={styles.overflow}
                type="button"
              >
                <FokunaIcon name="more-horizontal" size={16} stroke={1.5} />
              </button>
            }
          />
        }
        breadcrumb={breadcrumb}
        header={
          <TaskModalHeader
            completed={task.isCompleted}
            description={task.description ?? undefined}
            favorite={task.isFavorite}
            onCompletedChange={(completed) => void onUpdate(task.id, { isCompleted: completed })}
            onFavoriteChange={(favorite) => void onUpdate(task.id, { isFavorite: favorite })}
            onSave={async ({ title, description }) => {
              await onUpdate(task.id, {
                title,
                description: description || null,
              });
            }}
            title={task.title}
          />
        }
        menu={
          <TaskModalMenu
            items={[
              {
                label: "Priorität",
                onOpenChange: (next) => setOpenProperty(next ? "priority" : null),
                open: openProperty === "priority",
                value:
                  priorityOption && priorityOption.value !== "none" ? (
                    <span className="fk-task-rail-preview">
                      <FokunaIcon
                        fill="on"
                        name="flag"
                        size={16}
                        stroke={1.5}
                        style={{ color: priorityOption.color }}
                      />
                      <span>{priorityOption.label}</span>
                    </span>
                  ) : undefined,
                content: (
                  <div aria-label="Priorität auswählen" className="fk-task-property-menu">
                    {selectablePriorities.map((option) => (
                      <button
                        aria-pressed={displayPriority === option.value}
                        data-selected={displayPriority === option.value || undefined}
                        key={option.value}
                        onClick={() => {
                          void onUpdate(task.id, {
                            priority: option.value as TaskDto["priority"],
                          });
                          setOpenProperty(null);
                        }}
                        type="button"
                      >
                        <FokunaIcon
                          fill={option.value === "none" ? "off" : "on"}
                          name="flag"
                          size={16}
                          stroke={1.5}
                          style={{ color: option.color }}
                        />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ),
              },
              {
                label: "Fälligkeit",
                onOpenChange: (next) => setOpenProperty(next ? "due-date" : null),
                open: openProperty === "due-date",
                value: task.dueDate ? (
                  <span className="fk-task-rail-preview">
                    <FokunaIcon name="calendar" size={16} stroke={1.5} />
                    <span>{formatDueLabel(task.dueDate)}</span>
                  </span>
                ) : undefined,
                content: (
                  <div className="fk-task-property-panel">
                    <div className="fk-task-property-quick">
                      {(
                        [
                          ["today", "Heute"],
                          ["tomorrow", "Morgen"],
                          ["none", "Kein"],
                        ] as const
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            if (key === "none") {
                              void onUpdate(task.id, { dueDate: null });
                            } else {
                              const next = new Date();
                              next.setHours(12, 0, 0, 0);
                              if (key === "tomorrow") next.setDate(next.getDate() + 1);
                              void onUpdate(task.id, {
                                dueDate: next.toISOString().slice(0, 10),
                              });
                            }
                            setOpenProperty(null);
                          }}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <DatePicker
                      aria-label="Fälligkeit auswählen"
                      inline
                      onValueChange={(nextValue) => {
                        if (!(nextValue instanceof Date)) return;
                        void onUpdate(task.id, {
                          dueDate: nextValue.toISOString().slice(0, 10),
                        });
                        setOpenProperty(null);
                      }}
                      value={dueDate}
                    />
                  </div>
                ),
              },
              {
                label: "Zeitschätzung",
                onOpenChange: (next) => setOpenProperty(next ? "estimate" : null),
                open: openProperty === "estimate",
                value: estimateLabel(task.estimateMinutes) ? (
                  <span className="fk-task-rail-preview">
                    <FokunaIcon name="clock" size={16} stroke={1.5} />
                    <span>{estimateLabel(task.estimateMinutes)}</span>
                  </span>
                ) : undefined,
                content: (
                  <div className="fk-task-property-panel">
                    <div className="fk-task-property-quick">
                      {(
                        [
                          ["30", "30 Min"],
                          ["60", "1 Std"],
                          ["120", "2 Std"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          aria-pressed={estimate === value}
                          data-selected={estimate === value || undefined}
                          key={value}
                          onClick={() => {
                            void onUpdate(task.id, { estimateMinutes: Number(value) });
                            setOpenProperty(null);
                          }}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <Dropdown
                      aria-label="Zeitschätzung auswählen"
                      controlSize="md"
                      onValueChange={(value) => {
                        void onUpdate(task.id, { estimateMinutes: Number(value) });
                        setOpenProperty(null);
                      }}
                      options={estimateOptions}
                      placeholder="Dauer wählen"
                      value={estimate}
                    />
                  </div>
                ),
              },
              {
                label: "Tags",
                onOpenChange: (next) => setOpenProperty(next ? "tags" : null),
                open: openProperty === "tags",
                value: selectedTags.length ? (
                  <div aria-label="Ausgewählte Etiketten" className="fk-task-rail-tags">
                    {tagCatalog
                      .filter((tag) => selectedTags.includes(tag.label))
                      .map((tag) => (
                        <Tag
                          icon="tag"
                          key={tag.label}
                          onRemove={() =>
                            void onUpdate(task.id, {
                              tags: selectedTags.filter((label) => label !== tag.label),
                            })
                          }
                          removable
                          size="sm"
                          tone={tag.tone}
                        >
                          {tag.label}
                        </Tag>
                      ))}
                  </div>
                ) : undefined,
                content: (
                  <div className="fk-task-tag-manager">
                    <SearchField
                      aria-label="Tags durchsuchen"
                      collapsedWidth={278}
                      controlSize="sm"
                      expandedWidth={278}
                      onChange={(event) => setTagQuery(event.target.value)}
                      placeholder="Etikett suchen oder erstellen ..."
                      value={tagQuery}
                    />
                    <div aria-label="Etiketten" className="fk-task-tag-manager__list">
                      {filteredTags.map((tag) => (
                        <button
                          aria-pressed={selectedTags.includes(tag.label)}
                          data-selected={selectedTags.includes(tag.label) || undefined}
                          key={tag.label}
                          onClick={() =>
                            void onUpdate(task.id, {
                              tags: selectedTags.includes(tag.label)
                                ? selectedTags.filter((label) => label !== tag.label)
                                : [...selectedTags, tag.label],
                            })
                          }
                          style={{ "--task-tag-surface": tag.surface } as CSSProperties}
                          type="button"
                        >
                          <FokunaIcon name="tag" size={16} style={{ color: tag.color }} />
                          <span>{tag.label}</span>
                          {selectedTags.includes(tag.label) ? (
                            <FokunaIcon name="check-small" size={16} stroke={2} />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        }
        onClose={() => onOpenChange(false)}
      >
        <TaskGroup
          addLabel="Unteraufgabe hinzufügen"
          addNamePlaceholder="Unteraufgabenname"
          count={subtasks.length}
          onAddSubmit={async ({ title, description }) => {
            await onCreateSubtask({
              parentTaskId: task.id,
              title,
              description: description || undefined,
            });
          }}
          title="Unteraufgaben"
        >
          {subtasks.map((subtask) => (
            <TaskListItem
              completed={subtask.isCompleted}
              due={formatDueLabel(subtask.dueDate)}
              key={subtask.id}
              onClick={() => onOpenSubtask?.(subtask.id)}
              onCompletedChange={(completed) =>
                void onUpdate(subtask.id, { isCompleted: completed })
              }
              tags={subtask.tags}
              title={subtask.title}
            />
          ))}
        </TaskGroup>
      </TaskModalSlot>
    </TaskModalDialog>
  );
}
