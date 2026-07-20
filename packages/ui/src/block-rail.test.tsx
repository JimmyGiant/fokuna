import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BlockRail, BlockTile } from "./block-rail";

const items = [
  { id: "reading", label: "Lesen", icon: "newspaper" as const, tone: "coral" as const },
  { id: "focus", label: "Fokus", icon: "focus-target" as const, tone: "teal" as const },
];

describe("BlockRail", () => {
  it("renders selectable block tiles with badges", () => {
    const onActiveChange = vi.fn();
    render(
      <BlockRail
        activeId="focus"
        items={items.map((item) => (item.id === "focus" ? { ...item, badge: 3 } : item))}
        onActiveChange={onActiveChange}
      />,
    );

    const focus = screen.getByRole("button", { name: "Fokus" });
    expect(focus).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("3 offene Einträge")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lesen" }));
    expect(onActiveChange).toHaveBeenCalledWith("reading");
  });

  it("adds disabled empty slots only to the editable rail", () => {
    render(<BlockRail emptySlots={2} items={items} state="editable" />);

    expect(screen.getByRole("navigation", { name: "Zeitblöcke bearbeiten" })).toHaveAttribute(
      "data-state",
      "editable",
    );
    expect(screen.getByRole("button", { name: "Freier Zeitblock-Slot 1" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Zeitblöcke bearbeiten" })).not.toBeInTheDocument();
  });
});

describe("BlockTile", () => {
  it("uses the requested category tone and icon geometry", () => {
    render(<BlockTile icon="focus-target" label="Fokus" tone="teal" />);
    const tile = screen.getByRole("button", { name: "Fokus" });
    const icon = tile.querySelector("svg");

    expect(tile).toHaveAttribute("data-tone", "teal");
    expect(icon).toHaveAttribute("width", "24");
    expect(icon).toHaveAttribute("height", "24");
  });
});
