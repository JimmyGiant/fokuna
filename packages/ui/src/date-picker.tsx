"use client";

import { FokunaIcon } from "@fokuna/icons";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { Popover } from "radix-ui";
import { useId, useMemo, useState } from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export type DatePickerValue = Date | DateRange | undefined;

export interface DatePickerProps {
  mode?: "single" | "range";
  value?: DatePickerValue;
  defaultValue?: DatePickerValue;
  onValueChange?: (value: DatePickerValue) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  controlSize?: ControlSize;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
  inline?: boolean;
  "aria-label"?: string;
}

const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function isRange(value: DatePickerValue): value is DateRange {
  return Boolean(value && !(value instanceof Date));
}

function firstSelectedDate(value: DatePickerValue) {
  if (value instanceof Date) return value;
  return value?.from;
}

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DatePicker({
  mode = "single",
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  controlSize = "md",
  placeholder = "Datum auswählen",
  disabled,
  invalid,
  minDate,
  maxDate,
  isDateDisabled,
  className,
  inline = false,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const labelId = useId();
  const [internalValue, setInternalValue] = useState<DatePickerValue>(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const selectedValue = value ?? internalValue;
  const selectedAnchor = firstSelectedDate(selectedValue);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selectedAnchor ?? new Date()),
  );
  const isOpen = open ?? internalOpen;

  const days = useMemo(() => {
    const firstGridDay = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(firstGridDay, index));
  }, [visibleMonth]);

  function setOpen(nextOpen: boolean) {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function commit(nextValue: DatePickerValue) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function dateIsDisabled(date: Date) {
    const normalized = startOfDay(date);
    return Boolean(
      (minDate && isBefore(normalized, startOfDay(minDate))) ||
      (maxDate && isAfter(normalized, startOfDay(maxDate))) ||
      isDateDisabled?.(date),
    );
  }

  function selectDate(date: Date) {
    if (dateIsDisabled(date)) return;
    setVisibleMonth(startOfMonth(date));

    if (mode === "single") {
      commit(date);
      setOpen(false);
      return;
    }

    const currentRange = isRange(selectedValue) ? selectedValue : undefined;
    if (!currentRange?.from || currentRange.to) {
      commit({ from: date });
      return;
    }

    commit(
      isBefore(date, currentRange.from)
        ? { from: date, to: currentRange.from }
        : { from: currentRange.from, to: date },
    );
  }

  function focusDate(date: Date) {
    if (!isSameMonth(date, visibleMonth)) setVisibleMonth(startOfMonth(date));
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-fk-date="${dateKey(date)}"]`)?.focus();
    });
  }

  function handleDayKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, date: Date) {
    const offsets: Partial<Record<React.KeyboardEvent["key"], number>> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const offset = offsets[event.key];
    if (offset) {
      event.preventDefault();
      focusDate(addDays(date, offset));
      return;
    }
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      focusDate(event.key === "PageUp" ? subMonths(date, 1) : addMonths(date, 1));
    }
  }

  function displayValue() {
    if (selectedValue instanceof Date) return format(selectedValue, "dd.MM.yyyy");
    if (!selectedValue?.from) return placeholder;
    if (!selectedValue.to) return `${format(selectedValue.from, "dd.MM.yyyy")} – …`;
    return `${format(selectedValue.from, "dd.MM.yyyy")} – ${format(selectedValue.to, "dd.MM.yyyy")}`;
  }

  const range = isRange(selectedValue) ? selectedValue : undefined;

  const calendar = (
    <>
      <header className="fk-date-picker__header">
        <button
          aria-label="Vorheriger Monat"
          onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
          type="button"
        >
          <FokunaIcon name="chevron-left" />
        </button>
        <strong id={labelId}>{format(visibleMonth, "MMMM yyyy", { locale: de })}</strong>
        <button
          aria-label="Nächster Monat"
          onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          type="button"
        >
          <FokunaIcon name="chevron-right" />
        </button>
      </header>
      <div aria-label="Kalender" className="fk-date-picker__grid" role="grid">
        {weekDays.map((day) => (
          <span aria-hidden="true" className="fk-date-picker__weekday" key={day}>
            {day}
          </span>
        ))}
        {days.map((day) => {
          const isSingleSelected = selectedValue instanceof Date && isSameDay(day, selectedValue);
          const isRangeStart = Boolean(range?.from && isSameDay(day, range.from));
          const isRangeEnd = Boolean(range?.to && isSameDay(day, range.to));
          const isInRange = Boolean(
            range?.from &&
            range.to &&
            !isBefore(day, startOfDay(range.from)) &&
            !isAfter(day, startOfDay(range.to)),
          );
          const dayDisabled = dateIsDisabled(day);

          return (
            <span className="fk-date-picker__cell" key={dateKey(day)} role="gridcell">
              <button
                aria-label={format(day, "EEEE, d. MMMM yyyy", { locale: de })}
                aria-pressed={isSingleSelected || isRangeStart || isRangeEnd}
                data-fk-date={dateKey(day)}
                data-in-range={isInRange || undefined}
                data-outside={!isSameMonth(day, visibleMonth) || undefined}
                data-range-end={isRangeEnd || undefined}
                data-range-start={isRangeStart || undefined}
                data-selected={isSingleSelected || isRangeStart || isRangeEnd || undefined}
                data-today={isToday(day) || undefined}
                disabled={dayDisabled}
                onClick={() => selectDate(day)}
                onKeyDown={(event) => handleDayKeyDown(event, day)}
                type="button"
              >
                {format(day, "d")}
              </button>
            </span>
          );
        })}
      </div>
      <footer className="fk-date-picker__footer">
        <button onClick={() => selectDate(new Date())} type="button">
          Heute
        </button>
        <span>{format(endOfMonth(visibleMonth), "MMMM", { locale: de })}</span>
      </footer>
    </>
  );

  if (inline) {
    return (
      <div
        aria-label={ariaLabel ?? placeholder}
        className={cn("fk-date-picker", "fk-date-picker--inline", className)}
      >
        {calendar}
      </div>
    );
  }

  return (
    <Popover.Root onOpenChange={setOpen} open={isOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label={ariaLabel ?? placeholder}
          className={cn("fk-date-picker__trigger", className)}
          data-empty={!selectedAnchor || undefined}
          data-invalid={invalid || undefined}
          data-mode={mode}
          data-size={controlSize}
          disabled={disabled}
          type="button"
        >
          <FokunaIcon name="calendar" />
          <span>{displayValue()}</span>
          <FokunaIcon className="fk-date-picker__chevron" name="chevron-down-small" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-labelledby={labelId}
          className="fk-date-picker"
          sideOffset={6}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            focusDate(selectedAnchor ?? new Date());
          }}
        >
          {calendar}
          <Popover.Arrow className="fk-date-picker__arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
