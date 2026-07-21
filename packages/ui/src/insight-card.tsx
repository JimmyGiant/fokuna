"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import { Popover } from "radix-ui";
import { useId, useState, type CSSProperties, type ReactNode } from "react";

import { Button } from "./button";
import { Card, type CardProps } from "./card-modal";
import { InsightPlaceMap } from "./insight-place-map";
import { SubtaskIcon } from "./subtask-icon";
import { cn } from "./utils";

export type InsightCardSize = "sm" | "md" | "lg";
export type InsightCardTone = "default" | "brand" | "media";
export type InsightConsistencyLevel = "empty" | "partial" | "full" | "strong";
export type InsightPriorityTone = "low" | "medium" | "high" | "urgent";

export interface InsightCardProps extends Omit<CardProps, "children"> {
  size?: InsightCardSize;
  tone?: InsightCardTone;
  title?: string;
  subtitle?: ReactNode;
  icon?: IconName | ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  bodyClassName?: string;
}

export interface InsightDeadlineProps {
  day: string;
  month: string;
  year: string;
}

export interface InsightMetricProps {
  value: string | number;
}

export interface InsightActivityWeek {
  label: string;
  value: number;
}

export interface InsightActivityChartProps {
  weeks: InsightActivityWeek[];
  threshold?: number | null;
  maxValue?: number;
  className?: string;
}

export interface InsightActivityCardProps extends Omit<InsightCardProps, "action" | "children"> {
  weeks: InsightActivityWeek[];
  threshold?: number | null;
  defaultThreshold?: number;
  onThresholdChange?: (value: number) => void;
  thresholdMin?: number;
  thresholdMax?: number;
  showThresholdControl?: boolean;
}

export interface InsightMilestoneItem {
  id: string;
  title: string;
  completed?: boolean;
  dueDate?: string;
  subtasks?: { completed: number; total: number };
}

export interface InsightMilestonesProps {
  items: InsightMilestoneItem[];
  className?: string;
}

export interface InsightProgressRingProps {
  value: number;
  className?: string;
}

export interface InsightSegmentGaugeProps {
  value: number;
  segments?: number;
  className?: string;
}

export interface InsightBarItem {
  id: string;
  label: string;
  valueLabel: string;
  progress: number;
}

export interface InsightBarListProps {
  items: InsightBarItem[];
  className?: string;
}

export interface InsightConsistencyRow {
  id: string;
  label: string;
  days: InsightConsistencyLevel[];
}

export interface InsightConsistencyProps {
  rows: InsightConsistencyRow[];
  className?: string;
}

export interface InsightPriorityItem {
  id: string;
  label: string;
  count: number;
  tone: InsightPriorityTone;
}

export interface InsightPrioritiesProps {
  items: InsightPriorityItem[];
  className?: string;
}

export interface InsightPlaceProps extends Omit<InsightCardProps, "tone" | "children"> {
  latitude: number;
  longitude: number;
  zoom?: number;
  /** When false (default), pan/zoom are disabled — decorative media only. */
  interactive?: boolean;
  mapLabel?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function renderIcon(icon: IconName | ReactNode | undefined) {
  if (!icon) return null;
  if (typeof icon === "string") {
    return <FokunaIcon name={icon as IconName} size={16} stroke={1.5} />;
  }
  return icon;
}

function activityTone(value: number): "empty" | "25" | "50" | "75" | "100" {
  if (value <= 0) return "empty";
  if (value === 1) return "25";
  if (value === 2) return "50";
  if (value === 3) return "75";
  return "100";
}

const PRIORITY_ORDER: InsightPriorityTone[] = ["low", "medium", "high", "urgent"];

export function InsightCard({
  size = "sm",
  tone = "default",
  title,
  subtitle,
  icon,
  action,
  children,
  bodyClassName,
  elevated = "subtle",
  className,
  ...props
}: InsightCardProps) {
  const hasHeader = Boolean(title || subtitle || icon || action);

  return (
    <Card
      {...props}
      className={cn("fk-insight-card", className)}
      data-size={size}
      data-tone={tone}
      elevated={elevated}
    >
      {hasHeader ? (
        <header className="fk-insight-card__header">
          <div className="fk-insight-card__heading">
            {(icon || title) && (
              <div className="fk-insight-card__title-row">
                {renderIcon(icon)}
                {title ? <h3 className="fk-insight-card__title">{title}</h3> : null}
              </div>
            )}
            {subtitle != null && subtitle !== "" ? (
              <p className="fk-insight-card__subtitle">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="fk-insight-card__action">{action}</div> : null}
        </header>
      ) : null}
      {children ? (
        <div className={cn("fk-insight-card__body", bodyClassName)}>{children}</div>
      ) : null}
    </Card>
  );
}

export function InsightDeadlineContent({ day, month, year }: InsightDeadlineProps) {
  return (
    <div className="fk-insight-deadline">
      <p className="fk-insight-deadline__date">
        <span>{day}</span>
        <span>{month}</span>
      </p>
      <p className="fk-insight-deadline__year">{year}</p>
    </div>
  );
}

export function InsightMetricContent({ value }: InsightMetricProps) {
  return <p className="fk-insight-metric">{value}</p>;
}

export function InsightQuoteCard({
  quote,
  size = "sm",
  elevated = "micro",
  className,
  ...props
}: Omit<InsightCardProps, "tone" | "children" | "title" | "subtitle" | "icon" | "action"> & {
  quote: string;
}) {
  return (
    <InsightCard
      {...props}
      className={cn("fk-insight-quote", className)}
      elevated={elevated}
      size={size}
      tone="brand"
    >
      <p className="fk-insight-quote__text">{quote}</p>
    </InsightCard>
  );
}

export function InsightPlaceCard({
  latitude,
  longitude,
  zoom = 13,
  interactive = false,
  mapLabel,
  title = "Ort",
  icon = "map-pin",
  size = "sm",
  elevated = "micro",
  className,
  ...props
}: InsightPlaceProps) {
  return (
    <InsightCard
      {...props}
      className={cn("fk-insight-place", className)}
      elevated={elevated}
      icon={icon}
      size={size}
      title={title}
      tone="media"
    >
      <InsightPlaceMap
        interactive={interactive}
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        {...(mapLabel ? { "aria-label": mapLabel } : {})}
      />
    </InsightCard>
  );
}

export function InsightActivityChart({
  weeks,
  threshold = null,
  maxValue,
  className,
}: InsightActivityChartProps) {
  const dataMax = Math.max(0, ...weeks.map((week) => week.value));
  const resolvedMax = Math.max(maxValue ?? 0, threshold ?? 0, dataMax, 1);
  const segmentGap = 1;
  /** Fixed plot band so the threshold can never climb into the header/subtitle. */
  const plotHeight = 100;
  const labelBand = 24;
  const segmentHeight = Math.max(
    4,
    Math.floor((plotHeight - Math.max(0, resolvedMax - 1) * segmentGap) / resolvedMax),
  );
  const thresholdOffset =
    threshold != null && threshold > 0
      ? Math.min(plotHeight, threshold * segmentHeight + Math.max(0, threshold - 1) * segmentGap)
      : null;

  return (
    <div
      className={cn("fk-insight-activity", className)}
      style={
        {
          "--fk-insight-segment-height": `${segmentHeight}px`,
          "--fk-insight-plot-height": `${plotHeight}px`,
          "--fk-insight-label-band": `${labelBand}px`,
          ...(thresholdOffset != null
            ? { "--fk-insight-threshold-offset": `${thresholdOffset}px` }
            : {}),
        } as CSSProperties
      }
    >
      <div className="fk-insight-activity__chart">
        {weeks.map((week, weekIndex) => {
          const tone = activityTone(week.value);
          const segments = Math.max(0, week.value);

          return (
            <div
              className="fk-insight-activity__week"
              key={`${week.label}-${weekIndex}`}
              style={{ "--fk-insight-week-index": weekIndex } as CSSProperties}
            >
              <div
                aria-hidden="true"
                className="fk-insight-activity__stack"
                data-tone={tone}
                data-value={week.value}
              >
                {segments > 0 ? (
                  Array.from({ length: segments }, (_, segmentIndex) => (
                    <span
                      className="fk-insight-activity__segment"
                      key={segmentIndex}
                      style={
                        {
                          "--fk-insight-segment-index": segmentIndex,
                        } as CSSProperties
                      }
                    />
                  ))
                ) : (
                  <span className="fk-insight-activity__empty" />
                )}
              </div>
              <span className="fk-insight-activity__label">{week.label}</span>
            </div>
          );
        })}
        {thresholdOffset != null ? (
          <div aria-hidden="true" className="fk-insight-activity__threshold">
            <span className="fk-insight-activity__threshold-dot" />
            <span className="fk-insight-activity__threshold-line" />
          </div>
        ) : null}
      </div>
      <span className="fk-sr-only">
        Wochenwerte
        {threshold != null ? `, Schwellenwert ${threshold}` : ""}. Maximum {resolvedMax}.
      </span>
    </div>
  );
}

function ThresholdPicker({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const listId = useId();
  const options = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  return (
    <div className="fk-insight-threshold">
      <p className="fk-insight-threshold__label" id={listId}>
        {label}
      </p>
      <div aria-labelledby={listId} className="fk-insight-threshold__list" role="listbox">
        {options.map((option) => (
          <button
            aria-selected={option === value}
            className="fk-insight-threshold__option"
            data-selected={option === value || undefined}
            key={option}
            onClick={() => onChange(option)}
            role="option"
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InsightActivityCard({
  weeks,
  threshold,
  defaultThreshold = 4,
  onThresholdChange,
  thresholdMin = 1,
  thresholdMax = 8,
  showThresholdControl = true,
  title = "Aktivität",
  subtitle = "Aufgaben pro Woche",
  icon,
  size = "md",
  ...props
}: InsightActivityCardProps) {
  const isControlled = threshold !== undefined;
  const [internalThreshold, setInternalThreshold] = useState(defaultThreshold);
  const [open, setOpen] = useState(false);
  const resolvedThreshold = showThresholdControl
    ? isControlled
      ? threshold
      : internalThreshold
    : null;
  const resolvedIcon = icon === undefined ? (showThresholdControl ? "rocket" : undefined) : icon;

  const setThreshold = (next: number) => {
    const clamped = clamp(next, thresholdMin, thresholdMax);
    if (!isControlled) setInternalThreshold(clamped);
    onThresholdChange?.(clamped);
    setOpen(false);
  };

  const action =
    showThresholdControl && resolvedThreshold != null ? (
      <Popover.Root onOpenChange={setOpen} open={open}>
        <Popover.Trigger asChild>
          <Button
            aria-label="Schwellenwert festlegen"
            buttonType="outline"
            iconOnly
            intent="tertiary"
            leadingIcon="focus-target"
            size="sm"
          >
            Schwellenwert
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="end" className="fk-insight-threshold-popover" sideOffset={8}>
            <ThresholdPicker
              label="Ziel pro Woche"
              max={thresholdMax}
              min={thresholdMin}
              onChange={setThreshold}
              value={resolvedThreshold}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    ) : undefined;

  return (
    <InsightCard
      {...props}
      action={action}
      icon={resolvedIcon}
      size={size}
      subtitle={subtitle}
      title={title}
    >
      <InsightActivityChart threshold={resolvedThreshold} weeks={weeks} />
    </InsightCard>
  );
}

export function InsightMilestonesContent({ items, className }: InsightMilestonesProps) {
  return (
    <ol className={cn("fk-insight-milestones", className)}>
      {items.map((item) => {
        const hasMeta = Boolean(item.subtasks || item.dueDate);
        return (
          <li data-completed={item.completed || undefined} key={item.id}>
            <span aria-hidden="true" className="fk-insight-milestones__marker">
              {item.completed ? (
                <FokunaIcon
                  className="fk-insight-milestones__check"
                  name="check-small"
                  size={16}
                  stroke={2}
                />
              ) : null}
            </span>
            <div className="fk-insight-milestones__body">
              <strong>{item.title}</strong>
              {hasMeta ? (
                <span className="fk-insight-milestones__meta">
                  {item.subtasks ? (
                    <span>
                      <SubtaskIcon />
                      {item.subtasks.completed}/{item.subtasks.total}
                    </span>
                  ) : null}
                  {item.dueDate ? (
                    <span>
                      <FokunaIcon name="calendar" size={16} stroke={1.5} />
                      {item.dueDate}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function InsightProgressRing({ value, className }: InsightProgressRingProps) {
  const progress = clamp(value, 0, 100);
  return (
    <div
      aria-label={`${progress} Prozent`}
      className={cn("fk-insight-ring", className)}
      role="img"
      style={{ "--fk-insight-ring-offset": 100 - progress } as CSSProperties}
    >
      <span aria-hidden="true" className="fk-insight-ring__halo" />
      <span aria-hidden="true" className="fk-insight-ring__band" />
      <svg aria-hidden="true" className="fk-insight-ring__svg" viewBox="0 0 88 88">
        <circle className="fk-insight-ring__track" cx="44" cy="44" r="40" />
        <circle className="fk-insight-ring__value" cx="44" cy="44" pathLength="100" r="40" />
      </svg>
      <span className="fk-insight-ring__label">{progress}%</span>
    </div>
  );
}

export function InsightSegmentGauge({ value, segments = 40, className }: InsightSegmentGaugeProps) {
  const progress = clamp(value, 0, 100);
  const filled = Math.round((progress / 100) * segments);

  return (
    <div
      aria-label={`${progress} Prozent`}
      className={cn("fk-insight-segments", className)}
      role="img"
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          className="fk-insight-segments__bar"
          data-filled={index < filled || undefined}
          key={index}
          style={{ "--fk-insight-segment-index": index } as CSSProperties}
        />
      ))}
    </div>
  );
}

export function InsightBarList({ items, className }: InsightBarListProps) {
  return (
    <ul className={cn("fk-insight-bars", className)}>
      {items.map((item, index) => (
        <li key={item.id} style={{ "--fk-insight-bar-index": index } as CSSProperties}>
          <div className="fk-insight-bars__meta">
            <strong>{item.label}</strong>
            <span>{item.valueLabel}</span>
          </div>
          <div className="fk-insight-bars__track">
            <span
              className="fk-insight-bars__fill"
              style={{ width: `${clamp(item.progress, 0, 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function InsightConsistencyGrid({ rows, className }: InsightConsistencyProps) {
  return (
    <div className={cn("fk-insight-consistency", className)}>
      {rows.map((row, rowIndex) => (
        <div
          className="fk-insight-consistency__row"
          key={row.id}
          style={{ "--fk-insight-row-index": rowIndex } as CSSProperties}
        >
          <span className="fk-insight-consistency__label">{row.label}</span>
          <div className="fk-insight-consistency__days" role="img" aria-label={row.label}>
            {row.days.map((level, dayIndex) => (
              <span
                className="fk-insight-consistency__day"
                data-level={level}
                key={`${row.id}-${dayIndex}`}
                style={{ "--fk-insight-day-index": dayIndex } as CSSProperties}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function InsightPrioritiesContent({ items, className }: InsightPrioritiesProps) {
  const ordered = PRIORITY_ORDER.map((tone) => items.find((item) => item.tone === tone)).filter(
    (item): item is InsightPriorityItem => Boolean(item),
  );
  const total = ordered.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className={cn("fk-insight-priorities", className)}>
      <ul className="fk-insight-priorities__list">
        {ordered.map((item) => (
          <li key={item.id}>
            <span className="fk-insight-priorities__label">
              <span
                aria-hidden="true"
                className="fk-insight-priorities__dot"
                data-tone={item.tone}
              />
              {item.label}
            </span>
            <strong>{item.count}</strong>
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="fk-insight-priorities__bar">
        {ordered.map((item) => (
          <span
            className="fk-insight-priorities__slice"
            data-tone={item.tone}
            key={item.id}
            style={{ flexGrow: item.count / total, flexBasis: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
