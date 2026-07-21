import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarItem, getCalendarEntryPosition } from "./calendar-items";

describe("CalendarItem", () => {
  it("separates dragged preview from drop placeholder", () => {
    const { rerender } = render(<CalendarItem kind="block" state="dragged" title="Deep Work" />);
    expect(screen.getByText("Deep Work").closest("[data-state]")).toHaveAttribute(
      "data-state",
      "dragged",
    );

    rerender(<CalendarItem kind="block" state="drag-placeholder" title="Deep Work" />);
    expect(screen.queryByText("Deep Work")).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ablageposition für Deep Work" })).toHaveAttribute(
      "data-state",
      "drag-placeholder",
    );
  });
});

describe("getCalendarEntryPosition", () => {
  /** Marks 07:00…18:00 → 11 intervals (Figma Calendar Drawer). */
  const range = { startHour: 7, hourCount: 11 };

  it("maps a full hour onto exactly one interval between marks", () => {
    const day = new Date(2026, 6, 21);
    const startsAt = new Date(day);
    startsAt.setHours(14, 0, 0, 0);
    const endsAt = new Date(day);
    endsAt.setHours(15, 0, 0, 0);

    const position = getCalendarEntryPosition(startsAt, endsAt, range);

    // 14:00 is 7 hours after 07:00 → 7/11 from top, height 1/11
    expect(position.top).toBe(`${(7 / 11) * 100}%`);
    expect(position.height).toBe(`${(1 / 11) * 100}%`);
  });

  it("clamps entries that start before the visible day", () => {
    const day = new Date(2026, 6, 21);
    const startsAt = new Date(day);
    startsAt.setHours(5, 0, 0, 0);
    const endsAt = new Date(day);
    endsAt.setHours(8, 0, 0, 0);

    const position = getCalendarEntryPosition(startsAt, endsAt, range);

    expect(position.top).toBe("0%");
    expect(position.height).toBe(`${(1 / 11) * 100}%`);
  });
});
