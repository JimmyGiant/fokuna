"use client";

import { FokunaIcon } from "@fokuna/icons";
import { Dialog, Popover } from "radix-ui";
import { Children, useState, type HTMLAttributes, type ReactNode } from "react";

import { Button } from "./button";
import { Checkbox } from "./selection-control";
import { SubtaskIcon } from "./subtask-icon";
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
        <button
          aria-label="Aufgabe verschieben"
          className="fk-task-item__drag"
          onClick={(event) => event.stopPropagation()}
          type="button"
        >
          <FokunaIcon name="drag-handle-grid" size={16} stroke={1.5} />
        </button>
        {isExpandable ? (
          <button
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Aufgabendetails ausblenden" : "Aufgabendetails einblenden"}
            className="fk-task-item__expand"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(!isExpanded);
            }}
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
        <span
          data-no-drag
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
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
          onClick={(event) => {
            event.stopPropagation();
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

  // Empty arrays are truthy — only wrap when there are real child nodes.
  if (Children.count(children) === 0) return item;

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
      <span className="fk-task-group__title">{title}</span>
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
  addNamePlaceholder?: string;
  milestone?: boolean;
  actions?: ReactNode;
  onExpandedChange?: (expanded: boolean) => void;
  onAddSubmit?: (payload: AddTaskSubmitPayload) => void | Promise<void>;
}

export function TaskGroup({
  title,
  count,
  expanded: expandedProp,
  defaultExpanded = true,
  draggable,
  addLabel = "Aufgabe hinzufügen",
  addNamePlaceholder = "Aufgabenname",
  milestone,
  actions,
  onExpandedChange,
  onAddSubmit,
  className,
  children,
  ...props
}: TaskGroupProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [adding, setAdding] = useState(false);
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
        <div className="fk-task-group__items fk-task-list" data-adding={adding || undefined}>
          {children}
          {adding ? (
            <AddTask
              expanded
              namePlaceholder={addNamePlaceholder}
              onExpandedChange={setAdding}
              onSubmit={onAddSubmit}
              submitLabel={addLabel}
            />
          ) : (
            <button className="fk-task-group__add" onClick={() => setAdding(true)} type="button">
              <FokunaIcon name="add-small" size={24} />
              {addLabel}
            </button>
          )}
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
  const [addingMilestone, setAddingMilestone] = useState(false);

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
      {addingMilestone ? (
        <AddTask
          className="fk-milestone-group__add-form"
          expanded
          namePlaceholder="Meilensteinname"
          onExpandedChange={setAddingMilestone}
          submitLabel={addLabel}
        />
      ) : (
        <button
          className="fk-milestone-group__add"
          onClick={() => setAddingMilestone(true)}
          type="button"
        >
          <FokunaIcon name="add-small" size={24} />
          {addLabel}
        </button>
      )}
    </section>
  );
}

export interface AddTaskSubmitPayload {
  title: string;
  description: string;
}

export interface AddTaskProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  expanded?: boolean;
  defaultExpanded?: boolean;
  actions?: ReactNode;
  focusOnExpand?: boolean;
  namePlaceholder?: string;
  submitLabel?: string;
  triggerLabel?: string;
  onExpandedChange?: (expanded: boolean) => void;
  onSubmit?: (payload: AddTaskSubmitPayload) => void | Promise<void>;
}

export function AddTask({
  expanded: expandedProp,
  defaultExpanded = false,
  actions,
  focusOnExpand = true,
  namePlaceholder = "Aufgabenname",
  submitLabel,
  triggerLabel = "Aufgabe hinzufügen",
  onExpandedChange,
  onSubmit,
  className,
  ...props
}: AddTaskProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const expanded = expandedProp ?? internalExpanded;

  function setExpanded(nextExpanded: boolean) {
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
    if (!nextExpanded) {
      setTitle("");
      setDescription("");
    }
  }

  async function handleSubmit() {
    const nextTitle = title.trim();
    if (!nextTitle || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.({ title: nextTitle, description: description.trim() });
      setExpanded(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!expanded) {
    return (
      <button
        className={cn("fk-add-task__trigger", className)}
        onClick={() => setExpanded(true)}
        type="button"
      >
        <FokunaIcon name="add-small" size={24} />
        <span>{triggerLabel}</span>
      </button>
    );
  }

  return (
    <div {...props} className={cn("fk-add-task", className)}>
      <div className="fk-add-task__fields">
        <input
          aria-label={namePlaceholder}
          autoFocus={focusOnExpand}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder={namePlaceholder}
          value={title}
        />
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
            <Button
              disabled={!title.trim() || submitting}
              intent="secondary"
              onClick={() => void handleSubmit()}
              size="sm"
            >
              {submitLabel ?? triggerLabel}
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
  onCompletedChange?: (completed: boolean) => void;
  onFavoriteChange?: (favorite: boolean) => void;
  onSave?: (payload: { title: string; description: string }) => void | Promise<void>;
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
  onCompletedChange,
  onFavoriteChange,
  onSave,
  actions,
  className,
  ...props
}: TaskModalHeaderProps) {
  const [internalEditing, setInternalEditing] = useState(defaultEditing);
  const [internalFavorite, setInternalFavorite] = useState(Boolean(favorite));
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(description ?? "");
  const [saving, setSaving] = useState(false);
  const isEditing = editing ?? internalEditing;
  const isFavorite = onFavoriteChange ? Boolean(favorite) : internalFavorite;
  const shownDescription = isEditing ? draftDescription : (description ?? "");
  const hasDescription = shownDescription.trim().length > 0;

  function setEditing(nextEditing: boolean) {
    if (editing === undefined) setInternalEditing(nextEditing);
    onEditingChange?.(nextEditing);
    if (nextEditing) {
      setDraftTitle(title);
      setDraftDescription(description ?? "");
    }
  }

  async function handleSave() {
    const nextTitle = draftTitle.trim();
    if (!nextTitle || saving) {
      return;
    }
    setSaving(true);
    try {
      await onSave?.({ title: nextTitle, description: draftDescription.trim() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
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
      <span data-no-drag>
        <Checkbox
          checked={completed}
          controlSize="md"
          onCheckedChange={(next) => onCompletedChange?.(next === true)}
        />
      </span>
      <div className="fk-task-modal-header__content">
        <div className="fk-task-modal-header__title-row">
          {isEditing ? (
            <input
              aria-label="Aufgabenname"
              onChange={(event) => setDraftTitle(event.target.value)}
              value={draftTitle}
            />
          ) : (
            <h2>{title}</h2>
          )}
          <button
            aria-label={isFavorite ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
            className="fk-task-modal-header__favorite"
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
        <div
          className="fk-task-modal-header__description-row"
          data-empty={!hasDescription || undefined}
        >
          {!hasDescription ? <FokunaIcon name="hamburger-menu" size={16} stroke={1.5} /> : null}
          {isEditing ? (
            <textarea
              aria-label="Beschreibung"
              className="fk-task-modal-header__description-input"
              onChange={(event) => setDraftDescription(event.target.value)}
              placeholder="Beschreibung"
              rows={3}
              value={draftDescription}
            />
          ) : (
            <p>{hasDescription ? shownDescription : "Beschreibung"}</p>
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
                <Button
                  disabled={!draftTitle.trim() || saving}
                  intent="secondary"
                  onClick={() => void handleSave()}
                  size="sm"
                >
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface TaskModalMenuProps extends HTMLAttributes<HTMLElement> {
  items: TaskModalMenuItem[];
  footer?: ReactNode;
}

export function TaskModalMenu({ items, footer, className, ...props }: TaskModalMenuProps) {
  return (
    <aside {...props} className={cn("fk-task-modal-menu", className)} aria-label="Aufgabendetails">
      {items.map((item) => {
        const trigger = (
          <button
            aria-label={`${item.label} bearbeiten`}
            className="fk-task-modal-menu__trigger"
            disabled={!item.content}
            type="button"
          >
            <span className="fk-task-modal-menu__copy">
              <span>{item.label}</span>
            </span>
            <FokunaIcon name="add-small" />
          </button>
        );

        const preview = item.value ? (
          <div className="fk-task-modal-menu__preview">{item.value}</div>
        ) : null;

        if (!item.content) {
          return (
            <div className="fk-task-modal-menu__item" key={item.label}>
              {trigger}
              {preview}
            </div>
          );
        }

        return (
          <div className="fk-task-modal-menu__item" key={item.label}>
            <Popover.Root
              defaultOpen={item.defaultOpen}
              onOpenChange={item.onOpenChange}
              open={item.open}
            >
              <Popover.Trigger asChild>{trigger}</Popover.Trigger>
              {preview}
              <Popover.Portal>
                <Popover.Content
                  align="start"
                  avoidCollisions={false}
                  className="fk-task-property-popover"
                  collisionPadding={16}
                  side="bottom"
                  sideOffset={8}
                >
                  <div className="fk-task-property-popover__header">
                    <strong>{item.label}</strong>
                    <Popover.Close aria-label={`${item.label} schließen`}>
                      <FokunaIcon name="close" />
                    </Popover.Close>
                  </div>
                  <div className="fk-task-property-popover__content">{item.content}</div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        );
      })}
      {footer ? <div className="fk-task-modal-menu__footer">{footer}</div> : null}
    </aside>
  );
}

export interface TaskModalSlotProps extends HTMLAttributes<HTMLElement> {
  header: ReactNode;
  menu: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  deleteAction?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
}

export function TaskModalSlot({
  header,
  menu,
  breadcrumb,
  actions,
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
      {actions ? <div className="fk-task-modal-slot__actions">{actions}</div> : null}
      <button
        aria-label={closeLabel}
        className="fk-task-modal-slot__close"
        onClick={onClose}
        type="button"
      >
        <FokunaIcon name="close" />
      </button>
      <div className="fk-task-modal-slot__main">
        <div className="fk-task-modal-slot__scroll-region">
          {breadcrumb ? <div className="fk-task-modal-slot__breadcrumb">{breadcrumb}</div> : null}
          {header}
          <div className="fk-task-modal-slot__body">{children}</div>
          {deleteAction ? <div className="fk-task-modal-slot__delete">{deleteAction}</div> : null}
          {footer ? <footer>{footer}</footer> : null}
        </div>
      </div>
      {menu}
    </section>
  );
}

export interface TaskModalDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function TaskModalDialog({ open, onOpenChange, title, children }: TaskModalDialogProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fk-task-modal-dialog__overlay" />
        <Dialog.Content aria-describedby={undefined} className="fk-task-modal-dialog__content">
          <Dialog.Title className="fk-sr-only">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
