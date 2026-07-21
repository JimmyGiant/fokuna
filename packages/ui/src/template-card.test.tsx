import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TemplateCard } from "./template-card";

describe("TemplateCard", () => {
  it("renders the Figma Template contract", () => {
    const { container } = render(
      <TemplateCard
        description="Starte mit dem Wichtigsten und gestalte den Rest des Tages bewusst."
        meta={[
          { id: "morning", label: "5 Elemente", icon: "sunrise" },
          { id: "evening", label: "3 Elemente", icon: "sunset" },
        ]}
        title="Eat that Frog"
      />,
    );

    expect(container.querySelector(".fk-template-card")).toHaveAttribute(
      "data-elevation",
      "subtle",
    );
    expect(screen.getByText("Eat that Frog")).toBeInTheDocument();
    expect(screen.getByText("5 Elemente")).toBeInTheDocument();
    expect(screen.getByText("3 Elemente")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mehr Optionen" })).toHaveAttribute(
      "data-size",
      "sm",
    );
    expect(screen.queryByRole("button", { name: "Mehr" })).not.toBeInTheDocument();
  });
});
