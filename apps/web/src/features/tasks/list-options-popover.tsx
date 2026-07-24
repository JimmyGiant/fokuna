"use client";

import {
  countTasksListFilterDeviations,
  countTasksListSortDeviations,
  type TasksListDateFilter,
  type TasksListGrouping,
  type TasksListPriorityValue,
  type TasksListSortDirection,
  type TasksListSorting,
  type TasksListViewCapabilities,
  type TasksListViewPreferences,
  type TasksListViewPreferencesPatch,
} from "@fokuna/domain";
import { FokunaIcon } from "@fokuna/icons";
import {
  Checkbox,
  Dropdown,
  OverflowButton,
  Popover,
  SearchField,
  Switch,
} from "@fokuna/ui";
import { useMemo, useState, type ReactNode } from "react";

import { priorityOptions } from "./task-property-options";
import styles from "./list-options-popover.module.css";

const GROUPING_OPTIONS: Array<{ value: TasksListGrouping; label: string }> = [
  { value: "none", label: "Keine" },
  { value: "date", label: "Datum" },
  { value: "added", label: "Hinzufügungsdatum" },
  { value: "deadline", label: "Deadline" },
  { value: "priority", label: "Priorität" },
  { value: "label", label: "Etikett" },
];

const SORTING_OPTIONS: Array<{ value: TasksListSorting; label: string }> = [
  { value: "manual", label: "Manuell" },
  { value: "name", label: "Name" },
  { value: "date", label: "Datum" },
  { value: "added", label: "Hinzufügungsdatum" },
  { value: "deadline", label: "Deadline" },
  { value: "priority", label: "Priorität" },
];

const DIRECTION_OPTIONS: Array<{ value: TasksListSortDirection; label: string }> = [
  { value: "asc", label: "Aufsteigend" },
  { value: "desc", label: "Absteigend" },
];

const DATE_FILTER_OPTIONS: Array<{ value: TasksListDateFilter; label: string }> = [
  { value: "all", label: "Alle" },
  { value: "today", label: "Heute" },
  { value: "this_week", label: "Diese Woche" },
  { value: "next_7_days", label: "Nächste 7 Tage" },
  { value: "this_month", label: "Dieser Monat" },
  { value: "next_30_days", label: "Nächste 30 Tage" },
  { value: "no_date", label: "Kein Datum" },
];

export interface ListOptionsPopoverProps {
  prefs: TasksListViewPreferences;
  capabilities: TasksListViewCapabilities;
  active: boolean;
  disabled?: boolean;
  labels: Array<{ id: string; name: string }>;
  onChange: (patch: TasksListViewPreferencesPatch) => void;
  onReset: () => void;
}

export function ListOptionsPopover({
  prefs,
  capabilities,
  active,
  disabled,
  labels,
  onChange,
  onReset,
}: ListOptionsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const sortCount = countTasksListSortDeviations(prefs, capabilities);
  const filterCount = countTasksListFilterDeviations(prefs, capabilities);

  const priorityLabel =
    prefs.filters.priorities.length === 0
      ? "Alle"
      : prefs.filters.priorities.length === 1
        ? (priorityOptions.find((option) => option.value === prefs.filters.priorities[0])?.label ??
          "1")
        : `${prefs.filters.priorities.length} ausgewählt`;

  const labelFilterLabel =
    prefs.filters.labelIds.length === 0
      ? "Alle"
      : prefs.filters.labelIds.length === 1
        ? (labels.find((label) => label.id === prefs.filters.labelIds[0])?.name ?? "1")
        : `${prefs.filters.labelIds.length} ausgewählt`;

  return (
    <Popover.Root modal={false} onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <OverflowButton active={active} aria-label="Listenoptionen" disabled={disabled} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className={styles.content}
          onOpenAutoFocus={(event) => event.preventDefault()}
          sideOffset={8}
        >
          <div className={styles.completedRow}>
            <span className={styles.completedLabel}>Erledigte Aufgaben</span>
            <Switch
              checked={prefs.showCompleted}
              controlSize="sm"
              disabled={disabled || !capabilities.showCompleted}
              onCheckedChange={(checked) => onChange({ showCompleted: checked })}
            />
          </div>

          <section className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => setSortOpen((value) => !value)}
              type="button"
            >
              <span className={styles.sectionTitle}>Sortieren</span>
              {sortCount > 0 ? <span className={styles.sectionBadge}>{sortCount}</span> : null}
              <FokunaIcon
                className={styles.sectionChevron}
                name="chevron-down-small"
                size={16}
              />
            </button>
            {sortOpen ? (
              <div className={styles.sectionBody}>
                {capabilities.grouping ? (
                  <FieldRow
                    dirty={prefs.grouping !== "none"}
                    label="Gruppierung"
                  >
                    <Dropdown
                      controlSize="sm"
                      disabled={disabled}
                      onValueChange={(value) =>
                        onChange({ grouping: value as TasksListGrouping })
                      }
                      options={GROUPING_OPTIONS}
                      value={prefs.grouping}
                    />
                  </FieldRow>
                ) : null}
                {capabilities.sorting ? (
                  <FieldRow dirty={prefs.sorting !== "manual"} label="Sortierung">
                    <Dropdown
                      controlSize="sm"
                      disabled={disabled}
                      onValueChange={(value) =>
                        onChange({ sorting: value as TasksListSorting })
                      }
                      options={SORTING_OPTIONS}
                      value={prefs.sorting}
                    />
                  </FieldRow>
                ) : null}
                {capabilities.sorting && prefs.sorting !== "manual" ? (
                  <FieldRow label="Richtung">
                    <Dropdown
                      controlSize="sm"
                      disabled={disabled}
                      onValueChange={(value) =>
                        onChange({ sortDirection: value as TasksListSortDirection })
                      }
                      options={DIRECTION_OPTIONS}
                      value={prefs.sortDirection}
                    />
                  </FieldRow>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => setFilterOpen((value) => !value)}
              type="button"
            >
              <span className={styles.sectionTitle}>Filter</span>
              {filterCount > 0 ? <span className={styles.sectionBadge}>{filterCount}</span> : null}
              <FokunaIcon
                className={styles.sectionChevron}
                name="chevron-down-small"
                size={16}
              />
            </button>
            {filterOpen ? (
              <div className={styles.sectionBody}>
                {capabilities.filterDate ? (
                  <FieldRow dirty={prefs.filters.date !== "all"} label="Datum">
                    <Dropdown
                      controlSize="sm"
                      disabled={disabled}
                      onValueChange={(value) =>
                        onChange({ filters: { date: value as TasksListDateFilter } })
                      }
                      options={DATE_FILTER_OPTIONS}
                      value={prefs.filters.date}
                    />
                  </FieldRow>
                ) : null}
                {capabilities.filterPriority ? (
                  <FieldRow dirty={prefs.filters.priorities.length > 0} label="Priorität">
                    <MultiSelectPanel
                      label={priorityLabel}
                      options={priorityOptions.map((option) => ({
                        value: option.value,
                        label: option.label,
                        color: option.color,
                      }))}
                      selected={prefs.filters.priorities}
                      onChange={(priorities) =>
                        onChange({
                          filters: { priorities: priorities as TasksListPriorityValue[] },
                        })
                      }
                    />
                  </FieldRow>
                ) : null}
                {capabilities.filterLabel ? (
                  <FieldRow dirty={prefs.filters.labelIds.length > 0} label="Etikett">
                    <MultiSelectPanel
                      label={labelFilterLabel}
                      options={labels.map((label) => ({
                        value: label.id,
                        label: label.name,
                      }))}
                      searchable
                      searchPlaceholder="Etikett eingeben"
                      selected={prefs.filters.labelIds}
                      onChange={(labelIds) => onChange({ filters: { labelIds } })}
                    />
                  </FieldRow>
                ) : null}
              </div>
            ) : null}
          </section>

          <button
            className={styles.resetButton}
            disabled={disabled || !active}
            onClick={onReset}
            type="button"
          >
            Alles zurücksetzen
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function FieldRow({
  label,
  dirty,
  children,
}: {
  label: string;
  dirty?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>
        {label}
        {dirty ? <span aria-hidden className={styles.rowDot} /> : null}
      </span>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

function MultiSelectPanel({
  label,
  options,
  selected,
  onChange,
  searchable,
  searchPlaceholder,
}: {
  label: string;
  options: Array<{ value: string; label: string; color?: string }>;
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  }

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <button className={styles.multiTrigger} type="button">
          <span>{label}</span>
          <FokunaIcon name="chevron-down-small" size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" className={styles.multiPanel} sideOffset={6}>
          {searchable ? (
            <SearchField
              aria-label={searchPlaceholder ?? "Suchen"}
              collapsedWidth={204}
              controlSize="sm"
              expandedWidth={204}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder ?? "Suchen..."}
              value={query}
            />
          ) : null}
          {filtered.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <label
                className={styles.multiItem}
                data-selected={isSelected || undefined}
                key={option.value}
              >
                <Checkbox
                  checked={isSelected}
                  controlSize="sm"
                  onCheckedChange={() => toggle(option.value)}
                />
                {option.color ? (
                  <FokunaIcon name="flag" size={16} style={{ color: option.color }} />
                ) : (
                  <FokunaIcon name="tag" size={16} />
                )}
                <span>{option.label}</span>
              </label>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
