import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sidebar, SidebarAvatar } from "./sidebar";

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

  it("collapses secondary sections when the chevron is activated", () => {
    render(
      <Sidebar
        items={[{ id: "tasks", label: "Aufgaben", href: "#tasks", icon: "circle-check" }]}
        secondarySections={[
          {
            id: "categories",
            label: "Kategorien",
            items: [{ id: "buy", label: "Kaufen", href: "#buy", badge: "1" }],
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: /Kaufen/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Kategorien einklappen" }));

    expect(screen.queryByRole("link", { name: /Kaufen/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kategorien ausklappen" })).toBeInTheDocument();
  });

  it("renders a profile photo when provided and falls back to the user icon", () => {
    const { rerender } = render(
      <Sidebar
        footer={<SidebarAvatar alt="Demo" src="/pattern-library/demo-profile.png" />}
        items={[{ id: "tasks", label: "Aufgaben", href: "#tasks", icon: "circle-check" }]}
      />,
    );

    expect(screen.getByRole("img", { name: "Demo" })).toHaveAttribute(
      "src",
      "/pattern-library/demo-profile.png",
    );

    rerender(
      <Sidebar
        footer={<SidebarAvatar alt="Demo" />}
        items={[{ id: "tasks", label: "Aufgaben", href: "#tasks", icon: "circle-check" }]}
      />,
    );

    expect(screen.queryByRole("img", { name: "Demo" })).not.toBeInTheDocument();
    expect(document.querySelector(".fk-sidebar__avatar svg")).toBeInTheDocument();
  });
});
