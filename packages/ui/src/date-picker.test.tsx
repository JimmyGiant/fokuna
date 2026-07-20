import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("selects a single date and exposes its formatted value", () => {
    render(<DatePicker defaultOpen defaultValue={new Date(2026, 6, 1)} />);

    fireEvent.click(screen.getByRole("button", { name: /20\. Juli 2026/ }));

    expect(screen.getByRole("button", { name: "Datum auswählen" })).toHaveTextContent("20.07.2026");
    expect(screen.queryByRole("grid", { name: "Kalender" })).not.toBeInTheDocument();
  });

  it("supports keyboard movement inside the calendar grid", () => {
    render(<DatePicker defaultOpen defaultValue={new Date(2026, 6, 20)} />);

    const selectedDay = screen.getByRole("button", { name: /20\. Juli 2026/ });
    selectedDay.focus();
    fireEvent.keyDown(selectedDay, { key: "ArrowRight" });

    expect(screen.getByRole("button", { name: /21\. Juli 2026/ })).toHaveFocus();
  });

  it("keeps a range picker open after the end date is selected", () => {
    render(<DatePicker defaultOpen defaultValue={{ from: new Date(2026, 6, 20) }} mode="range" />);

    fireEvent.click(screen.getByRole("button", { name: /24\. Juli 2026/ }));

    expect(screen.getByRole("grid", { name: "Kalender" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Datum auswählen" })).toHaveTextContent(
      "20.07.2026 – 24.07.2026",
    );
  });

  it("renders the calendar directly when used inside another popover", () => {
    const { container } = render(<DatePicker inline />);

    expect(screen.getByRole("grid", { name: "Kalender" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Datum auswählen" })).not.toBeInTheDocument();
    expect(container.querySelector(".fk-date-picker--inline")).toBeInTheDocument();
  });
});
