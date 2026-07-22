"use client";

import type { TaskDto } from "@fokuna/api-contracts";
import { FokunaIcon } from "@fokuna/icons";
import {
  Button,
  DatePicker,
  Dropdown,
  SearchField,
  useFokunaContextMenuClose,
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
              next.setHours(12, 0, 0, 0);
              if (key === "tomorrow") next.setDate(next.getDate() + 1);
              commit({ dueDate: next.toISOString().slice(0, 10) });
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
          commit({ dueDate: nextValue.toISOString().slice(0, 10) });
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
 * Shared Tags picker — Modal rail popover and list context-menu submenu panel.
 * Multi-select stays open while toggling; "Tags verwalten" closes via onManageLabels.
 */
export function TaskTagsMenuPanel({
  task,
  onUpdate,
  onManageLabels,
}: {
  task: TaskDto;
  onUpdate: (taskId: string, patch: Partial<TaskDto>) => void | Promise<void>;
  onManageLabels?: () => void;
}) {
  const closeMenu = useFokunaContextMenuClose();
  const { labels } = useTaskTaxonomy();
  const [tagQuery, setTagQuery] = useState("");
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

  const filteredTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase();
    if (!query) return catalog;
    return catalog.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [catalog, tagQuery]);

  return (
    <div className="fk-task-tag-manager">
      <SearchField
        aria-label="Tags durchsuchen"
        collapsedWidth={278}
        controlSize="md"
        expandedWidth={278}
        onChange={(event) => setTagQuery(event.target.value)}
        placeholder="Etikett suchen ..."
        value={tagQuery}
      />
      <div aria-label="Etiketten" className="fk-task-tag-manager__list">
        {filteredTags.map((tag) => {
          const selected = selectedLabelIds.includes(tag.id);
          return (
            <button
              aria-pressed={selected}
              data-selected={selected || undefined}
              key={tag.id}
              onClick={() =>
                void onUpdate(task.id, {
                  labelIds: selected
                    ? selectedLabelIds.filter((id) => id !== tag.id)
                    : [...selectedLabelIds, tag.id],
                })
              }
              style={{ "--task-tag-surface": tag.surface } as CSSProperties}
              type="button"
            >
              <FokunaIcon name="tag" size={16} style={{ color: tag.color }} />
              <span>{tag.name}</span>
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
          Tags verwalten
        </Button>
      ) : null}
    </div>
  );
}
