import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ViewOverlay } from "./view-overlay";

describe("ViewOverlay", () => {
  it("renders the Modal Full Screen contract", () => {
    render(
      <ViewOverlay
        defaultOpen
        footerEnd={<button type="button">Speichern</button>}
        footerStart={<button type="button">Löschen</button>}
        icon="notes"
        title="Template Vorlage bearbeiten"
      >
        <p>Inhaltsslot</p>
      </ViewOverlay>,
    );

    expect(screen.getByRole("dialog")).toHaveClass("fk-view-overlay");
    expect(screen.getByText("Template Vorlage bearbeiten")).toBeInTheDocument();
    expect(screen.getByText("Inhaltsslot")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Löschen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Speichern" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Overlay schließen" })).toBeInTheDocument();
  });

  it("forwards close through onOpenChange", () => {
    const onOpenChange = vi.fn();

    render(
      <ViewOverlay onOpenChange={onOpenChange} open title="Ziel bearbeiten">
        <p>Form</p>
      </ViewOverlay>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Overlay schließen" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
