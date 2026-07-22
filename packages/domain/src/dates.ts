/**
 * Calendar-day helpers. Always use local wall-clock components — never
 * `Date#toISOString().slice(0, 10)`, which shifts the day in positive UTC offsets.
 */

/** Format a Date as `YYYY-MM-DD` in the local timezone. */
export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's calendar date as `YYYY-MM-DD` (local). */
export function todayIsoDateString(): string {
  return toIsoDateString(new Date());
}
