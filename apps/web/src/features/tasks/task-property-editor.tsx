"use client";

import type { TaskDto } from "@fokuna/api-contracts";
import { toIsoDateString } from "@fokuna/domain";
import { FokunaIcon } from "@fokuna/icons";
import {
  Button,
  DatePicker,
  Dropdown,
  SearchField,
  useFokunaContextMenuClose,
  useToast,
} from "@fokuna/ui";
import { useMemo, useState, type CSSProperties } from "react";

import { useTaskTaxonomy } from "./aufgaben-shell";
import { colorTokenToCssVar } from "./taxonomy";
import { estimateOptions } from "./task-property-options";

export function TaskDueDateMenuPanel({
  task,
  onUpdate,
}: {
  task: TaskDto;
  onUpdate: (taskId: string, patch: Partial<TaskDto>) => void;
}) {
  const closeMenu = useFokunaContextMenuClose();
  const dueDate = task.dueDate ? new Date(`${task.dueDate}T12:00:00`) : undefined;

  function commit(patch: Partial<TaskDto>) {
    onUpdate(task.id, patch);
    closeMenu?.();
  }

  return (
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
                commit({ dueDate: null });
                return;
              }
              const next = new Date();
              if (key === "tomorrow") next.setDate(next.getDate() + 1);
              commit({ dueDate: toIsoDateString(next) });
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
          commit({ dueDate: toIsoDateString(nextValue) });
        }}
        value={dueDate}
      />
    </div>
  );
}

export function TaskEstimateMenuPanel({
  task,
  onUpdate,
}: {
  task: TaskDto;
  onUpdate: (taskId: string, patch: Partial<TaskDto>) => void;
}) {
  const closeMenu = useFokunaContextMenuClose();
  const estimate = task.estimateMinutes ? String(task.estimateMinutes) : undefined;

  function commit(minutes: number) {
    onUpdate(task.id, { estimateMinutes: minutes });
    closeMenu?.();
  }

  return (
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
            onClick={() => commit(Number(value))}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <Dropdown
        aria-label="Zeitschätzung auswählen"
        controlSize="md"
        onValueChange={(value) => commit(Number(value))}
        options={estimateOptions}
        placeholder="Dauer wählen"
        value={estimate}
      />
    </div>
  );
}

/**
 * Shared Labels picker — Modal rail popover and list context-menu submenu panel.
 * Multi-select stays open while toggling; "Labels verwalten" closes via onManageLabels.
 */
export function TaskLabelsMenuPanel({
  task,
  onUpdate,
  onManageLabels,
}: {
  task: TaskDto;
  onUpdate: (taskId: string, patch: Partial<TaskDto>) => void | Promise<void>;
  onManageLabels?: () => void;
}) {
  const closeMenu = useFokunaContextMenuClose();
  const { toast } = useToast();
  const { labels } = useTaskTaxonomy();
  const [labelQuery, setLabelQuery] = useState("");
  const selectedLabelIds = task.labelIds ?? [];

  const catalog = useMemo(
    () =>
      labels.map((label) => ({
        id: label.id,
        name: label.name,
        color: colorTokenToCssVar(label.colorToken),
        surface: `color-mix(in srgb, ${colorTokenToCssVar(label.colorToken)} 16%, transparent)`,
      })),
    [labels],
  );

  const filteredLabels = useMemo(() => {
    const query = labelQuery.trim().toLowerCase();
    if (!query) return catalog;
    return catalog.filter((label) => label.name.toLowerCase().includes(query));
  }, [catalog, labelQuery]);

  function toggleLabel(label: { id: string; name: string }, selected: boolean) {
    if (selected) {
      void onUpdate(task.id, {
        labelIds: selectedLabelIds.filter((id) => id !== label.id),
      });
      return;
    }

    const previousLabelIds = selectedLabelIds;
    void onUpdate(task.id, {
      labelIds: [...selectedLabelIds, label.id],
    });
    toast({
      id: `task-label:${task.id}:${label.id}`,
      title: `Label „${label.name}“ hinzugefügt`,
      action: {
        label: "Rückgängig",
        altText: "Label-Zuweisung rückgängig machen",
        leadingIcon: "arrow-undo-down",
        onClick: () => {
          void onUpdate(task.id, { labelIds: previousLabelIds });
        },
      },
    });
  }

  return (
    <div className="fk-task-tag-manager">
      <SearchField
        aria-label="Labels durchsuchen"
        collapsedWidth={278}
        controlSize="md"
        expandedWidth={278}
        onChange={(event) => setLabelQuery(event.target.value)}
        placeholder="Label suchen ..."
        value={labelQuery}
      />
      <div aria-label="Labels" className="fk-task-tag-manager__list">
        {filteredLabels.map((label) => {
          const selected = selectedLabelIds.includes(label.id);
          return (
            <button
              aria-pressed={selected}
              data-selected={selected || undefined}
              key={label.id}
              onClick={() => toggleLabel(label, selected)}
              style={{ "--task-tag-surface": label.surface } as CSSProperties}
              type="button"
            >
              <FokunaIcon name="tag" size={16} style={{ color: label.color }} />
              <span>{label.name}</span>
              {selected ? <FokunaIcon name="check-small" size={16} stroke={2} /> : null}
            </button>
          );
        })}
      </div>
      {onManageLabels ? (
        <Button
          buttonType="icon-text-inline"
          className="fk-task-tag-manager__manage"
          intent="tertiary"
          leadingIcon={<FokunaIcon name="edit" size={16} stroke={1.5} />}
          onClick={() => {
            closeMenu?.();
            onManageLabels();
          }}
          type="button"
        >
          Labels verwalten
        </Button>
      ) : null}
    </div>
  );
}

/** @deprecated Use TaskLabelsMenuPanel */
export const TaskTagsMenuPanel = TaskLabelsMenuPanel;
