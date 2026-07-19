import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("uses lowercase variant data attributes", () => {
    render(
      <Button intent="secondary" size="lg">
        Speichern
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Speichern" });

    expect(button).toHaveAttribute("data-intent", "secondary");
    expect(button).toHaveAttribute("data-size", "lg");
    expect(button).toHaveAttribute("data-type", "primary");
  });

  it("marks loading buttons as busy and disabled", () => {
    render(<Button loading>Speichern</Button>);
    const button = screen.getByRole("button", { name: "Speichern" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("keeps icon-only actions accessible", () => {
    render(<Button iconOnly>Hinzufügen</Button>);
    expect(screen.getByRole("button", { name: "Hinzufügen" })).toBeInTheDocument();
  });

  it("uses 24 px icons from large controls onward", () => {
    render(<Button size="lg">Weiter</Button>);
    const icon = screen.getByRole("button", { name: "Weiter" }).querySelector("svg");

    expect(icon).toHaveAttribute("height", "24");
    expect(icon).toHaveAttribute("width", "24");
  });
});
