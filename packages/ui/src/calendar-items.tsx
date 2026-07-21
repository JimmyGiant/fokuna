import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

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
          <FokunaIcon name={icon ?? kindIcons[kind]} size={16} stroke={1.5} />
        </span>
      ) : null}
      {trailing}
    </div>
  );
}

export interface CalendarDayRange {
  /** First visible hour mark (0–23). */
  startHour: number;
  /**
   * Number of one-hour intervals between the first and last hour mark.
   * Day span is [startHour, startHour + hourCount]. Labels render through startHour + hourCount.
   * Example: startHour=7, hourCount=11 → marks 07:00…18:00.
   */
  hourCount: number;
}

/**
 * Maps a timed entry onto the calendar events rail (first→last hour rule).
 * Top/height are percentages of that span, so 14:00–15:00 sits exactly on the
 * 14:00 and 15:00 rules (line to line).
 */
export function getCalendarEntryPosition(
  startsAt: string | Date,
  endsAt: string | Date,
  range: CalendarDayRange,
): { top: string; height: string } {
  const start = startsAt instanceof Date ? startsAt : new Date(startsAt);
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt);
  const { startHour, hourCount } = range;
  const intervals = Math.max(hourCount, 1);

  const dayStart = new Date(start);
  dayStart.setHours(startHour, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(startHour + intervals, 0, 0, 0);

  const totalMs = dayEnd.getTime() - dayStart.getTime();
  const clampedStart = Math.min(Math.max(start.getTime(), dayStart.getTime()), dayEnd.getTime());
  const clampedEnd = Math.min(Math.max(end.getTime(), clampedStart), dayEnd.getTime());
  const durationMs = Math.max(clampedEnd - clampedStart, 0);

  return {
    top: `${((clampedStart - dayStart.getTime()) / totalMs) * 100}%`,
    height: `${(durationMs / totalMs) * 100}%`,
  };
}

export interface CalendarDrawerProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  dateLabel?: string;
  viewControl?: ReactNode;
  actions?: ReactNode;
  /** First hour mark (0–23). Defaults to 7. */
  startHour?: number;
  /**
   * Last hour mark shown as a label (inclusive, 0–23). Defaults to 18.
   * Event positioning spans [startHour, endHour] (first mark → last mark).
   */
  endHour?: number;
}

export function CalendarDrawer({
  title = "Kalender",
  dateLabel,
  viewControl,
  actions,
  startHour = 7,
  endHour = 18,
  className,
  children,
  style,
  ...props
}: CalendarDrawerProps) {
  const from = Math.min(Math.max(startHour, 0), 23);
  const to = Math.min(Math.max(endHour, from), 23);
  const intervalCount = Math.max(to - from, 1);
  const hours = Array.from({ length: intervalCount + 1 }, (_, index) => from + index);

  return (
    <aside
      {...props}
      className={cn("fk-calendar-drawer", className)}
      style={
        {
          ...style,
          "--fk-calendar-interval-count": intervalCount,
          "--fk-calendar-start-hour": from,
        } as CSSProperties
      }
    >
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
        <div className="fk-calendar-drawer__track">
          <div aria-hidden="true" className="fk-calendar-drawer__time-grid">
            {hours.map((hour, index) => (
              <div
                className="fk-calendar-drawer__hour"
                key={hour}
                style={{ "--fk-calendar-hour-index": index } as CSSProperties}
              >
                <small>{String(hour).padStart(2, "0")}:00</small>
                <i />
              </div>
            ))}
          </div>
          <div className="fk-calendar-drawer__events">{children}</div>
        </div>
      </div>
    </aside>
  );
}
