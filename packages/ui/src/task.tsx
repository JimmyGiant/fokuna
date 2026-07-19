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
  onCompletedChange?: (completed: boolean) => void;
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
  onCompletedChange,
  className,
  ...props
}: TaskListItemProps) {
  if (state === "placeholder") {
    return <div {...props} className={cn("fk-task-item fk-task-item--placeholder", className)} />;
  }

  return (
    <div
      {...props}
      aria-grabbed={state === "dragged" || undefined}
      className={cn("fk-task-item", className)}
      data-milestone={milestone || undefined}
      data-state={state}
      draggable
    >
      <div className="fk-task-item__primary-row">
        <button aria-label="Aufgabe verschieben" className="fk-task-item__drag" type="button">
          <FokunaIcon name="drag-handle-grid" />
        </button>
        <span data-no-drag>
          <Checkbox
            checked={completed}
            controlSize="lg"
            onCheckedChange={(next) => onCompletedChange?.(next === true)}
            variant={milestone ? "milestone" : "default"}
          />
        </span>
        <strong>{title}</strong>
        <button
          aria-label="Aufgabendetails einblenden"
          className="fk-task-item__expand"
          type="button"
        >
          <FokunaIcon name="chevron-down-small" />
        </button>
        <button
          aria-label={favorite ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
          className="fk-task-item__favorite"
          data-favorite={favorite || undefined}
          type="button"
        >
          <FokunaIcon fill={favorite ? "on" : "off"} name="star" />
        </button>
      </div>
      <span className="fk-task-item__content">
        {description ? <small>{description}</small> : null}
        <span className="fk-task-item__meta">
          {subtasks ? <Tag icon={<SubtaskIcon />}>{subtasks}</Tag> : null}
          {goal ? (
            <Tag icon="focus-target" tone="teal">
              {goal}
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
      </span>
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
}

export function TaskGroupHeader({
  title,
  count,
  expanded = true,
  draggable,
  actions,
  milestone,
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
      <FokunaIcon name={expanded ? "chevron-down-small" : "chevron-right-small"} />
      <strong>{title}</strong>
      {count !== undefined ? <span>{count}</span> : null}
      <span className="fk-task-group__header-spacer" />
      {actions}
    </div>
  );
}

export interface TaskGroupProps extends HTMLAttributes<HTMLElement> {
  title: string;
  count?: number;
  expanded?: boolean;
  draggable?: boolean;
  addLabel?: string;
  milestone?: boolean;
  actions?: ReactNode;
}

export function TaskGroup({
  title,
  count,
  expanded = true,
  draggable,
  addLabel = "Aufgabe hinzufügen",
  milestone,
  actions,
  className,
  children,
  ...props
}: TaskGroupProps) {
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
        title={title}
      />
      {expanded ? (
        <div className="fk-task-group__items">
          {children}
          <button className="fk-task-group__add" type="button">
            <FokunaIcon name="add-small" />
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
  meta?: ReactNode;
  status?: "upcoming" | "current" | "completed";
  children?: ReactNode;
}

export interface MilestoneTaskGroupProps extends HTMLAttributes<HTMLElement> {
  stages: MilestoneStage[];
  addLabel?: string;
}

export function MilestoneTaskGroup({
  stages,
  addLabel = "Meilenstein hinzufügen",
  className,
  ...props
}: MilestoneTaskGroupProps) {
  return (
    <section {...props} className={cn("fk-milestone-group", className)}>
      {stages.map((stage) => (
        <div
          className="fk-milestone-group__stage"
          data-status={stage.status ?? "upcoming"}
          key={stage.id}
        >
          <span aria-hidden="true" className="fk-milestone-group__node">
            {stage.status === "completed" ? <FokunaIcon name="check-small" /> : null}
          </span>
          <div className="fk-milestone-group__heading">
            <FokunaIcon name="chevron-down-small" />
            <strong>{stage.title}</strong>
            {stage.count ? <span>{stage.count}</span> : null}
          </div>
          {stage.meta ? <div className="fk-milestone-group__meta">{stage.meta}</div> : null}
          {stage.children ? (
            <div className="fk-milestone-group__items">{stage.children}</div>
          ) : null}
        </div>
      ))}
      <button className="fk-milestone-group__add" type="button">
        <FokunaIcon name="add-small" />
        {addLabel}
      </button>
    </section>
  );
}

export interface AddTaskProps extends HTMLAttributes<HTMLDivElement> {
  expanded?: boolean;
  actions?: ReactNode;
  focusOnExpand?: boolean;
  subtask?: boolean;
}

export function AddTask({
  expanded,
  actions,
  focusOnExpand = true,
  subtask = false,
  className,
  ...props
}: AddTaskProps) {
  if (!expanded) {
    return (
      <button
        className={cn("fk-add-task__trigger", className)}
        data-subtask={subtask || undefined}
        type="button"
      >
        <FokunaIcon name="add-small" />
        Aufgabe hinzufügen
      </button>
    );
  }

  return (
    <div {...props} className={cn("fk-add-task", className)} data-subtask={subtask || undefined}>
      <div className="fk-add-task__fields">
        <input aria-label="Aufgabenname" autoFocus={focusOnExpand} placeholder="Aufgabenname" />
        <textarea aria-label="Beschreibung" placeholder="Beschreibung" rows={2} />
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
          <Button buttonType="link" intent="tertiary" size="sm">
            Abbrechen
          </Button>
          {actions ?? (
            <Button intent="secondary" size="sm">
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
  const isEditing = editing ?? internalEditing;

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
        <span>
          {isEditing ? <input aria-label="Aufgabenname" defaultValue={title} /> : <h2>{title}</h2>}
          {isEditing ? (
            <textarea aria-label="Beschreibung" defaultValue={description} rows={2} />
          ) : description ? (
            <p>{description}</p>
          ) : null}
        </span>
        <button aria-label="Favorit" className="fk-task-modal-header__favorite" type="button">
          <FokunaIcon fill={favorite ? "on" : "off"} name="star" />
        </button>
        {actions ? <div className="fk-task-modal-header__actions">{actions}</div> : null}
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
  footer?: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
}

export function TaskModalSlot({
  header,
  menu,
  footer,
  closeLabel = "Schließen",
  onClose,
  className,
  children,
  ...props
}: TaskModalSlotProps) {
  return (
    <section {...props} className={cn("fk-task-modal-slot", className)}>
      <button
        aria-label={closeLabel}
        className="fk-task-modal-slot__close"
        onClick={onClose}
        type="button"
      >
        <FokunaIcon name="close" />
      </button>
      <div className="fk-task-modal-slot__main">
        {header}
        <div className="fk-task-modal-slot__body">{children}</div>
        {footer ? <footer>{footer}</footer> : null}
      </div>
      {menu}
    </section>
  );
}
