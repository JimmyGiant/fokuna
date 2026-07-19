import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarItem } from "./calendar-items";

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
