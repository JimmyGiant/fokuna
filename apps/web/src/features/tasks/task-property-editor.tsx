"use client";

import type { TaskDto } from "@fokuna/api-contracts";
import { DatePicker, Dropdown, useFokunaContextMenuClose } from "@fokuna/ui";

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
