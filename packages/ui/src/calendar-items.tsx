import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { HTMLAttributes, ReactNode } from "react";

import { Checkbox } from "./selection-control";
import { cn } from "./utils";

export type CalendarItemState = "default" | "selected" | "dragged" | "drag-placeholder";
export type CalendarItemKind = "task" | "event" | "block";

export interface CalendarItemProps extends HTMLAttributes<HTMLDivElement> {
  kind: CalendarItemKind;
  state?: CalendarItemState;
  title: string;
  meta?: string;
  time?: string;
  icon?: IconName;
  tone?: "neutral" | "coral" | "teal" | "blue" | "purple" | "pink" | "gold";
  priority?: "low" | "medium" | "high" | "urgent";
  readOnly?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  trailing?: ReactNode;
}

const kindIcons: Record<CalendarItemKind, IconName> = {
  task: "checklist",
  event: "calendar",
  block: "clock",
};

export function CalendarItem({
  kind,
  state = "default",
  title,
  meta,
  time,
  icon,
  tone = "neutral",
  priority,
  readOnly,
  checked,
  onCheckedChange,
  trailing,
  className,
  ...props
}: CalendarItemProps) {
  if (state === "drag-placeholder") {
    return (
      <div
        {...props}
        aria-label={`Ablageposition für ${title}`}
        aria-selected="false"
        className={cn("fk-calendar-item fk-calendar-item--placeholder", className)}
        data-kind={kind}
        data-state={state}
        role="option"
      />
    );
  }

  const secondary = [time, meta].filter(Boolean).join(" · ");

  return (
    <div
      {...props}
      aria-grabbed={state === "dragged" || undefined}
      className={cn("fk-calendar-item", className)}
      data-kind={kind}
      data-priority={priority}
      data-state={state}
      data-tone={tone}
      draggable={!readOnly}
    >
      <span aria-hidden="true" className="fk-calendar-item__accent" />
      <span className="fk-calendar-item__content">
        <strong>{title}</strong>
        {secondary ? <small>{secondary}</small> : null}
      </span>
      {kind === "task" ? (
        <span data-no-drag>
          <Checkbox
            checked={checked}
            controlSize="md"
            onCheckedChange={(next) => onCheckedChange?.(next === true)}
          />
        </span>
      ) : kind === "block" ? (
        <span className="fk-calendar-item__trailing-icon">
          <FokunaIcon name={icon ?? kindIcons[kind]} />
        </span>
      ) : null}
      {trailing}
    </div>
  );
}

export interface CalendarDrawerProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  dateLabel?: string;
  viewControl?: ReactNode;
  actions?: ReactNode;
}

export function CalendarDrawer({
  title = "Kalender",
  dateLabel,
  viewControl,
  actions,
  className,
  children,
  ...props
}: CalendarDrawerProps) {
  return (
    <aside {...props} className={cn("fk-calendar-drawer", className)}>
      <header>
        {viewControl ?? (
          <span>
            <h2>{title}</h2>
            {dateLabel ? <p>{dateLabel}</p> : null}
          </span>
        )}
        {actions}
      </header>
      <div className="fk-calendar-drawer__content">
        <div aria-hidden="true" className="fk-calendar-drawer__time-grid">
          {Array.from({ length: 13 }, (_, index) => (
            <span key={index}>
              <small>{String(index + 7).padStart(2, "0")}:00</small>
              <i />
            </span>
          ))}
        </div>
        <div className="fk-calendar-drawer__events">{children}</div>
      </div>
    </aside>
  );
}
