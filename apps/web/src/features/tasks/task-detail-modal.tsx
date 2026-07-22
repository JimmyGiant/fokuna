"use client";

import type { LabelDto, TaskDto } from "@fokuna/api-contracts";
import { FokunaIcon } from "@fokuna/icons";
import {
  Breadcrumb,
  collapseBreadcrumbItems,
  DatePicker,
  Dropdown,
  MetaMenu,
  Tag,
  TaskGroup,
  TaskListItem,
  TaskModalDialog,
  TaskModalHeader,
  TaskModalMenu,
  TaskModalSlot,
} from "@fokuna/ui";
import { useMemo, useState } from "react";

import { useTaskTaxonomy } from "./aufgaben-shell";
import styles from "./task-detail-modal.module.css";
import { colorTokenToTone } from "./taxonomy";
import { TaskTagsMenuPanel } from "./task-property-editor";
import { estimateOptions, priorityOptions } from "./task-property-options";

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
  canCreateSubtask = true,
  onOpenChange,
  onOpenSubtask,
  onUpdate,
  onCreateSubtask,
  onDelete,
  onManageLabels,
}: {
  open: boolean;
  task: TaskDto | null;
  subtasks: TaskDto[];
  breadcrumbItems?: Array<{
    id: string;
    label: string;
  }>;
  /** False at nesting depth 5 — no further subtasks may be created. */
  canCreateSubtask?: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSubtask?: (taskId: string) => void;
  onUpdate: (taskId: string, patch: Partial<TaskDto>) => Promise<void>;
  onCreateSubtask: (payload: {
    parentTaskId: string;
    title: string;
    description?: string;
  }) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  /** Close this modal first, then open label management (avoids stacked dialogs). */
  onManageLabels?: () => void;
}) {
  const { labelsById } = useTaskTaxonomy();
  const [openProperty, setOpenProperty] = useState<OpenProperty>(null);

  const selectablePriorities = priorityOptions;
  const displayPriority = task?.priority === "high" ? "urgent" : (task?.priority ?? "none");
  const priorityOption =
    selectablePriorities.find((option) => option.value === displayPriority) ??
    priorityOptions.find((option) => option.value === "none");
  const dueDate = task?.dueDate ? new Date(`${task.dueDate}T12:00:00`) : undefined;
  const estimate = task?.estimateMinutes ? String(task.estimateMinutes) : undefined;
  const selectedLabelIds = task?.labelIds ?? [];

  const selectedLabels = useMemo(
    () =>
      selectedLabelIds
        .map((id) => labelsById.get(id))
        .filter((label): label is LabelDto => Boolean(label))
        .map((label) => ({
          id: label.id,
          name: label.name,
          tone: colorTokenToTone(label.colorToken),
        })),
    [labelsById, selectedLabelIds],
  );

  function resolveLabelNames(labelIds: string[]): string[] {
    return labelIds
      .map((id) => labelsById.get(id)?.name)
      .filter((name): name is string => Boolean(name));
  }

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
                value: selectedLabels.length ? (
                  <div aria-label="Ausgewählte Etiketten" className="fk-task-rail-tags">
                    {selectedLabels.map((tag) => (
                      <Tag
                        icon="tag"
                        key={tag.id}
                        onRemove={() =>
                          void onUpdate(task.id, {
                            labelIds: selectedLabelIds.filter((id) => id !== tag.id),
                          })
                        }
                        removable
                        size="sm"
                        tone={tag.tone}
                      >
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                ) : undefined,
                content: (
                  <TaskTagsMenuPanel
                    onManageLabels={
                      onManageLabels
                        ? () => {
                            setOpenProperty(null);
                            onManageLabels();
                          }
                        : undefined
                    }
                    onUpdate={onUpdate}
                    task={task}
                  />
                ),
              },
            ]}
          />
        }
        onClose={() => onOpenChange(false)}
      >
        {canCreateSubtask ? (
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
                tags={resolveLabelNames(subtask.labelIds)}
                title={subtask.title}
              />
            ))}
          </TaskGroup>
        ) : null}
      </TaskModalSlot>
    </TaskModalDialog>
  );
}
