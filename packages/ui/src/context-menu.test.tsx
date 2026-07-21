import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FokunaContextMenu } from "./context-menu";

describe("FokunaContextMenu", () => {
  it("opens on context menu and runs item actions", async () => {
    const onSelect = vi.fn();
    render(
      <FokunaContextMenu
        items={[
          { label: "Bearbeiten", onSelect },
          { type: "separator" },
          { label: "Löschen", destructive: true, onSelect: vi.fn() },
        ]}
      >
        <button type="button">Zeile</button>
      </FokunaContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Zeile" }));
    expect(await screen.findByText("Bearbeiten")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Bearbeiten"));
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders submenu trigger", async () => {
    render(
      <FokunaContextMenu
        items={[
          {
            type: "submenu",
            label: "Priorität",
            children: [
              { label: "Hoch", checked: true },
              { label: "Mittel" },
            ],
          },
        ]}
      >
        <button type="button">Zeile</button>
      </FokunaContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Zeile" }));
    expect(await screen.findByText("Priorität")).toBeInTheDocument();
  });
});
