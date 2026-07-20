import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("renders footer navigation items with the same geometry as primary rail items", () => {
    render(
      <Sidebar
        activeId="settings"
        footerItems={[
          { id: "settings", label: "Einstellungen", href: "#settings", icon: "settings-gear" },
        ]}
        items={[{ id: "tasks", label: "Aufgaben", href: "#tasks", icon: "circle-check" }]}
      />,
    );

    const settings = screen.getByRole("link", { name: "Einstellungen" });
    const icon = settings.querySelector("svg");

    expect(settings).toHaveClass("fk-sidebar__item");
    expect(settings).toHaveAttribute("aria-current", "page");
    expect(icon).toHaveAttribute("width", "24");
    expect(icon).toHaveAttribute("height", "24");
    expect(
      screen.getByText("Einstellungen", { selector: ".fk-sidebar__tooltip" }),
    ).toBeInTheDocument();
  });
});
