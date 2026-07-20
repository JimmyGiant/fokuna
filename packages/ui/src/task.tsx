"use client";

import { FokunaIcon } from "@fokuna/icons";
import { useState, type HTMLAttributes, type ReactNode } from "react";

import { Button } from "./button";
import { Checkbox } from "./selection-control";
import { Tag } from "./tag";
import { cn } from "./utils";

export type TaskItemState = "default" | "hover" | "selected" | "dragged" | "placeholder";

export interface TaskListItemProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  completed?: boolean;
  favorite?: boolean;
  state?: TaskItemState;
  goal?: string;
  due?: string;
  tags?: string[];
  subtasks?: string;
  milestone?: boolean;
  milestoneTask?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  indentLevel?: 0 | 1;
  onCompletedChange?: (completed: boolean) => void;
  onExpandedChange?: (expanded: boolean) => void;
  onFavoriteChange?: (favorite: boolean) => void;
}

function SubtaskIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 12 12" width="12">
      <path
        d="M4.33301 2.66699C4.33301 1.74663 3.58732 1.00018 2.66699 1C1.74652 1 1 1.74652 1 2.66699C1.00018 3.58732 1.74663 4.33301 2.66699 4.33301V5.33301L2.39355 5.31934C1.13878 5.19168 0.141165 4.19427 0.0136719 2.93945L0 2.66699C0 1.19423 1.19423 0 2.66699 0L2.93945 0.0136719C4.28408 0.150289 5.33301 1.28632 5.33301 2.66699L5.31934 2.93945C5.18271 4.28396 4.0475 5.33284 2.66699 5.33301V4.33301C3.58721 4.33283 4.33283 3.58721 4.33301 2.66699Z"
        fill="currentColor"
      />
      <path
        d="M10.9998 9.33368C10.9998 8.41331 10.2541 7.66686 9.33374 7.66669C8.41327 7.66669 7.66675 8.4132 7.66675 9.33368C7.66692 10.254 8.41337 10.9997 9.33374 10.9997V11.9997L9.0603 11.986C7.80553 11.8584 6.80791 10.861 6.68042 9.60614L6.66675 9.33368C6.66675 7.86092 7.86098 6.66669 9.33374 6.66669L9.6062 6.68036C10.9508 6.81698 11.9998 7.95301 11.9998 9.33368L11.9861 9.60614C11.8495 10.9506 10.7143 11.9995 9.33374 11.9997V10.9997C10.254 10.9995 10.9996 10.2539 10.9998 9.33368Z"
        fill="currentColor"
      />
      <path
        d="M2.16675 7.33368V4.66669H3.16675V7.33368C3.16692 8.16196 3.83843 8.83368 4.66675 8.83368H7.33374V9.83368H4.66675C3.28614 9.83368 2.16692 8.71424 2.16675 7.33368Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TaskListItem({
  title,
  description,
  completed,
  favorite,
  state = "default",
  goal,
  due,
  tags = [],
  subtasks,
  milestone,
  milestoneTask,
  expandable,
  expanded: expandedProp,
  defaultExpanded = true,
  indentLevel = 0,
  onCompletedChange,
  onExpandedChange,
  onFavoriteChange,
  className,
  children,
  ...props
}: TaskListItemProps) {
  const [internalFavorite, setInternalFavorite] = useState(Boolean(favorite));
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isFavorite = onFavoriteChange ? Boolean(favorite) : internalFavorite;
  const resolvedGoal = goal ?? (milestone || milestoneTask ? "Mein Ziel" : undefined);
  const isExpandable = milestoneTask ? false : (expandable ?? Boolean(subtasks));
  const isExpanded = expandedProp ?? internalExpanded;
  const hasMeta = Boolean(description || subtasks || resolvedGoal || due || tags.length);

  function setExpanded(nextExpanded: boolean) {
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  }

  if (state === "placeholder") {
    return <div {...props} className={cn("fk-task-item fk-task-item--placeholder", className)} />;
  }

  const item = (
    <div
      {...props}
      aria-grabbed={state === "dragged" || undefined}
      className={cn("fk-task-item", className)}
      data-has-meta={hasMeta || undefined}
      data-indent={indentLevel || undefined}
      data-milestone={milestone || undefined}
      data-milestone-task={milestoneTask || undefined}
      data-expanded={isExpandable ? isExpanded : undefined}
      data-state={state}
      draggable
    >
      <div className="fk-task-item__primary-row">
        <button aria-label="Aufgabe verschieben" className="fk-task-item__drag" type="button">
          <FokunaIcon name="drag-handle-grid" />
        </button>
        {isExpandable ? (
          <button
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Aufgabendetails ausblenden" : "Aufgabendetails einblenden"}
            className="fk-task-item__expand"
            onClick={() => setExpanded(!isExpanded)}
            type="button"
          >
            <FokunaIcon
              name={isExpanded ? "chevron-down" : "chevron-right"}
              size={16}
              stroke={1.5}
            />
          </button>
        ) : (
          <span className="fk-task-item__expand-spacer" />
        )}
        <span data-no-drag>
          <Checkbox
            checked={completed}
            controlSize="md"
            onCheckedChange={(next) => onCompletedChange?.(next === true)}
            variant={milestone ? "milestone" : "default"}
          />
        </span>
        <span className="fk-task-item__content">
          <strong>{title}</strong>
          {description ? <small>{description}</small> : null}
          {hasMeta ? (
            <span className="fk-task-item__meta">
              {subtasks ? <Tag icon={<SubtaskIcon />}>{subtasks}</Tag> : null}
              {resolvedGoal ? (
                <Tag icon="focus-target" tone="teal">
                  {resolvedGoal}
                </Tag>
              ) : null}
              {due ? (
                <Tag icon="calendar" tone="coral">
                  {due}
                </Tag>
              ) : null}
              {tags.map((tag) => (
                <Tag icon="tag" key={tag}>
                  {tag}
                </Tag>
              ))}
            </span>
          ) : null}
        </span>
        <button
          aria-label={isFavorite ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
          className="fk-task-item__favorite"
          data-favorite={isFavorite || undefined}
          onClick={() => {
            const next = !isFavorite;
            if (!onFavoriteChange) setInternalFavorite(next);
            onFavoriteChange?.(next);
          }}
          type="button"
        >
          <FokunaIcon fill={isFavorite ? "on" : "off"} name="star" />
        </button>
      </div>
    </div>
  );

  if (!children) return item;

  return (
    <div className="fk-task-item-tree" data-expanded={isExpanded}>
      {item}
      {isExpanded ? <div className="fk-task-item-tree__children">{children}</div> : null}
    </div>
  );
}

export interface TaskGroupHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  count?: number;
  expanded?: boolean;
  draggable?: boolean;
  actions?: ReactNode;
  milestone?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function TaskGroupHeader({
  title,
  count,
  expanded = true,
  draggable,
  actions,
  milestone,
  onExpandedChange,
  className,
  ...props
}: TaskGroupHeaderProps) {
  return (
    <div
      {...props}
      className={cn("fk-task-group__header", className)}
      data-milestone={milestone || undefined}
    >
      {milestone ? <span aria-hidden="true" className="fk-task-group__milestone" /> : null}
      {draggable ? (
        <span className="fk-task-group__drag">
          <FokunaIcon name="drag-handle-grid" />
        </span>
      ) : null}
      <button
        aria-expanded={expanded}
        aria-label={expanded ? "Gruppe einklappen" : "Gruppe ausklappen"}
        className="fk-task-group__toggle"
        onClick={() => onExpandedChange?.(!expanded)}
        type="button"
      >
        <FokunaIcon name={expanded ? "chevron-down" : "chevron-right"} size={16} stroke={1.5} />
      </button>
      <strong>{title}</strong>
      {count !== undefined ? <span className="fk-task-group__count">{count}</span> : null}
      <span className="fk-task-group__header-spacer" />
      {actions}
    </div>
  );
}

export interface TaskGroupProps extends HTMLAttributes<HTMLElement> {
  title: string;
  count?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  draggable?: boolean;
  addLabel?: string;
  milestone?: boolean;
  actions?: ReactNode;
  onExpandedChange?: (expanded: boolean) => void;
}

export function TaskGroup({
  title,
  count,
  expanded: expandedProp,
  defaultExpanded = true,
  draggable,
  addLabel = "Aufgabe hinzufügen",
  milestone,
  actions,
  onExpandedChange,
  className,
  children,
  ...props
}: TaskGroupProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;

  function setExpanded(nextExpanded: boolean) {
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  }

  return (
    <section
      {...props}
      className={cn("fk-task-group", className)}
      data-expanded={expanded}
      data-milestone={milestone || undefined}
    >
      <TaskGroupHeader
        actions={actions}
        count={count}
        draggable={draggable}
        expanded={expanded}
        milestone={milestone}
        onExpandedChange={setExpanded}
        title={title}
      />
      {expanded ? (
        <div className="fk-task-group__items">
          {children}
          <button className="fk-task-group__add" type="button">
            <FokunaIcon name="add-small" size={24} />
            {addLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export interface MilestoneStage {
  id: string;
  title: string;
  count?: string;
  goal?: string;
  due?: string;
  tags?: string[];
  favorite?: boolean;
  meta?: ReactNode;
  status?: "upcoming" | "current" | "completed";
  defaultExpanded?: boolean;
  children?: ReactNode;
}

export interface MilestoneTaskGroupProps extends HTMLAttributes<HTMLElement> {
  stages: MilestoneStage[];
  addLabel?: string;
  onStageExpandedChange?: (stageId: string, expanded: boolean) => void;
}

export function MilestoneTaskGroup({
  stages,
  addLabel = "Meilenstein hinzufügen",
  onStageExpandedChange,
  className,
  ...props
}: MilestoneTaskGroupProps) {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(stages.map((stage) => [stage.id, stage.defaultExpanded ?? true])),
  );

  function setStageExpanded(stageId: string, expanded: boolean) {
    setExpandedStages((current) => ({ ...current, [stageId]: expanded }));
    onStageExpandedChange?.(stageId, expanded);
  }

  return (
    <section {...props} className={cn("fk-milestone-group", className)}>
      {stages.map((stage) => {
        const isExpanded = expandedStages[stage.id] ?? true;

        return (
          <div
            className="fk-milestone-group__stage"
            data-expanded={isExpanded}
            data-status={stage.status ?? "upcoming"}
            key={stage.id}
          >
            <TaskListItem
              completed={stage.status === "completed"}
              due={stage.due}
              expandable
              expanded={isExpanded}
              favorite={stage.favorite}
              goal={stage.goal}
              milestone
              onExpandedChange={(nextExpanded) => setStageExpanded(stage.id, nextExpanded)}
              subtasks={stage.count}
              tags={stage.tags}
              title={stage.title}
            />
            {isExpanded && stage.meta ? (
              <div className="fk-milestone-group__meta">{stage.meta}</div>
            ) : null}
            {isExpanded && stage.children ? (
              <div className="fk-milestone-group__items">{stage.children}</div>
            ) : null}
          </div>
        );
      })}
      <button className="fk-milestone-group__add" type="button">
        <FokunaIcon name="add-small" size={24} />
        {addLabel}
      </button>
    </section>
  );
}

export interface AddTaskProps extends HTMLAttributes<HTMLDivElement> {
  expanded?: boolean;
  defaultExpanded?: boolean;
  actions?: ReactNode;
  focusOnExpand?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function AddTask({
  expanded: expandedProp,
  defaultExpanded = false,
  actions,
  focusOnExpand = true,
  onExpandedChange,
  className,
  ...props
}: AddTaskProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [description, setDescription] = useState("");
  const expanded = expandedProp ?? internalExpanded;

  function setExpanded(nextExpanded: boolean) {
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  }

  if (!expanded) {
    return (
      <button
        className={cn("fk-add-task__trigger", className)}
        onClick={() => setExpanded(true)}
        type="button"
      >
        <FokunaIcon name="add-small" size={24} />
        <span>Aufgabe hinzufügen</span>
      </button>
    );
  }

  return (
    <div {...props} className={cn("fk-add-task", className)}>
      <div className="fk-add-task__fields">
        <input aria-label="Aufgabenname" autoFocus={focusOnExpand} placeholder="Aufgabenname" />
        <div className="fk-add-task__description-row" data-empty={!description || undefined}>
          {!description ? <FokunaIcon name="hamburger-menu" size={16} stroke={1.5} /> : null}
          <textarea
            aria-label="Beschreibung"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Beschreibung"
            rows={2}
            value={description}
          />
        </div>
      </div>
      <div className="fk-add-task__footer">
        <div className="fk-add-task__meta-actions">
          <button type="button">
            <FokunaIcon name="flag" />
            Priorität
          </button>
          <button type="button">
            <FokunaIcon name="calendar" />
            Datum
          </button>
        </div>
        <div className="fk-add-task__submit-actions">
          <Button buttonType="link" intent="tertiary" onClick={() => setExpanded(false)} size="sm">
            Abbrechen
          </Button>
          {actions ?? (
            <Button intent="secondary" onClick={() => setExpanded(false)} size="sm">
              Aufgabe hinzufügen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface TaskModalHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  completed?: boolean;
  favorite?: boolean;
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  actions?: ReactNode;
}

export function TaskModalHeader({
  title,
  description,
  completed,
  favorite,
  editing,
  defaultEditing = false,
  onEditingChange,
  actions,
  className,
  ...props
}: TaskModalHeaderProps) {
  const [internalEditing, setInternalEditing] = useState(defaultEditing);
  const [internalFavorite, setInternalFavorite] = useState(Boolean(favorite));
  const [internalDescription, setInternalDescription] = useState(description ?? "");
  const isEditing = editing ?? internalEditing;
  const hasDescription = internalDescription.trim().length > 0;

  function setEditing(nextEditing: boolean) {
    if (editing === undefined) setInternalEditing(nextEditing);
    onEditingChange?.(nextEditing);
  }

  return (
    <header
      {...props}
      className={cn("fk-task-modal-header", className)}
      data-editing={isEditing || undefined}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          event.defaultPrevented ||
          (event.target as HTMLElement).closest("button, input, textarea")
        )
          return;
        setEditing(true);
      }}
    >
      <Checkbox checked={completed} controlSize="md" />
      <div className="fk-task-modal-header__content">
        <div className="fk-task-modal-header__title-row">
          {isEditing ? <input aria-label="Aufgabenname" defaultValue={title} /> : <h2>{title}</h2>}
          <button
            aria-label={internalFavorite ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
            className="fk-task-modal-header__favorite"
            data-favorite={internalFavorite || undefined}
            onClick={() => setInternalFavorite((current) => !current)}
            type="button"
          >
            <FokunaIcon fill={internalFavorite ? "on" : "off"} name="star" />
          </button>
        </div>
        <div
          className="fk-task-modal-header__description-row"
          data-empty={!hasDescription || undefined}
        >
          {!hasDescription ? <FokunaIcon name="hamburger-menu" size={16} stroke={1.5} /> : null}
          {isEditing ? (
            <textarea
              aria-label="Beschreibung"
              className="fk-task-modal-header__description-input"
              onChange={(event) => setInternalDescription(event.target.value)}
              placeholder="Beschreibung"
              rows={3}
              value={internalDescription}
            />
          ) : (
            <p>{hasDescription ? internalDescription : "Beschreibung"}</p>
          )}
        </div>
        {isEditing ? (
          <div className="fk-task-modal-header__actions">
            {actions ?? (
              <>
                <Button
                  buttonType="link"
                  intent="tertiary"
                  onClick={() => setEditing(false)}
                  size="sm"
                >
                  Abbrechen
                </Button>
                <Button intent="secondary" onClick={() => setEditing(false)} size="sm">
                  Speichern
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export interface TaskModalMenuItem {
  label: string;
  value?: ReactNode;
  content?: ReactNode;
  defaultOpen?: boolean;
}

export interface TaskModalMenuProps extends HTMLAttributes<HTMLElement> {
  items: TaskModalMenuItem[];
}

export function TaskModalMenu({ items, className, ...props }: TaskModalMenuProps) {
  return (
    <aside {...props} className={cn("fk-task-modal-menu", className)} aria-label="Aufgabendetails">
      {items.map((item) => (
        <details key={item.label} open={item.defaultOpen}>
          <summary>
            <span>{item.label}</span>
            {item.value ? <small>{item.value}</small> : null}
            <FokunaIcon name="add-small" />
          </summary>
          {item.content ? <div className="fk-task-modal-menu__content">{item.content}</div> : null}
        </details>
      ))}
    </aside>
  );
}

export interface TaskModalSlotProps extends HTMLAttributes<HTMLElement> {
  header: ReactNode;
  menu: ReactNode;
  breadcrumb?: ReactNode;
  deleteAction?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
}

export function TaskModalSlot({
  header,
  menu,
  breadcrumb,
  deleteAction,
  footer,
  closeLabel = "Schließen",
  onClose,
  className,
  children,
  ...props
}: TaskModalSlotProps) {
  return (
    <section
      {...props}
      className={cn("fk-task-modal-slot", className)}
      data-breadcrumb={breadcrumb ? "true" : "false"}
    >
      <button
        aria-label={closeLabel}
        className="fk-task-modal-slot__close"
        onClick={onClose}
        type="button"
      >
        <FokunaIcon name="close" />
      </button>
      <div className="fk-task-modal-slot__main">
        {breadcrumb ? <div className="fk-task-modal-slot__breadcrumb">{breadcrumb}</div> : null}
        {header}
        <div className="fk-task-modal-slot__body">{children}</div>
        {deleteAction ? <div className="fk-task-modal-slot__delete">{deleteAction}</div> : null}
        {footer ? <footer>{footer}</footer> : null}
      </div>
      {menu}
    </section>
  );
}
